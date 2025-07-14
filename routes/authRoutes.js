import express from 'express';
import Vendor from '../models/VendorModel.js';
import twilio from 'twilio';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

export default function () {
  const router = express.Router();

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const client = twilio(accountSid, authToken);
  const fromWhatsApp = `whatsapp:${process.env.TWILIO_PHONE}`;

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = './uploads/';
      if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, file.fieldname + '-' + Date.now() + ext);
    }
  });

  const upload = multer({ storage });

  // ✅ RESEND OTP
  router.get('/resend-otp', async (req, res) => {
    try {
      const phone = req.query.phone;
      if (!phone) return res.status(400).send('❌ Phone number is required.');

      const vendor = await Vendor.findOne({ phone });
      if (!vendor) return res.status(404).send('❌ Vendor not found.');

      if (!vendor.otp || vendor.otpExpires < Date.now()) {
        return res.status(400).send('❌ OTP expired. Please re-register.');
      }

      await client.messages.create({
        from: fromWhatsApp,
        to: `whatsapp:${vendor.phone}`,
        body: `🔐 Your OweiBot verification code is: ${vendor.otp}`
      });

      res.status(200).send('✅ OTP resent to your WhatsApp.');
    } catch (err) {
      console.error('❌ OTP resend error:', err);
      res.status(500).send('❌ Failed to resend OTP.');
    }
  });

  // ✅ REGISTER
  router.post('/register', async (req, res) => {
    try {
      const { name, phone, password, country, currency, timezone } = req.body;

      if (!name || !phone || !password) {
        return res.status(400).json({ error: '❌ All required fields must be filled.' });
      }

      const existing = await Vendor.findOne({ phone });
      if (existing) {
        return res.status(400).json({ error: '⚠️ Phone number already registered.' });
      }

      const vendor = new Vendor({ name, phone, password, country, currency, timezone });
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      vendor.otp = otp;
      vendor.otpExpires = Date.now() + 5 * 60 * 1000;

      await vendor.save();

      await client.messages.create({
        from: fromWhatsApp,
        to: `whatsapp:${vendor.phone}`,
        body: `🔐 Your OweiBot verification code is: ${otp}`
      });

      res.status(201).json({ message: '✅ Vendor registered. OTP sent to WhatsApp.' });
    } catch (err) {
      console.error('❌ Registration error:', err);
      res.status(500).json({ error: '❌ Registration failed.' });
    }
  });

  // ✅ LOGIN
  router.post('/login', async (req, res) => {
    try {
      const { phone, password } = req.body;
      const vendor = await Vendor.findOne({ phone, password });

      if (!vendor) {
        return res.status(401).json({ error: '❌ Invalid credentials.' });
      }

      req.session.vendorId = vendor._id;

      return res.status(200).json({
        message: '✅ Login successful',
        vendor: {
          id: vendor._id,
          name: vendor.name,
          profileCompleted: vendor.profileCompleted
        },
        redirect: vendor.profileCompleted
          ? '/vendor/dashboard.html'
          : '/vendor/complete-profile.html'
      });
    } catch (err) {
      console.error('❌ Login error:', err);
      res.status(500).json({ error: '❌ Login failed.' });
    }
  });

  // ✅ FORGOT PASSWORD
  router.post('/request-reset', async (req, res) => {
    try {
      const { phone } = req.body;

      const vendor = await Vendor.findOne({ phone });
      if (!vendor) return res.status(404).send('❌ Vendor not found.');

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      vendor.otp = otp;
      vendor.otpExpires = Date.now() + 5 * 60 * 1000;
      await vendor.save();

      await client.messages.create({
        from: fromWhatsApp,
        to: `whatsapp:${vendor.phone}`,
        body: `🔑 OweiBot Password Reset Code: ${otp}`
      });

      res.redirect(`/resetpassword.html?phone=${encodeURIComponent(phone)}`);
    } catch (err) {
      console.error('❌ Forgot password error:', err);
      res.status(500).send('❌ Something went wrong.');
    }
  });

  // ✅ RESET PASSWORD
  router.post('/reset-password', async (req, res) => {
    try {
      const { phone, otp, newPassword } = req.body;

      const vendor = await Vendor.findOne({ phone });
      if (!vendor) return res.status(404).send('❌ Vendor not found.');

      if (vendor.otp !== otp || vendor.otpExpires < Date.now()) {
        return res.status(400).send('❌ Invalid or expired OTP.');
      }

      vendor.password = newPassword;
      vendor.otp = null;
      vendor.otpExpires = null;
      await vendor.save();

      res.send('✅ Password reset successful. You can now <a href="/login">login</a>.');
    } catch (err) {
      console.error('❌ Password reset error:', err);
      res.status(500).send('❌ Something went wrong.');
    }
  });

  // ✅ COMPLETE PROFILE FORM UPLOAD
  router.post('/complete-profile',
  upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'storeImage', maxCount: 1 },
    { name: 'businessDoc', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const vendorId = req.session.vendorId;
      const vendor = await Vendor.findById(vendorId);
      if (!vendor) return res.status(401).send('❌ Unauthorized');

      const { address, bankName, accountNumber, timezone } = req.body;
      const rawHours = req.body.hours || {};

      const formattedHours = {};
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      daysOfWeek.forEach(day => {
        const openTime = req.body[`hours[${day}][open]`];
        const closeTime = req.body[`hours[${day}][close]`];

        const open = !!(openTime && closeTime);

        formattedHours[day.toLowerCase()] = {
          open,
          from: open ? openTime : '00:00',
          to: open ? closeTime : '00:00'
        };
      });

      vendor.address = address;
      vendor.bankName = bankName;
      vendor.accountNumber = accountNumber;
      vendor.timezone = timezone;
      vendor.openingHours = formattedHours;
      vendor.profileCompleted = true;

      if (req.files['logo']) vendor.logo = req.files['logo'][0].path;
      if (req.files['storeImage']) vendor.storeImage = req.files['storeImage'][0].path;
      if (req.files['businessDoc']) vendor.businessDoc = req.files['businessDoc'][0].path;

      await vendor.save();
      res.status(200).send('✅ Profile completed');
    } catch (err) {
      console.error('🔥 Profile error:', err);
      res.status(500).send('❌ Something went wrong.');
    }
  }
);



// Add this to your authRoutes.js
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('❌ Logout error:', err);
      return res.status(500).json({ message: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Optional: clear cookie
    res.json({ message: '✅ Logged out successfully' });
  });
});






  return router;
}
