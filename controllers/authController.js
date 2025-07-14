const Vendor = require('../models/VendorModel');

// Register Vendor
exports.registerVendor = async (req, res) => {
  const { name, phone, password } = req.body;

  if (!name || !phone || !password) {
    return res.status(400).send('❌ All fields are required!');
  }

  try {
    const exists = await Vendor.findOne({ phone });
    if (exists) return res.status(409).send('⚠️ Phone already registered.');

    const newVendor = new Vendor({ name, phone, password });
    await newVendor.save();

    res.redirect('/');
  } catch (err) {
    console.error('❌ Error in registerVendor:', err);
    res.status(500).send('❌ Internal server error');
  }
};

// Login Vendor
exports.loginVendor = async (req, res) => {
  const { phone, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ phone, password });
    if (!vendor) return res.status(401).send('❌ Invalid login credentials.');

    res.send(`<h2>Welcome ${vendor.name}!</h2><p>Login successful.</p>`);
  } catch (err) {
    console.error('❌ Error in loginVendor:', err);
    res.status(500).send('❌ Internal server error');
  }
};
