// utils/paymentReminder.js
import twilio from 'twilio';
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhone = process.env.TWILIO_PHONE;

export async function sendPaymentReminder(order, vendor) {
  setTimeout(async () => {
    try {
      const refreshedOrder = await order.constructor.findById(order._id);
      if (refreshedOrder.status === 'pending') {
        const msg = `⏰ Reminder: You have a pending order with ${vendor.businessName}. Please confirm payment.`;
        await client.messages.create({
          from: `whatsapp:${twilioPhone}`,
          to: order.customerPhone,
          body: msg
        });
        console.log(`✅ Reminder sent to ${order.customerPhone}`);
      }
    } catch (err) {
      console.error("❌ Reminder error:", err);
    }
  }, 2 * 60 * 60 * 1000); // 2 hours
}
