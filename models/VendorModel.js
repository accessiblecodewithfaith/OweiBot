import mongoose from 'mongoose';

const vendorSchema = new mongoose.Schema({
  name: String,
  phone: String,
  password: String,
  country: String,
  timezone: { type: String, default: 'Africa/Lagos' },
  accountNumber: String,
  bankName: String,
  status: { type: String, default: 'pending' },
  profileCompleted: { type: Boolean, default: false },
  otp: String,
  otpExpires: Date,
  optedOut: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  autoRespond: { type: Boolean, default: true },

  // ✅ Profile assets
  logo: String,
  storeImage: String,
  businessDoc: String,

  // ✅ Location and hours
  location: String,

  openingHours: {
    monday: { open: { type: Boolean, default: true }, from: { type: String, default: '09:00' }, to: { type: String, default: '18:00' } },
    tuesday: { open: { type: Boolean, default: true }, from: { type: String, default: '09:00' }, to: { type: String, default: '18:00' } },
    wednesday: { open: { type: Boolean, default: true }, from: { type: String, default: '09:00' }, to: { type: String, default: '18:00' } },
    thursday: { open: { type: Boolean, default: true }, from: { type: String, default: '09:00' }, to: { type: String, default: '18:00' } },
    friday: { open: { type: Boolean, default: true }, from: { type: String, default: '09:00' }, to: { type: String, default: '18:00' } },
    saturday: { open: { type: Boolean, default: false }, from: { type: String, default: '10:00' }, to: { type: String, default: '14:00' } },
    sunday: { open: { type: Boolean, default: false }, from: { type: String, default: '00:00' }, to: { type: String, default: '00:00' } }
  },

  // ✅ Preferences
  businessName: String,
  currency: { type: String, default: 'NGN' },
  language: { type: String, default: 'en' },
  thankYouMessage: String,

  // ✅ Bot link for approved vendors
  botLink: { type: String, default: '' },

  // ✅ Feature toggles
  whatsappEnabled: { type: Boolean, default: false },
  aiEnabled: { type: Boolean, default: false },

  // ✅ Plan logic
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
  planActivatedAt: {
    type: Date,
    default: Date.now
  },

  // ✅ Linked menu
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }]
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
