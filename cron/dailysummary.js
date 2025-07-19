import cron from 'node-cron';
import Order from '../models/OrderModel.js';
import Vendor from '../models/VendorModel.js';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendDailySummary = async () => {
  const vendors = await Vendor.find({ isVerified: true });

  for (const vendor of vendors) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orders = await Order.find({
      vendor: vendor._id,
      createdAt: { $gte: today }
    });

    const totalRevenue = orders.reduce((sum, o) => 
      sum + o.items.reduce((s, i) => s + i.priceNum, 0), 0);

    const msg = `📊 Daily Summary for ${vendor.businessName}:
🛒 Orders: ${orders.length}
💰 Revenue: ${vendor.currency || '₦'}${totalRevenue}`;

    if (vendor.whatsappOrdersEnabled) {
      await client.messages.create({
        from: process.env.TWILIO_PHONE,
        to: vendor.phone,
        body: msg
      });
    }
  }
};

// Schedule at 9 PM daily
cron.schedule('0 21 * * *', sendDailySummary);
