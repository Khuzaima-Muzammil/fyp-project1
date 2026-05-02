const PDFDocument = require('pdfkit');

/**
 * Generates a professional PDF invoice for an order.
 * @param {Object} order - The order document from MongoDB.
 * @returns {Promise<Buffer>} - A promise that resolves with the PDF buffer.
 */
const generateInvoiceBuffer = (order) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let buffers = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfBuffer = Buffer.concat(buffers);
                resolve(pdfBuffer);
            });

            // --- Header ---
            doc.fillColor('#111')
               .fontSize(25)
               .text('LUMIERE', 50, 50, { align: 'left' })
               .fontSize(10)
               .text('E-Commerce Fashion Store', 50, 80)
               .fontSize(12)
               .text(`Invoice #: ${order._id.toString().slice(-6).toUpperCase()}`, 400, 50, { align: 'right' })
               .text(`Date: ${new Date().toLocaleDateString()}`, 400, 65, { align: 'right' })
               .moveDown();

            // Horizontal Line
            doc.moveTo(50, 100).lineTo(550, 100).stroke('#eee');

            // --- Customer Info ---
            doc.moveDown()
               .fontSize(14)
               .fillColor('#333')
               .text('Billed To:', 50, 120)
               .fontSize(10)
               .fillColor('#666')
               .text(`Phone: +92 ${order.phone}`, 50, 140)
               .text(`Address: ${order.shippingAddress}`, 50, 155, { width: 300 });

            // --- Order Items Table ---
            const tableTop = 210;
            doc.fontSize(12).fillColor('#111').text('Product', 50, tableTop);
            doc.text('Qty', 300, tableTop, { width: 50, align: 'center' });
            doc.text('Price', 380, tableTop, { width: 80, align: 'right' });
            doc.text('Total', 480, tableTop, { width: 70, align: 'right' });

            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#eee');

            let currentY = tableTop + 30;
            order.orderItems.forEach(item => {
                doc.fontSize(10).fillColor('#666')
                   .text(item.name, 50, currentY, { width: 240 })
                   .text(item.quantity.toString(), 300, currentY, { width: 50, align: 'center' })
                   .text(`Rs. ${item.price.toLocaleString()}`, 380, currentY, { width: 80, align: 'right' })
                   .text(`Rs. ${(item.price * item.quantity).toLocaleString()}`, 480, currentY, { width: 70, align: 'right' });
                
                currentY += 25;
            });

            // --- Summary ---
            doc.moveTo(50, currentY).lineTo(550, currentY).stroke('#eee');
            currentY += 15;

            // Subtotal
            const subtotal = order.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
            doc.fontSize(10).fillColor('#666')
               .text('Subtotal:', 380, currentY, { width: 80, align: 'right' })
               .text(`Rs. ${subtotal.toLocaleString()}`, 480, currentY, { width: 70, align: 'right' });
            
            currentY += 20;

            // Delivery Fee
            if (order.deliveryCost && order.deliveryCost > 0) {
                doc.text('Delivery Fee:', 380, currentY, { width: 80, align: 'right' })
                   .text(`Rs. ${order.deliveryCost.toLocaleString()}`, 480, currentY, { width: 70, align: 'right' });
                currentY += 20;
            }

            doc.moveTo(430, currentY).lineTo(550, currentY).stroke('#eee');
            currentY += 10;

            doc.fontSize(12).fillColor('#111')
               .text('Grand Total:', 380, currentY, { width: 80, align: 'right' })
               .fontSize(14)
               .text(`Rs. ${order.totalPrice.toLocaleString()}`, 480, currentY - 2, { width: 70, align: 'right', font: 'Helvetica-Bold' });

            // --- Footer ---
            doc.fontSize(10).fillColor('#aaa')
               .text('Thank you for shopping with Lumiere!', 0, 700, { align: 'center', width: 600 });

            doc.end();
        } catch (error) {
            reject(error);
        }
    });
};

module.exports = generateInvoiceBuffer;
