import Vendor from '../models/VendorModel.js';
import fs from 'fs';
import path from 'path';

// 🟢 Update vendor preferences (business name, language, currency, account info, etc.)
export const updateVendorPreferences = async (req, res) => {
  try {
    const vendorId = req.params.id;
    const updates = {
      name: req.body.businessName,
      language: req.body.language,
      currency: req.body.currency,
      accountNumber: req.body.accountNumber,
      bankName: req.body.bankName,
      thankYouMessage: req.body.thankYouMessage
    };

    const updated = await Vendor.findByIdAndUpdate(vendorId, updates, { new: true });
    if (!updated) return res.status(404).json({ message: 'Vendor not found' });

    res.json({ message: '✅ Preferences updated', vendor: updated });
  } catch (err) {
    console.error('❌ Preference update error:', err);
    res.status(500).json({ message: 'Server error while updating preferences' });
  }
};

// 🟢 Upload and update profile image
export const updateProfileImage = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    if (req.file) {
      const imagePath = `/uploads/profile/${req.file.filename}`;
      vendor.image = imagePath;
      await vendor.save();
    }

    res.json({ message: '✅ Profile image updated', image: vendor.image });
  } catch (err) {
    console.error('❌ Image upload error:', err);
    res.status(500).json({ message: 'Server error while uploading image' });
  }
};

// 🟢 Enable/Disable WhatsApp orders
export const toggleWhatsapp = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.whatsappEnabled = req.body.enabled;
    await vendor.save();

    res.json({ message: '✅ WhatsApp order setting updated', enabled: vendor.whatsappEnabled });
  } catch (err) {
    console.error('❌ WhatsApp toggle error:', err);
    res.status(500).json({ message: 'Server error while updating WhatsApp setting' });
  }
};

// 🟢 Enable/Disable AI auto-reply
export const toggleAI = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    vendor.aiEnabled = req.body.enabled;
    await vendor.save();

    res.json({ message: '✅ AI auto-reply setting updated', enabled: vendor.aiEnabled });
  } catch (err) {
    console.error('❌ AI toggle error:', err);
    res.status(500).json({ message: 'Server error while updating AI setting' });
  }
};
