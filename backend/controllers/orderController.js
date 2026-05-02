const Order = require('../models/Order');
const Product = require('../models/Product');
const Stripe = require('stripe');
const axios = require('axios');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const generateInvoiceBuffer = require('../utils/generateInvoice');
const User = require('../models/User');
const Settings = require('../models/Settings');

// --- Helpers ---

const getCurrency = async () => {
    try {
        const settings = await Settings.findOne();
        return settings?.currency?.symbol || 'Rs.';
    } catch (error) {
        return 'Rs.';
    }
};

const getStripe = () => {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is missing in .env");
    return new Stripe(key);
};

const automateStatusTransition = (orderId) => {
    // Shipped after 1 minute
    setTimeout(async () => {
        try {
            const order = await Order.findById(orderId).populate('user');
            if (order && order.status === 'Processing') {
                order.status = 'Shipped';
                await order.save();
                
                // --- Notification: Order Shipped ---
                if (order.user && order.user.email) {
                    const invoiceBuffer = await generateInvoiceBuffer(order);
                    await sendEmail({
                        email: order.user.email,
                        subject: `Order #${order._id.toString().slice(-6).toUpperCase()} has been Shipped!`,
                        html: `
                            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                <h2 style="color: #3b82f6;">Your Order is on its way!</h2>
                                <p>Hi ${order.user.username || 'Customer'},</p>
                                <p>Good news! Your order <b>#${order._id.toString().slice(-6).toUpperCase()}</b> has been shipped and is heading your way.</p>
                                
                                <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                    <p style="margin: 5px 0;"><b>Order ID:</b> #${order._id}</p>
                                    <p style="margin: 5px 0;"><b>Shipping Tracking ID:</b> ${order._id}</p>
                                    <p style="margin: 5px 0;"><b>Courier:</b> FastTrack Logistics</p>
                                </div>

                                <p>You can find your invoice attached to this email.</p>
                                <p>Thank you for shopping with us!</p>
                            </div>
                        `,
                        attachments: [
                            {
                                filename: `Invoice_${order._id.toString().slice(-6).toUpperCase()}.pdf`,
                                content: invoiceBuffer
                            }
                        ]
                    });
                }
                
                // Delivered after another 1 minute
                setTimeout(async () => {
                    const finalOrder = await Order.findById(orderId).populate('user');
                    if (finalOrder && finalOrder.status === 'Shipped') {
                        finalOrder.status = 'Delivered';
                        finalOrder.isDelivered = true;
                        await finalOrder.save();

                        // --- Notification: Order Delivered ---
                        if (finalOrder.user && finalOrder.user.email) {
                            await sendEmail({
                                email: finalOrder.user.email,
                                subject: `Order #${finalOrder._id.toString().slice(-6).toUpperCase()} Delivered!`,
                                html: `
                                    <div style="font-family: Arial, sans-serif; padding: 20px;">
                                        <h2>Order Delivered!</h2>
                                        <p>Hi ${finalOrder.user.username || 'Customer'},</p>
                                        <p>Your order <b>#${finalOrder._id.toString().slice(-6).toUpperCase()}</b> has been successfully delivered.</p>
                                        <p>We hope you love your new purchase! If you have any questions, feel free to contact us.</p>
                                        <p>Best regards,<br>Lumiere Team</p>
                                    </div>
                                `
                            });
                        }
                    }
                }, 60000);
            }
        } catch (err) {
            console.error("Status transition error:", err);
        }
    }, 60000);
};

// --- Controller Functions ---

// Helper function to decrement stock
const decrementProductStock = async (orderItems) => {
    try {
        for (const item of orderItems) {
            // Using the product field which stores the ID in our model
            const productId = item.product || item._id || item.id;
            if (!productId) {
                console.error("Product ID missing for item:", item.name);
                continue;
            }
            const product = await Product.findById(productId);
            if (product) {
                product.stock = Math.max(0, (product.stock || 0) - item.quantity);
                await product.save();
                console.log(`Stock decremented for ${product.name}. Remaining: ${product.stock}`);
            }
        }
    } catch (error) {
        console.error("Stock decrement error:", error.message);
    }
};

