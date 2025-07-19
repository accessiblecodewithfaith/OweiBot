// routes/adminAnalytics.js
import express from 'express';
import Order from '../models/OrderModel.js';
import Menu from '../models/MenuModel.js';

const router = express.Router();

router.get('/analytics', async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const topMeals = await Order.aggregate([
      { $unwind: "$items" },
      { $group: { _id: "$items.name", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    const topCustomers = await Order.aggregate([
      { $group: { _id: "$customerPhone", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    res.json({ totalOrders, topMeals, topCustomers });
  } catch (err) {
    console.error("❌ Analytics error:", err);
    res.status(500).send("Server error");
  }
});

export default router;
