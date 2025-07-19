const Menu = require('../models/MenuModel');
const Order = require('../models/OrderModel');
const Vendor = require('../models/VendorModel');
const twilio = require('twilio');
const { Configuration, OpenAIApi } = require('openai');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const client = twilio(accountSid, authToken);

const openai = new OpenAIApi(new Configuration({
  apiKey: process.env.OPENAI_API_KEY
}));

const sessions = {};

// Utility: Check vendor hours
function isVendorOpen(hours, timezone) {
  try {
    const now = new Date().toLocaleString('en-US', { timeZone: timezone });
    const date = new Date(now);
    const day = date.toLocaleDateString('en-US', { weekday: 'long' });
    const hour = date.getHours();

    const todayHours = hours?.[day];
    if (!todayHours) return false;

    const [openHour] = todayHours.open.split(':').map(Number);
    const [closeHour] = todayHours.close.split(':').map(Number);

    return hour >= openHour && hour < closeHour;
  } catch (err) {
    console.error('🕓 Error parsing hours:', err);
    return true;
  }
}

// Utility: AI reply generator
async function getFriendlyReply(vendorName, userMessage, context = '') {
  const prompt = `
You are a friendly WhatsApp assistant for a vendor called "${vendorName}". Respond like a human, casually.

Customer message: "${userMessage}"
${context ? `Context: ${context}` : ''}
Respond as vendor assistant:`.trim();

  const completion = await openai.createChatCompletion({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  });

  return completion.data.choices[0].message.content;
}

// ✅ Main bot handler
exports.handleIncomingMessage = async (req, res) => {
  const incomingMsg = req.body.Body?.trim().toLowerCase();
  const from = req.body.From;
  console.log(`📩 From ${from}: ${incomingMsg}`);
  let response = '';

  try {
    const vendor = await Vendor.findOne();

    if (!vendor) {
      response = '❌ Vendor not found.';
    } else {
      const open = isVendorOpen(vendor.hours, vendor.timezone);
      const plan = vendor.plan || 'free';

      if (incomingMsg === 'menu') {
        const items = await Menu.find();
        if (items.length === 0) {
          response = '😞 No items available right now.';
        } else {
          response = '📋 *Today\'s Menu:*\n' +
            items.map(i => `- ${i.name} - ₦${i.price}`).join('\n');

          if (!open) {
            const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: vendor.timezone });
            const nextOpen = vendor.hours?.[today]?.open || 'soon';
            response += `\n\n⏰ We’re currently closed. We'll open at ${nextOpen}.`;
          }
        }
      }

      else if (incomingMsg.startsWith('order')) {
        if (!open) {
          const today = new Date().toLocaleString('en-US', { weekday: 'long', timeZone: vendor.timezone });
          const nextOpen = vendor.hours?.[today]?.open || 'soon';
          response = `⏳ Sorry, we’re closed right now.\nPlease try again after ${nextOpen}.`;
        } else {
          const orderedItems = incomingMsg.replace('order', '').split('and').map(i => i.trim());
          const menu = await Menu.find().populate('crossSellItems upsellItems');
          const valid = [];
          const invalid = [];
          let total = 0;

          orderedItems.forEach(item => {
            const match = menu.find(m => m.name.toLowerCase() === item.toLowerCase());
            if (match) {
              valid.push({ name: match.name, price: match.price });
              total += match.price;
            } else {
              invalid.push(item);
            }
          });

          let upsellSuggestion = '';
          if (valid.length > 0) {
            // 🧠 AI reply allowed only for Pro/Premium
            if (plan !== 'free') {
              upsellSuggestion = await getFriendlyReply(vendor.name, incomingMsg, `They ordered: ${orderedItems.join(', ')}`);
            } else {
              upsellSuggestion = '🍹 Want to upgrade your experience? Add a drink or side! (Upgrade your plan to auto-suggest extras)';
            }

            response = `🧾 You ordered:\n${valid.map(i => `- ${i.name} - ${vendor.currency || '₦'}${i.price}`).join('\n')}\n\n💰 Total: ${vendor.currency || '₦'}${total}\n\n${upsellSuggestion}\n\nPlease reply with your *name and address* (e.g., Faith, 23 Osagie St).`;
            sessions[from] = { awaitingDetails: true, items: valid, total };
          } else {
            response = `⚠️ No valid items found.\nSend *menu* to see what's available.`;
          }
        }
      }

      else if (sessions[from] && sessions[from].awaitingDetails) {
        const [name, address] = incomingMsg.split(',');
        const session = sessions[from];

        const order = new Order({
          customerName: name?.trim(),
          address: address?.trim(),
          items: session.items,
          customerPhone: from,
          total: session.total
        });

        await order.save();

        const vendorMessage = `🛒 New Order!\n\nItems:\n${session.items.map(i => `- ${i.name} - ${vendor.currency || '₦'}${i.price}`).join('\n')}\n\nCustomer: ${name}\nAddress: ${address}\nPhone: ${from}\n\n💳 Pay to: ${vendor.bankName}\n${vendor.accountNumber}`;

        await client.messages.create({ from: twilioPhone, to: vendor.phone, body: vendorMessage });

        const receiptMessage = `🧾 *Order Receipt* — ${vendor.name}'s Assistant\n\n👤 *Name:* ${name?.trim()}\n📍 *Address:* ${address?.trim()}\n\n📦 *Items:*\n${session.items.map(i => `• ${i.name} - ${vendor.currency || '₦'}${i.price}`).join('\n')}\n\n💰 *Total:* ${vendor.currency || '₦'}${session.total}\n\n🏦 *Pay to:* ${vendor.bankName} - ${vendor.accountNumber}\n\n🕐 You’ll be contacted shortly. Thanks for choosing ${vendor.name}!`;

        await client.messages.create({ from: twilioPhone, to: from, body: receiptMessage });

        response = `✅ Order confirmed for *${name?.trim()}*.\nWe’ve sent your order to the vendor. You'll receive a receipt shortly!`;
        delete sessions[from];
      }

      else {
        // Free plan = No GPT smart replies
        if (plan === 'free') {
          response = `👋 Welcome to ${vendor.name}'s Assistant!\nSend *menu* to browse or *order rice and burger* to place an order.\n\nUpgrade to Pro for smarter replies and features.`;
        } else {
          response = await getFriendlyReply(vendor.name, incomingMsg);
        }
      }
    }

    const twiml = `<Response><Message>${response}</Message></Response>`;
    res.set('Content-Type', 'text/xml');
    res.send(twiml);
  } catch (err) {
    console.error('❌ Bot error:', err.message);
    res.status(500).send('Server error');
  }
};
