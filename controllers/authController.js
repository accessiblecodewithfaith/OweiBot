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

    const newVendor = new Vendor({
      name,
      phone,
      password,
      plan: 'pro', // 2-week trial treated as Pro
      trialStartDate: new Date()
    });

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

    // Optional: calculate days left in trial
    let trialMessage = '';
    if (vendor.plan === 'pro' && vendor.trialStartDate) {
      const daysPassed = Math.floor((Date.now() - vendor.trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
      const daysLeft = 14 - daysPassed;
      if (daysLeft <= 0) {
        trialMessage = '<p style="color:red">⛔ Your free trial has ended. Please upgrade.</p>';
      } else {
        trialMessage = `<p style="color:green">✅ ${daysLeft} day(s) left in your trial.</p>`;
      }
    }

    res.send(`<h2>Welcome ${vendor.name}!</h2><p>Login successful.</p>${trialMessage}`);
  } catch (err) {
    console.error('❌ Error in loginVendor:', err);
    res.status(500).send('❌ Internal server error');
  }
};
