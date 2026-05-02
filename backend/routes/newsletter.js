const express = require('express');
const router = express.Router();
const Newsletter = require('../models/Newsletter');
const auth = require('../middleware/authMiddleware');
const sendEmail = require('../utils/sendEmail');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    console.log('Newsletter subscription attempt for:', email);
    
    if (!email || !email.includes('@')) {
      console.warn('Invalid email provided:', email);
      return res.status(400).json({ message: 'Valid email is required' });
    }

    // Check if already exists in the newsletter collection
    const existing = await Newsletter.findOne({ email: email.toLowerCase() });
    if (existing) {
      console.log('Email already subscribed:', email);
      return res.status(200).json({ message: 'Email already subscribed' }); // Return 200 instead of 400 for better UX
    }

    const subscription = new Newsletter({ email: email.toLowerCase() });
    await subscription.save();
    
    console.log('Subscribed successfully:', email);
    res.status(201).json({ message: 'Subscribed successfully' });
  } catch (error) {
    console.error('Newsletter Route Error Detail:', {
      message: error.message,
      stack: error.stack,
      email: req.body.email
    });
    res.status(500).json({ 
      message: 'Server error during subscription', 
      error: error.message 
    });
  }
});

// @desc    Send Campaign to all subscribers
// @route   POST /api/newsletter/send-campaign
// @access  Private/Admin
router.post('/send-campaign', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }

  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required' });
    }

    const subscribers = await Newsletter.find();
    
    if (subscribers.length === 0) {
      return res.status(400).json({ message: 'No subscribers found' });
    }

    // Prepare campaign email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">${subject}</h2>
        <div style="color: #555; line-height: 1.6; margin-top: 20px;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #888; text-align: center;">
          You are receiving this email because you subscribed to our newsletter. 
          If you no longer wish to receive these emails, you can unsubscribe at any time.
        </p>
      </div>
    `;

    // Send emails (In a production app, use a queue or batch sending)
    const emailPromises = subscribers.map(sub => 
      sendEmail({
        email: sub.email,
        subject: subject,
        html: html
      })
    );

    await Promise.all(emailPromises);

    res.json({ message: `Campaign sent successfully to ${subscribers.length} subscribers` });
  } catch (error) {
    console.error('Send Campaign Error:', error);
    res.status(500).json({ message: 'Failed to send campaign', error: error.message });
  }
});

// @desc    Get all subscribers (for admin)
// @route   GET /api/newsletter
// @access  Private/Admin
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Not authorized as admin' });
  }
  try {
    const subscribers = await Newsletter.find().sort({ subscribedAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
