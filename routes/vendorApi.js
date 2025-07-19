import express from 'express';
import Order from '../models/OrderModel.js';
import { isVendor } from '../middleware/auth.js';

const router = express.Router();

router.get('/vendor/orders', isVendor, async (req, res) => {
  try {
    const orders = await Order.find({ vendorPhone: req.user.phone });
    res.json(orders);
  } catch (err) {
    console.error('Order fetch error:', err);
    res.status(500).json({ message: '❌ Failed to fetch orders' });
  }
});

export default router;
