const jwt = require('jsonwebtoken');
const Admin = require('../models/AdminModel');

const authenticateAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id);
    if (!admin) throw new Error();

    req.admin = admin;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

const authorizeSuperAdmin = (req, res, next) => {
  if (req.admin.role !== 'superadmin') {
    return res.status(403).json({ error: 'Only superadmins allowed' });
  }
  next();
};

module.exports = { authenticateAdmin, authorizeSuperAdmin };
