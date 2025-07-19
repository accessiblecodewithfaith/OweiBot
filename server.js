// server.js

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Crons
import './cron/dailysummary.js';
import './cron/autoFollowUp.js';





// Core
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import session from 'express-session';
import twilio from 'twilio';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import cron from 'node-cron';

// Setup __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize app
const app = express();
const PORT = process.env.PORT || 3000;

// ✅ MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ✅ Twilio
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE;
const client = twilio(accountSid, authToken);

// Sample data
const users = [];
const menu = {
  rice: 1500,
  burger: 2500,
  pizza: 3000,
  noodles: 1200,
};

// ✅ Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'defaultsecret',
  resave: false,
  saveUninitialized: true,
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.set('view engine', 'ejs');


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// ✅ Routes
import testRoute from './routes/testRoute.js';
import authRoutesInit from './routes/authRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import botRoutesInit from './routes/botRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import vendorProfileRoutes from './routes/vendorProfileRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/adminAnalytics.js';
import vendorDashboardDataRoute from './routes/vendorDashboardDataRoute.js';
import vendorOrderRoutes from './routes/vendorOrderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import webhookRoutes from './routes/webhookRoutes.js';
import vendorMenuRoutes from './routes/vendorMenuRoutes.js';


// Auth route (pass users array)
const authRoutes = authRoutesInit(users);
const botRoutes = botRoutesInit(menu, client, twilioPhone);

// ✅ Mount routes
app.use('/api', testRoute);
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/bot', botRoutes);
app.use('/', dashboardRoutes);
app.use('/api/vendor', vendorProfileRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/pay', paymentRoutes);
app.use('/webhook', webhookRoutes);
app.use('/api/vendor', vendorDashboardDataRoute);
app.use('/api/vendor/orders', vendorOrderRoutes);
app.use('/api/vendor/menu', vendorMenuRoutes); // ✅ VERY IMPORTANT


// ✅ Serve static login/register/reset pages
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'register.html'));
});

app.get('/forgotpassword', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'forgotpassword.html'));
});

app.get('/resetpassword', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'resetpassword.html'));
});

app.get('/plans', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'plans.html'));
});

app.get('/pay', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'pay.html'));
});

app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// ✅ Optional: Test session route
app.get('/session-check', (req, res) => {
  res.send(`Logged in Vendor ID: ${req.session.vendorId || 'Not logged in'}`);
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Server error:', err.stack);
  res.status(500).send('🚨 Something went wrong!');
});

// ✅ Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

// ✅ Follow-up cron job
import Order from './models/OrderModel.js';
import Vendor from './models/VendorModel.js';

cron.schedule('0 * * * *', async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const orders = await Order.find({
      createdAt: { $lte: twentyFourHoursAgo },
      status: 'pending'
    });

    for (const order of orders) {
      const vendor = await Vendor.findOne({ phone: order.vendorPhone });

      const msg = `👋 Hi ${order.customerName}, hope you enjoyed your recent order from ${vendor?.name || 'our vendor'}.\n\n🍽️ Want to reorder your favorite meals? Just reply *menu* to start again.`;

      await client.messages.create({
        from: twilioPhone,
        to: order.customerPhone,
        body: msg
      });

      console.log(`✅ Sent follow-up to ${order.customerPhone}`);
    }
  } catch (err) {
    console.error('❌ Cron follow-up error:', err.message);
  }
});
