// routes/botRoutes.js

import express from 'express';
import twilio from 'twilio';
import Order from '../models/OrderModel.js';
import Menu from '../models/MenuModel.js';
import Vendor from '../models/VendorModel.js';
import formatCurrency from '../utils/currencyHelper.js';
import { getAIReply } from '../utils/openaiHelper.js';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const fromWhatsApp = `whatsapp:${twilioPhone}`;
const client = twilio(accountSid, authToken);

export default function botRoutes(reqSessions = {}, menuObj = {}) {
  const router = express.Router();

  router.use(express.urlencoded({ extended: false }));
  router.use(express.json());

  router.post('/webhook', async (req, res) => {
    const incomingMsg = req.body.Body?.trim();
    const from = req.body.From;
    let response = '';

    console.log(`📨 From ${from}: ${incomingMsg}`);

    if (!incomingMsg || !from) {
      return res.send(`<Response><Message>Invalid request</Message></Response>`);
    }

    const vendor = await Vendor.findOne({ optedOut: false });
    if (!vendor) {
      response = '❌ No vendor available to take orders at the moment.';
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${response}</Message></Response>`);
    }

    // Always notify vendor
    await client.messages.create({
      from: fromWhatsApp,
      to: `whatsapp:${vendor.phone}`,
      body: `💬 New message from ${from}:\n"${incomingMsg}"`
    });

    if (!vendor.autoRespond) {
      response = `✅ Message received. Our team will respond shortly.`;
    } else if (incomingMsg.toLowerCase() === 'menu') {
      const menus = await Menu.find({ vendor: vendor._id });
      if (!menus.length) {
        response = '🍽️ No menus available at the moment.';
      } else {
        response = `🍽️ ${vendor.businessName} Menu:\n`;
        menus.forEach(item => {
          response += `- ${item.name} - ${formatCurrency(item.price)}\n`;
        });
      }
    } else if (incomingMsg.toLowerCase().startsWith('order')) {
      const itemsRequested = incomingMsg.replace(/order/i, '').split('and').map(i => i.trim());
      const menuItems = await Menu.find({ vendor: vendor._id });

      const validItems = [], invalidItems = [];
      for (let name of itemsRequested) {
        const found = menuItems.find(m => m.name.toLowerCase() === name.toLowerCase());
        if (found) {
          validItems.push({ name: found.name, price: formatCurrency(found.price), priceNum: found.price });
        } else {
          invalidItems.push(name);
        }
      }

      if (validItems.length) {
        reqSessions[from] = { awaitingDetails: true, items: validItems, vendorId: vendor._id };
        response = `🛒 You ordered:\n${validItems.map(i => `- ${i.name} - ${i.price}`).join('\n')}\n\nPlease type your *name and address* (e.g., Faith, 23 Osagie St)`;
      } else {
        response = '❌ No valid items found. Send *menu* to see options.';
      }
    } else if (reqSessions[from]?.awaitingDetails) {
      const details = incomingMsg.split(',');
      const name = details[0]?.trim();
      const address = details[1]?.trim() || 'Unspecified';

      const { vendorId, items } = reqSessions[from];
      const orderData = {
        customerPhone: from,
        customerName: name,
        deliveryAddress: address,
        items,
        vendor: vendorId,
        status: 'pending',
      };

      try {
        const order = new Order(orderData);
        await order.save();

        await client.messages.create({
          from: fromWhatsApp,
          to: `whatsapp:${vendor.phone}`,
          body: `📦 Order from ${name}:\n${items.map(i => `- ${i.name} (${i.price})`).join('\n')}\n📍 ${address}\n📱 ${from}`
        });

        const total = items.reduce((sum, i) => sum + i.priceNum, 0);
        response = `✅ Order confirmed with ${vendor.businessName}!\nPlease send ₦${total} to: ${vendor.accountNumber}`;
        delete reqSessions[from];
      } catch (err) {
        console.error('❌ Order error:', err);
        response = '❌ Could not process order.';
      }
    } else {
      try {
        response = await getAIReply(incomingMsg, vendor.businessName);
      } catch (err) {
        console.error('❌ AI response error:', err);
        response = '🤖 Sorry, I had trouble understanding. Try "menu" or "order rice".';
      }
    }

    res.set('Content-Type', 'text/xml');
    res.send(`<Response><Message>${response}</Message></Response>`);
  });

  return router;
}
