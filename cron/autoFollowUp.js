import cron from 'node-cron';
import Order from '../models/OrderModel.js';
import Vendor from '../models/VendorModel.js';
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
const twilioPhone = process.env.TWILIO_PHONE;

// Run every hour
cron.schedule('0 * * * *', async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      followUpSent: false,
      createdAt: { $lte: oneDayAgo }
    });

    for (const order of orders) {
      const vendor = await Vendor.findOne({ phone: order.vendorPhone });
      if (!vendor) continue;

      const message = `👋 Hope you enjoyed your meal, ${order.customerName || ''}!\n\nTo order again, just reply:\n*order ${order.items.map(i => i.name).join(' and ')}*\n\nThanks for choosing OweiBot 💚`;

      await client.messages.create({
        from: twilioPhone,
        to: order.customerPhone,
        body: message
      });

      order.followUpSent = true;
      await order.save();

      console.log(`✅ Follow-up sent to ${order.customerPhone}`);
    }
  } catch (err) {
    console.error('❌ Auto Follow-up Error:', err.message);
  }
});