// @desc    Rule-Based Suggestions (Fast algorithm logic)
exports.getProductSuggestions = async (req, res) => {
    try {
        const { cartItems, userBudget } = req.body;
        if (!cartItems || cartItems.length === 0) return res.json({ success: true, suggestions: [] });

        const allProducts = await Product.find({}).lean();
        const currencySymbol = await getCurrency();
        let suggestions = [];

        cartItems.forEach(item => {
            const alternative = allProducts.find(p => 
                p.category === item.category && 
                p.price < item.price && 
                p._id.toString() !== (item._id || item.id).toString()
            );

            if (alternative) {
                suggestions.push({
                    originalId: item._id || item.id,
                    suggestedId: alternative._id,
                    originalProduct: item,
                    suggestedProduct: alternative,
                    reason: `Save ${currencySymbol} ${item.price - alternative.price} on this item!`,
                    priceDifference: item.price - alternative.price
                });
            }
        });

        res.json({ 
            success: true, 
            suggestions: suggestions.sort((a,b) => b.priceDifference - a.priceDifference).slice(0, 3) 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Create Order (COD / Pending)
exports.createOrder = async (req, res) => {
    try {
        const { orderItems, shippingAddress, phone, totalPrice, paymentMethod, deliveryCost } = req.body;
        const userId = req.user.id || req.user._id;

        const order = new Order({
            user: userId,
            orderItems,
            shippingAddress,
            phone,
            totalPrice,
            deliveryCost: deliveryCost || 0,
            paymentMethod: paymentMethod || 'Cash on Delivery',
            status: paymentMethod === 'Cash on Delivery' ? 'Processing' : 'Pending'
        });

        const createdOrder = await order.save();
        
        // Decrement stock for successful order
        await decrementProductStock(orderItems);
        
        const currencySymbol = await getCurrency();

        if(order.status === 'Processing') automateStatusTransition(createdOrder._id);
        
        res.status(201).json(createdOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Verify Safepay Payment
exports.verifyPayment = async (req, res) => {
    try {
        const { tracker, orderId, sig } = req.body;
        const order = await Order.findById(orderId);

        if (!order) return res.status(404).json({ success: false, message: "Order not found" });

        let isVerified = false;

        // Sandbox Auto-Verify
        if (process.env.SAFEPAY_ENVIRONMENT === 'sandbox' && tracker) {
            isVerified = true;
        }

        // Signature Verify
        if (!isVerified && sig && process.env.SAFEPAY_SECRET_KEY) {
            const expectedSig = crypto.createHmac('sha256', process.env.SAFEPAY_SECRET_KEY).update(tracker).digest('hex');
            if (sig === expectedSig) isVerified = true;
        }

        if (isVerified) {
            order.status = 'Processing';
            order.isPaid = true;
            order.paidAt = Date.now();
            order.paymentMethod = 'Safepay';
            order.metadata = { ...order.metadata, safepayTracker: tracker };

            // --- Notification: Payment Success ---
            const userForEmail = await User.findById(order.user);
            const currencySymbol = await getCurrency();

            if (userForEmail && userForEmail.email) {
                const invoiceBuffer = await generateInvoiceBuffer(order);
                await sendEmail({
                    email: userForEmail.email,
                    subject: `Payment Successful - Order #${order._id.toString().slice(-6).toUpperCase()}`,
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2ecc71;">Payment Successful!</h2>
                            <p>Hi ${userForEmail.username || 'Customer'},</p>
                            <p>We have received your payment for order <b>#${order._id.toString().slice(-6).toUpperCase()}</b>.</p>
                            <p>Your order is now being processed and will be shipped soon.</p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Items Subtotal:</span>
                                <b>${currencySymbol} ${(order.totalPrice - (order.deliveryCost || 0)).toLocaleString()}</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Delivery Fee:</span>
                                <b>${currencySymbol} ${(order.deliveryCost || 0).toLocaleString()}</b>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 10px; border-top: 1px dashed #eee; padding-top: 10px;">
                                <span>Total Paid:</span>
                                <b style="font-size: 18px; color: #111;">${currencySymbol} ${order.totalPrice.toLocaleString()}</b>
                            </div>
                            <p style="margin-top: 20px;">Please find your payment receipt attached to this email.</p>
                            <p>Thank you for choosing Lumiere!</p>
                        </div>
                    `,
                    attachments: [
                        {
                            filename: `Receipt_${order._id.toString().slice(-6).toUpperCase()}.pdf`,
                            content: invoiceBuffer
                        }
                    ]
                });
            }

            // --- ADDED: Budget Alert Logic ---
            // Checking if order price is higher than user's set income/budget
            if (req.user && req.user.income && order.totalPrice > req.user.income) {
                console.log("Budget Alert: User paid " + currencySymbol + " " + order.totalPrice + " which is more than set budget of " + currencySymbol + " " + req.user.income);
                // Future extension: You can also add admin notification code here
            }

            await order.save();

            // Automation
            automateStatusTransition(order._id);

            res.json({ success: true, message: "Payment Verified", order });
        } else {
            res.status(400).json({ success: false, message: "Verification Failed" });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// @desc    Safepay Init (Get tracker)
exports.initSafepayPayment = async (req, res) => {
    try {
        const { amount, currency, redirect_url, cancel_url, orderId } = req.body;
        const env = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
        const url = `https://${env === 'production' ? 'api' : 'sandbox.api'}.getsafepay.com/order/v1/init`;

        const response = await axios.post(url, {
            client: process.env.SAFEPAY_API_KEY,
            amount: Number(amount),
            currency: currency || 'PKR',
            environment: env,
            redirect_url,
            cancel_url,
            order_id: orderId
        });

        if (response.data?.status?.message === 'success') {
            res.json({ tracker: response.data.data.token });
        } else {
            throw new Error("Safepay Init Failed");
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Poll Safepay Tracker Status
exports.checkSafepayStatus = async (req, res) => {
    try {
        const { tracker } = req.params;
        const env = process.env.SAFEPAY_ENVIRONMENT || 'sandbox';
        const url = `https://${env === 'production' ? 'api' : 'sandbox.api'}.getsafepay.com/order/v1/${tracker}`;

        const response = await axios.get(url);

        if (response.data && response.data.data) {
            const state = response.data.data.state;
            if (state === 'PAID' || state === 'TRACKER_ENDED') {
                return res.json({ paid: true, state: state });
            }
            return res.json({ paid: false, state: state });
        }
        res.json({ paid: false });
    } catch (error) {
        console.error("Safepay Poll Error:", error.message);
        res.json({ paid: false }); // Do not throw error on frontend polling
    }
};

// @desc    Admin: Get All Orders
exports.getOrders = async (req, res) => {
    try {
        const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    User: Get My Orders
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id || req.user._id }).sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update Status
exports.updateOrderStatus = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user');
        if (order) {
            const oldStatus = order.status;
            order.status = req.body.status;
            if (req.body.status === 'Delivered') order.isDelivered = true;
            const updated = await order.save();

            // --- Manual Status Change Notifications ---
            if (order.user && order.user.email && oldStatus !== updated.status) {
                console.log(`Status changed from ${oldStatus} to ${updated.status}. Attempting to send email to ${order.user.email}...`);
                
                try {
                    const customerName = order.user.username || order.user.name || 'Customer';
                    
                    if (updated.status === 'Shipped') {
                        const invoiceBuffer = await generateInvoiceBuffer(updated);
                        const emailSent = await sendEmail({
                            email: order.user.email,
                            subject: `Order #${updated._id.toString().slice(-6).toUpperCase()} Shipped`,
                            html: `
                                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                    <h2 style="color: #3b82f6;">Order Shipped!</h2>
                                    <p>Hi ${customerName}, Your order <b>#${updated._id.toString().slice(-6).toUpperCase()}</b> is now Shipped.</p>
                                    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
                                        <p style="margin: 5px 0;"><b>Order ID:</b> #${updated._id}</p>
                                        <p style="margin: 5px 0;"><b>Shipping Tracking ID:</b> ${updated._id}</p>
                                        <p style="margin: 5px 0;"><b>Courier:</b> FastTrack Logistics</p>
                                    </div>
                                    <p>Your invoice is attached to this email.</p>
                                </div>
                            `,
                            attachments: [{ filename: `Invoice_${updated._id.toString().slice(-6).toUpperCase()}.pdf`, content: invoiceBuffer }]
                        });
                        console.log(`Shipped email sent status: ${emailSent}`);
                    } else if (updated.status === 'Delivered') {
                        const emailSent = await sendEmail({
                            email: order.user.email,
                            subject: `Order #${updated._id.toString().slice(-6).toUpperCase()} Delivered`,
                            html: `
                                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                                    <h2 style="color: #10b981;">Order Delivered!</h2>
                                    <p>Hi ${customerName},</p>
                                    <p>Your order <b>#${updated._id.toString().slice(-6).toUpperCase()}</b> has been successfully Delivered!</p>
                                    <p>Thank you for shopping with us!</p>
                                </div>
                            `
                        });
                        console.log(`Delivered email sent status: ${emailSent}`);
                    }
                } catch (emailErr) {
                    console.error("Failed to send status update email:", emailErr);
                }
            }

            res.json(updated);
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete Order
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      await order.deleteOne();
      res.json({ message: 'Order removed' });
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};