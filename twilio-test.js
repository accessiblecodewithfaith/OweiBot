import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

// Twilio setup
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// Replace this with your joined WhatsApp number
const toWhatsAppNumber = 'whatsapp:+2349138956239'; 

client.messages
  .create({
    from: 'whatsapp:+14155238886', // Twilio sandbox number
    to: toWhatsAppNumber,
    body: '✅ Hello from your Node.js test!'
  })
  .then(message => {
    console.log('✅ Message sent:', message.sid);
  })
  .catch(error => {
    console.error('❌ Error sending message:', error);
  });
