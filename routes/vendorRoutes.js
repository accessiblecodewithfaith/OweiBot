import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Vendor from '../models/VendorModel.js';
import { isVendor } from '../middleware/auth.js';
<<<<<<< HEAD
import checkPlan from '../middleware/checkPlan.js'; // ✅ Import the middleware
=======
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b

const router = express.Router();

// ✅ Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'public/uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
<<<<<<< HEAD
=======

>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
const upload = multer({ storage });

/**
 * ✅ POST: Complete Profile Setup
 */
router.post(
  '/complete-profile',
  isVendor,
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

      const { location, bankName, accountNumber, timezone } = req.body;

      if (!location || !bankName || !accountNumber || !timezone) {
        return res.status(400).json({ message: '❌ Missing required fields.' });
      }

      const formattedHours = {};
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      daysOfWeek.forEach(day => {
        const openTime = req.body[`hours[${day}][open]`];
        const closeTime = req.body[`hours[${day}][close]`];
        const closed = req.body[`hours[${day}][closed]`] !== undefined;

        formattedHours[day.toLowerCase()] = {
          open: !closed,
          from: !closed ? openTime : '00:00',
          to: !closed ? closeTime : '00:00'
        };
      });

      vendor.location = location;
      vendor.bankName = bankName;
      vendor.accountNumber = accountNumber;
      vendor.timezone = timezone;
      vendor.openingHours = formattedHours;
      vendor.profileCompleted = true;

      if (req.files['logo']) vendor.logo = req.files['logo'][0].path;
      if (req.files['storeImage']) vendor.storeImage = req.files['storeImage'][0].path;
      if (req.files['businessDoc']) vendor.businessDoc = req.files['businessDoc'][0].path;

      await vendor.save();

      res.status(200).json({
        message: '✅ Profile completed successfully.',
        redirect: '/vendor/dashboard.html'
      });
    } catch (err) {
      console.error('🔥 Profile completion error:', err);
      res.status(500).json({ message: '❌ Failed to complete profile.' });
    }
  }
);

/**
 * ✅ PATCH: Update Preferences
 */
<<<<<<< HEAD
router.patch('/preferences/:vendorId', isVendor, checkPlan, async (req, res) => {
=======
router.patch('/preferences/:vendorId', isVendor, async (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  try {
    const { businessName, currency, language, accountNumber, bankName, thankYouMessage } = req.body;
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.name = businessName;
    vendor.currency = currency;
    vendor.language = language;
    vendor.accountNumber = accountNumber;
    vendor.bankName = bankName;
    vendor.thankYouMessage = thankYouMessage;

    await vendor.save();
    res.json({ message: '✅ Preferences updated' });
  } catch (err) {
    console.error('Error updating preferences:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

/**
 * ✅ PATCH: Update Profile Image
 */
<<<<<<< HEAD
router.patch('/profile-image/:vendorId', isVendor, checkPlan, upload.single('image'), async (req, res) => {
=======
router.patch('/profile-image/:vendorId', isVendor, upload.single('image'), async (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.logo = req.file.path;
    await vendor.save();
    res.json({ message: '✅ Profile image updated' });
  } catch (err) {
    console.error('Profile image update error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

/**
 * ✅ PATCH: Toggle WhatsApp Orders
 */
<<<<<<< HEAD
router.patch('/whatsapp-toggle/:vendorId', isVendor, checkPlan, async (req, res) => {
=======
router.patch('/whatsapp-toggle/:vendorId', isVendor, async (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.whatsappEnabled = req.body.enabled;
    await vendor.save();
    res.json({ message: '✅ WhatsApp orders updated' });
  } catch (err) {
    console.error('WhatsApp toggle error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

/**
 * ✅ PATCH: Toggle AI Auto-Reply
 */
<<<<<<< HEAD
router.patch('/ai-toggle/:vendorId', isVendor, checkPlan, async (req, res) => {
=======
router.patch('/ai-toggle/:vendorId', isVendor, async (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.aiEnabled = req.body.enabled;
    await vendor.save();
    res.json({ message: '✅ AI auto-reply updated' });
  } catch (err) {
    console.error('AI toggle error:', err);
    res.status(500).json({ message: '❌ Server error' });
  }
});

export default router;
