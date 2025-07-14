import express from 'express';
import multer from 'multer';
import path from 'path';
import Vendor from '../models/VendorModel.js';
import { isVendor } from '../middleware/auth.js';

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// ✅ Complete Profile Route
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
      if (!vendor) return res.status(401).json({ message: '❌ Vendor not found.' });

      const {
        businessName, // ✅ Include business name
        location,
        accountNumber,
        bankName,
        timezone
      } = req.body;

      if (!businessName || !location || !accountNumber || !bankName || !timezone) {
        return res.status(400).json({ message: '❌ Missing required fields.' });
      }

      // Handle file uploads
      const logo = req.files['logo']?.[0]?.path || vendor.logo;
      const storeImage = req.files['storeImage']?.[0]?.path || vendor.storeImage;
      const businessDoc = req.files['businessDoc']?.[0]?.path || vendor.businessDoc;

      // Parse opening hours
      const openingHours = {};
      for (const key in req.body) {
        const match = key.match(/^hours\[(\w+)\]\[(\w+)\]$/);
        if (match) {
          const day = match[1].toLowerCase();
          const field = match[2];
          if (!openingHours[day]) openingHours[day] = {};
          if (field === 'closed') {
            openingHours[day].open = false;
          } else {
            openingHours[day].open = true;
            openingHours[day][field === 'open' ? 'from' : 'to'] = req.body[key];
          }
        }
      }

      // ✅ Update vendor fields
      vendor.businessName = businessName;
      vendor.location = location;
      vendor.accountNumber = accountNumber;
      vendor.bankName = bankName;
      vendor.timezone = timezone;
      vendor.logo = logo;
      vendor.storeImage = storeImage;
      vendor.businessDoc = businessDoc;
      vendor.openingHours = openingHours;
      vendor.profileCompleted = true;

      await vendor.save();

      res.status(200).json({
        message: '✅ Profile completed successfully.',
        redirect: '/vendor/dashboard.html'
      });
    } catch (err) {
      console.error('❌ Profile update error:', err);
      res.status(500).json({ message: '❌ Failed to complete profile.' });
    }
  }
);

export default router;
