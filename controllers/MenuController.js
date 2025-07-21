import Menu from '../models/MenuModel.js';
import Vendor from '../models/VendorModel.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// 📦 Storage config for uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/menu/';
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

export const upload = multer({ storage }).single('image');

// ✅ POST - Add Menu Item
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, isUpsell } = req.body;
    const vendor = req.user._id;
    const image = req.file ? `/uploads/menu/${req.file.filename}` : null;

    if (!name || !price || !vendor) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const exists = await Vendor.findById(vendor);
    if (!exists) return res.status(404).json({ message: 'Vendor not found' });

    const menu = new Menu({
      name,
      price,
      image,
      vendor,
      isUpsell: isUpsell === 'true'
    });

    await menu.save();

    res.status(201).json({ message: '✅ Menu item created', item: menu });
  } catch (err) {
    console.error('❌ Error adding menu item:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ GET - Vendor Menu Items
export const getMenuItems = async (req, res) => {
  try {
    const vendorId = req.user._id;
    const items = await Menu.find({ vendor: vendorId })
      .populate('crossSellItems')
      .populate('upsellItems');

    res.json(items);
  } catch (err) {
    console.error('❌ Fetch menu error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ PUT - Update cross-sell / upsell
export const updateCrossAndUpsellItems = async (req, res) => {
  try {
    const { crossSellItems = [], upSellItems = [] } = req.body;

    const updated = await Menu.findByIdAndUpdate(
      req.params.itemId,
      {
        crossSellItems,
        upSellItems
      },
      { new: true }
    ).populate('crossSellItems upSellItems');

    if (!updated) return res.status(404).json({ message: 'Menu item not found' });

    res.json({ message: '✅ Cross-sell and Upsell links updated', item: updated });
  } catch (err) {
    console.error('❌ Error updating links:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ PUT - Edit menu item
export const updateMenuItem = async (req, res) => {
  try {
    const { name, price, isUpsell } = req.body;
    const menuItem = await Menu.findOneAndUpdate(
      { _id: req.params.id, vendor: req.user._id },
      { name, price, isUpsell: isUpsell === 'true' },
      { new: true }
    );

    if (!menuItem) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: '✅ Item updated', item: menuItem });
  } catch (err) {
    console.error('❌ Edit error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ✅ DELETE - Delete menu item
export const deleteMenuItem = async (req, res) => {
  try {
    const deleted = await Menu.findOneAndDelete({ _id: req.params.id, vendor: req.user._id });
    if (!deleted) return res.status(404).json({ message: 'Item not found' });

    res.json({ message: '✅ Item deleted' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
