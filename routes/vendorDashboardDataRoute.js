// routes/vendorDashboardDataRoute.js
import express from 'express';
import Vendor from '../models/VendorModel.js';
import Order from '../models/OrderModel.js';
import { isVendor } from '../middleware/auth.js';

const router = express.Router();

router.get('/api/vendor/dashboard-data', isVendor, async (req, res) => {
  try {
    const vendor = req.user;

    const orders = await Order.find({ vendorPhone: vendor.phone }).sort({ createdAt: -1 });

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(order => order.status === 'pending').length;
    const newOrders = orders.slice(0, 3); // latest 3

    res.json({
      vendorName: vendor.name,
      plan: vendor.plan,
      status: vendor.status,
      orders: newOrders,
      totalOrders,
      pendingOrders
    });
  } catch (err) {
    console.error('❌ Dashboard data error:', err);
    res.status(500).json({ message: 'Failed to load dashboard data' });
  }
});

export default router;
