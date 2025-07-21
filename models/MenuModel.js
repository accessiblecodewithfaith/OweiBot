import mongoose from 'mongoose';

const MenuSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: false // Optional image upload
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true
  },
  crossSellItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }],
  upsellItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Menu'
  }],
  isUpsell: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Menu = mongoose.model('Menu', MenuSchema);
export default Menu;
