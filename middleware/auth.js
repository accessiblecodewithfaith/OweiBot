import Vendor from '../models/VendorModel.js';

// ✅ Middleware for authenticated vendors
export const isVendor = async (req, res, next) => {
  try {
    if (!req.session?.vendorId) {
      return res.status(401).json({ message: 'Unauthorized: Vendors only.' });
    }

    const vendor = await Vendor.findById(req.session.vendorId);
    if (!vendor) {
      return res.status(401).json({ message: 'Vendor not found.' });
    }

    req.user = vendor; // Attach vendor to request
    next();
  } catch (error) {
    console.error('❌ Vendor auth error:', error);
    return res.status(500).json({ message: 'Server error in vendor authentication.' });
  }
};

// ✅ Middleware for authenticated admins
export const isAdmin = (req, res, next) => {
  if (req.session?.adminId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Admins only.' });
};

// ✅ Redirect if admin is not authenticated (for admin pages)
export const isAdminAuthenticated = (req, res, next) => {
  if (req.session?.adminId) {
    return next();
  }
  res.redirect('/admin-login.html');
};

// ✅ Middleware for superadmin-only access
export const isSuperAdmin = (req, res, next) => {
  if (req.session?.adminRole === 'superadmin') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied: Superadmin only.' });
};
