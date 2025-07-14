import Order from '../models/OrderModel.js';
import Vendor from '../models/VendorModel.js';
import twilio from 'twilio';

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE;

export const sendFollowUps = async () => {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $lte: oneDayAgo },
      followUpSent: false
    });

    for (const order of orders) {
      const vendor = await Vendor.findOne(); // or filter by order.vendor if available

      const message = `👋 Hi ${order.customerName}, hope you enjoyed your meal yesterday!\n\nWould you like to reorder or try something new today?\n\nReply *menu* or *order rice and burger* to continue.`;

      await client.messages.create({
        from: twilioPhone,
        to: order.customerPhone,
        body: message
      });

      order.followUpSent = true;
      await order.save();
    }

    console.log(`✅ Sent follow-ups for ${orders.length} orders.`);
  } catch (err) {
    console.error('❌ Follow-up job error:', err);
  }
};
