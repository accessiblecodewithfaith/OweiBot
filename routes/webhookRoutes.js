// routes/webhookRoutes.js

import express from 'express';
const router = express.Router();

// 🧪 Mock webhook route for testing
router.post('/stripe', async (req, res) => {
  res.json({ message: '✅ Mock Stripe webhook received' });
});

router.post('/paystack', async (req, res) => {
  res.json({ message: '✅ Mock Paystack webhook received' });
});

router.post('/flutterwave', async (req, res) => {
  res.json({ message: '✅ Mock Flutterwave webhook received' });
});

export default router;
