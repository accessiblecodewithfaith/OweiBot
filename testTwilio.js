// testTwilio.js
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID, 
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    from: 'whatsapp:+14155238886',         // Twilio Sandbox Number
    to: 'whatsapp:+2349138956239',         // Your own verified number
    body: '🧪 Manual test message from Twilio'
  })
  .then(message => console.log('✅ Sent:', message.sid))
  .catch(err => console.error('❌ Twilio error:', err));
