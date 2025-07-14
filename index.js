const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

// Sample menu
const menu = {
  rice: 1500,
  burger: 2500,
  pizza: 3000,
  noodles: 1200
};

// Store user sessions
const sessions = {};

// Parse incoming POST data
app.use(bodyParser.urlencoded({ extended: false }));

// Webhook route for Twilio
app.post('/webhook', (req, res) => {
  const incomingMsg = req.body.Body?.trim().toLowerCase();
  const from = req.body.From;

  console.log(`📥 Message from ${from}: ${incomingMsg}`);
  let response = '';

  if (sessions[from] && sessions[from].awaitingDetails) {
    sessions[from].details = incomingMsg;
    response = `✅ Order confirmed for ${incomingMsg.split(',')[0].trim()}.\nDelivery to ${incomingMsg.split(',')[1]?.trim() || 'your address'}.\nVendor will contact you shortly.`;
    delete sessions[from]; // End session
  }
  else if (incomingMsg === 'menu') {
    response = '🍽️ OweiBot Menu:\n';
    for (const item in menu) {
      response += `- ${item} - ₦${menu[item]}\n`;
    }
  }
  else if (incomingMsg?.startsWith('order')) {
    const items = incomingMsg.replace('order', '').split('and').map(i => i.trim());
    const valid = [], invalid = [];

    items.forEach(item => {
      if (menu[item]) valid.push(`${item} - ₦${menu[item]}`);
      else invalid.push(item);
    });

    if (valid.length > 0) {
      response = `🛒 You ordered:\n${valid.join('\n')}\n\nPlease type your *name and address* (e.g., Faith, 23 Osagie St).`;
      sessions[from] = { awaitingDetails: true, items: valid };
    } else {
      response = `❌ Sorry, none of the items are valid.\nSend *menu* to see options.`;
    }
  }
  else {
    response = '👋 Hi! Send *menu* to see meals.\nOr *order rice and burger* to place an order.';
  }

  const twiml = `<Response><Message>${response}</Message></Response>`;
  res.set('Content-Type', 'text/xml');
  res.send(twiml);
});

app.listen(PORT, () => {
  console.log(`🚀 OweiBot running on port ${PORT}`);
});
