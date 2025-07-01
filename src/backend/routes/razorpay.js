// routes/razorpay.js
const express = require('express');
const https = require('https');
const router = express.Router();

// Replace with your Razorpay keys
const RAZORPAY_KEY_ID = 'rzp_test_EH1UEwLILEPXCj';
const RAZORPAY_KEY_SECRET = 'ppM7JhyVpBtycmMcFGxYdacw';

router.post('/create-order', (req, res) => {
  const { amount } = req.body;

  const orderData = JSON.stringify({
    amount: amount,
    currency: 'INR',
    receipt: 'receipt_order_' + Math.random().toString(36).substring(7),
  });

  const options = {
    hostname: 'api.razorpay.com',
    path: '/v1/orders',
    method: 'POST',
    auth: `${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`,
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(orderData),
    },
  };

  const request = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => (data += chunk));
    response.on('end', () => res.json(JSON.parse(data)));
  });

  request.on('error', (error) => res.status(500).send(error));
  request.write(orderData);
  request.end();
});

module.exports = router;
