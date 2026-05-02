const express = require('express');
const router = express.Router();

// @route   GET /api/courier/track/:id
// @desc    Mock API for courier tracking
// @access  Public
router.get('/track/:id', (req, res) => {
    const { id } = req.params;

    const statuses = ['In-Transit', 'Out for Delivery', 'Delivered'];
    // Randomly pick a status
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    // Generate a fake delivery date (between today and 5 days from now)
    const today = new Date();
    const fakeDaysToAdd = Math.floor(Math.random() * 5) + 1; // 1 to 5 days
    const fakeDeliveryDate = new Date(today);
    fakeDeliveryDate.setDate(today.getDate() + fakeDaysToAdd);

    res.json({
        trackingId: id,
        status: randomStatus,
        estimatedDelivery: fakeDeliveryDate.toISOString(),
        courier: 'FastTrack Logistics',
        message: 'This is a mock response simulating a real courier API'
    });
});

module.exports = router;
