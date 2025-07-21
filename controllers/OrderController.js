import Order from '../models/OrderModel.js';

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { items, customerName, address, customerPhone, total } = req.body;

    if (!items || !customerName || !address || !customerPhone || !total) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newOrder = new Order({
      items,
      customerName,
      address,
      customerPhone,
      vendorPhone: req.user.phone, // ✅ Use session
      total
    });

    await newOrder.save();

    res.status(201).json({ message: '✅ Order created', order: newOrder });
  } catch (err) {
    console.error('❌ Order creation error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get orders for the logged-in vendor
export const getOrdersByVendor = async (req, res) => {
  try {
    const vendorPhone = req.user.phone;
    const orders = await Order.find({ vendorPhone }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('❌ Fetch orders error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status
export const updateOrderStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    if (!id || !status) return res.status(400).json({ message: 'Missing ID or status' });

    const updated = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!updated) return res.status(404).json({ message: 'Order not found' });

    res.json({ message: '✅ Status updated', order: updated });
  } catch (err) {
    console.error('❌ Update order status error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};
