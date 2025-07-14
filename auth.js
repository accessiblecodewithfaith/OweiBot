const express = require('express');
const router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const Vendor = require('../models/VendorModel'); // Update path if needed

// GET login page
router.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/login.html'));
});

// GET register page
router.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '../views/register.html'));
});

// POST login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) return res.status(400).send('Vendor not found');

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) return res.status(401).send('Invalid password');

    // Save vendor to session
    req.session.vendor = {
      id: vendor._id,
      name: vendor.name,
      email: vendor.email,
      phone: vendor.phone,
    };

    res.redirect('/orders.html'); // Redirect to orders page or dashboard
  } catch (err) {
    console.error('❌ Login error:', err.message);
    res.status(500).send('Server error');
  }
});

// POST register
router.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    const existing = await Vendor.findOne({ email });
    if (existing) return res.status(400).send('Email already exists');

    const hashed = await bcrypt.hash(password, 10);

    const newVendor = new Vendor({
      name,
      email,
      phone,
      password: hashed
    });

    await newVendor.save();

    res.redirect('/login'); // Or auto-login if you prefer
  } catch (err) {
    console.error('❌ Register error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
