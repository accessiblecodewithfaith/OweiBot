// routes/promoGenerator.js
import express from 'express';
import { getAIReply } from '../helpers/aihelper.js';

const router = express.Router();

router.post('/generate-promo', async (req, res) => {
  const { item, discount, vendorName } = req.body;
  try {
    const prompt = `Write a short, exciting WhatsApp promo for ${vendorName}. ${discount}% off ${item} this weekend.`;
    const reply = await getAIReply(prompt, vendorName);
    res.json({ promo: reply });
  } catch (err) {
    console.error("❌ Promo error:", err);
    res.status(500).send("Failed to generate promo");
  }
});

export default router;
