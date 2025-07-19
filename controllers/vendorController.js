import Vendor from '../models/VendorModel.js';
import fs from 'fs';
import path from 'path';

// 🟢 Update vendor preferences
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
      vendor.logo = imagePath;
      await vendor.save();
    }

    res.json({ message: '✅ Profile image updated', image: vendor.logo });
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

// 🟢 Upgrade plan to pro/premium (no payment logic for now)
export const upgradePlan = async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    const { plan } = req.body;
    if (!['pro', 'premium'].includes(plan)) {
      return res.status(400).json({ message: 'Invalid plan selected' });
    }

    vendor.plan = plan;
    vendor.planActivatedAt = new Date();
    await vendor.save();

    res.json({ message: `✅ Upgraded to ${plan}`, plan: vendor.plan });
  } catch (err) {
    console.error('❌ Plan upgrade error:', err);
    res.status(500).json({ message: 'Server error while upgrading plan' });
  }
};

// 🟡 Trial checker (downgrades after 14 days)
export const checkTrialStatus = async (vendorId) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return;

    const isPaid = ['pro', 'premium'].includes(vendor.plan);
    if (isPaid) return; // already on paid plan

    const startDate = vendor.planActivatedAt || vendor.createdAt;
    const daysPassed = Math.floor((Date.now() - new Date(startDate)) / (1000 * 60 * 60 * 24));

    if (daysPassed > 14 && !vendor.trialEndedLogged) {
      vendor.plan = 'free';
      vendor.trialEndedLogged = true;
      await vendor.save();
      console.log(`⏳ Trial expired — vendor ${vendor._id} downgraded to free.`);
    }
  } catch (err) {
    console.error('❌ Trial check error:', err);
  }
};

// 🟢 Optional: Get vendor dashboard data
export const getVendorDashboard = async (req, res) => {
  try {
    const vendorId = req.session.vendorId;
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    await checkTrialStatus(vendorId); // Auto-downgrade if needed

    res.json({
      message: '✅ Dashboard loaded',
      vendor,
      limitedAccess: vendor.plan === 'free'
    });
  } catch (err) {
    console.error('❌ Dashboard fetch error:', err);
    res.status(500).json({ message: 'Server error loading dashboard' });
  }
};
