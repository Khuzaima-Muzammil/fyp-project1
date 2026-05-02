const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const orderController = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

// --------------------------------------------------------
// 1. Stripe & Safepay Checkout
// --------------------------------------------------------
// router.post('/create-checkout-session', auth, orderController.createCheckoutSession);
// router.post('/safepay-success', auth, orderController.safepaySuccess);
router.post('/safepay-init', auth, orderController.initSafepayPayment);
router.post('/verify-payment', auth, orderController.verifyPayment);
router.get('/safepay-status/:tracker', auth, orderController.checkSafepayStatus);

// --------------------------------------------------------
// 2. Order Management
// --------------------------------------------------------
router.post('/', auth, orderController.createOrder);
router.get('/myorders', auth, orderController.getMyOrders);
router.get('/', auth, orderController.getOrders);
router.put('/:id/status', auth, orderController.updateOrderStatus);
router.delete('/:id', auth, orderController.deleteOrder);

module.exports = router;
