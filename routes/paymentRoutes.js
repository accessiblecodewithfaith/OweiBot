// routes/paymentRoutes.js

import express from 'express';
// import axios from 'axios';
// import Stripe from 'stripe';

const router = express.Router();

// 👇 MOCK Payment Routes for Testing Only

router.post('/stripe', async (req, res) => {
  res.json({
    message: '✅ Mock Stripe session created',
    url: 'https://mock-stripe.com/success'
  });
});

router.post('/paystack', async (req, res) => {
  res.json({
    message: '✅ Mock Paystack session created',
    url: 'https://mock-paystack.com/success'
  });
});

router.post('/flutterwave', async (req, res) => {
  res.json({
    message: '✅ Mock Flutterwave session created',
    url: 'https://mock-flutterwave.com/success'
  });
});

export default router;
