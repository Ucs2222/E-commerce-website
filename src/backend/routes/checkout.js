const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const nodemailer = require('nodemailer');
const db = require('../db'); // your DB connection module
const authenticate = require('../middleware/authenticate'); // your auth middleware
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Protect the route with authentication middleware
router.post('/pay', authenticate, async (req, res) => {
  const { paymentToken, amount } = req.body;
  const userId = req.user.id;

  try {
    // Fetch user email from database
    const [rows] = await db.query('SELECT email FROM users WHERE id = ?', [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const userEmail = rows[0].email;

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(parseFloat(amount) * 100),
      currency: 'inr',
      payment_method: paymentToken,
      confirm: true,
    });

    // Send confirmation email
    await transporter.sendMail({
      from: process.env.EMAIL_ADDRESS,
      to: userEmail,
      subject: 'Your Order is Confirmed!',
      text: `Thank you for your payment of ₹${amount}.`,
    });

    res.json({ success: true, paymentIntentId: paymentIntent.id });
  } catch (err) {
    console.error('Payment error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
