import express from 'express';
import twilio from 'twilio';

const router = express.Router();

// Load Twilio config from environment
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Test WhatsApp route
router.get('/test-whatsapp', async (req, res) => {
  try {
    const message = await client.messages.create({
      body: '👋 Hello from OweiBot via WhatsApp!',
      from: 'whatsapp:+14155238886', // Twilio Sandbox number
      to: 'whatsapp:+23491389563'     // Replace with actual test number
    });

    res.json({ success: true, sid: message.sid });
  } catch (error) {
    console.error('❌ WhatsApp Error:', error.message);
    res.status(500).json({ error: 'Failed to send WhatsApp message' });
  }
});

export default router;
