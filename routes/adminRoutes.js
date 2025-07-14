import express from 'express';
import path from 'path';
import bcrypt from 'bcryptjs';
import twilio from 'twilio';

import Admin from '../models/AdminModel.js';
import Vendor from '../models/VendorModel.js';
import Order from '../models/OrderModel.js';
import Menu from '../models/MenuModel.js';
import { isAdminAuthenticated, isSuperAdmin, isVendor, isAdmin } from '../middleware/auth.js';


const router = express.Router();

// Admin Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    console.log('🧠 Admin Found:', admin);

    if (!admin) {
      console.log('❌ No admin found with that email');
      return res.status(401).send('Invalid credentials (email)');
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    console.log('🔐 Password Match:', isMatch);

    if (!isMatch) {
      console.log('❌ Password did not match');
      return res.status(401).send('Invalid credentials (password)');
    }

    req.session.adminId = admin._id;
    req.session.adminRole = admin.role;
    return res.redirect('/admin/admindashboard.html'); // ✅ FIXED PATH

  } catch (err) {
    console.error('🔥 Login error:', err);
    res.status(500).send('Login failed');
  }
});


// Admin Logout
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/adminlogin.html');
  });
});

// Admin Dashboard
router.get('/dashboard', isAdminAuthenticated, (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'admin', 'admindashboard.html')); // ✅ FIXED PATH
});


// Create new admin (Superadmin only)
router.post('/create', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const newAdmin = new Admin({ name, email, password, role });
    await newAdmin.save();
    res.status(201).json({ message: '✅ Admin created' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '❌ Failed to create admin' });
  }
});

// Get all admins
router.get('/admins', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    const admins = await Admin.find({});
    res.json(admins);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admins' });
  }
});

// Delete admin (Superadmin only)
router.delete('/admins/:id', isAdminAuthenticated, isSuperAdmin, async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: '✅ Admin deleted' });
  } catch (err) {
    res.status(500).json({ error: '❌ Failed to delete admin' });
  }
});

// Get all vendors (Admin only)
router.get('/vendors', isAdmin, async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// GET ALL MENU ITEMS
router.get('/menu', isAdminAuthenticated, async (req, res) => {
  try {
    const menu = await Menu.find({}).populate('vendor');
    res.json(menu);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch menu items' });
  }
});

// DELETE MENU ITEM
router.delete('/menu/:id', isAdminAuthenticated, async (req, res) => {
  try {
    await Menu.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Menu item deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
});



// Approve Vendor
// Approve Vendor
router.patch('/vendors/:id/approve', isAdminAuthenticated, async (req, res) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );

    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    const botLink = `https://wa.me/${vendor.phone.replace('+', '')}?text=Hi%20${encodeURIComponent(vendor.businessName)}%2C%20your%20OweiBot%20account%20has%20been%20approved!`;

    vendor.botLink = botLink;
    await vendor.save();

    // 🔴 Update this block below
    if (process.env.TWILIO_PHONE) {
      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      // ✅ PLACE THIS CODE INSTEAD
      await client.messages.create({
        from: 'whatsapp:' + process.env.TWILIO_PHONE,
        to: 'whatsapp:' + vendor.phone,
        body: `🎉 Hi ${vendor.businessName}, your OweiBot account has been approved!\nYour WhatsApp Link: ${botLink}`
      });
    }

    res.json({ success: true, message: 'Vendor approved', botLink });
  } catch (err) {
    console.error('Vendor approval failed:', err);
    res.status(500).json({ error: 'Approval failed' });
  }
});


// Reject Vendor
router.patch('/vendors/:id/reject', isAdminAuthenticated, async (req, res) => {
  try {
    await Vendor.findByIdAndUpdate(req.params.id, { status: 'rejected' });
    res.json({ success: true, message: 'Vendor rejected' });
  } catch (err) {
    res.status(500).json({ error: 'Rejection failed' });
  }
});

export default router;
