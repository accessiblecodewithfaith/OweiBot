import Vendor from '../models/vendorModel.js';

const checkPlan = async (req, res, next) => {
  try {
    const vendorId = req.vendorId || req.user?._id;
    if (!vendorId) return res.status(401).json({ message: 'Unauthorized' });

    const vendor = await Vendor.findById(vendorId);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });

    // Initialize trial if not already done
    if (!vendor.planActivatedAt) {
      vendor.planActivatedAt = new Date();
      await vendor.save();
    }

    const twoWeeksInMs = 14 * 24 * 60 * 60 * 1000;
    const now = new Date();
    const trialExpired = now - new Date(vendor.planActivatedAt) >= twoWeeksInMs;

    if (vendor.plan === 'free') {
      if (trialExpired) {
        req.limitedAccess = true;
      } else {
        req.limitedAccess = false;
      }
    } else {
      req.limitedAccess = false;
    }

    req.vendor = vendor;
    next();
  } catch (error) {
    console.error('Plan check error:', error);
    res.status(500).json({ message: 'Server error during plan check' });
  }
};

export default checkPlan;
