// cron/weeklyTopCustomer.js
import cron from 'node-cron';
import Order from '../models/OrderModel.js';
import { getAIReply } from '../helpers/aihelper.js';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE;

// Every Sunday at 6PM
cron.schedule('0 18 * * 0', async () => {
  try {
    const top = await Order.aggregate([
      { $group: { _id: "$customerPhone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 1 }
    ]);

    if (!top.length) return;
    const phone = top[0]._id;

    const message = await getAIReply("Send a warm thank you to our best customer this week.");
    await client.messages.create({
      from: `whatsapp:${twilioPhone}`,
      to: phone,
      body: `🌟 ${message}`
    });

    console.log(`✅ Top customer message sent to ${phone}`);
  } catch (err) {
    console.error("❌ Error in weeklyTopCustomer cron:", err);
  }
});
