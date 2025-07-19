import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  items: [
    {
      name: String,
      price: Number
    }
  ],
  customerName: String,
  address: String,
  vendorPhone: String,
  customerPhone: String,
  total: Number,

  status: {
    type: String,
    default: 'pending'
  },
  followUpSent: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);
export default Order;
