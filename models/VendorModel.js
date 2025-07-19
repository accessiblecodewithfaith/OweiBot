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
<<<<<<< HEAD
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
=======
  logo: { type: String },
  storeImage: { type: String },
  businessDoc: { type: String },

  // ✅ Location and hours
  location: { type: String },

  openingHours: {
    monday: {
      open: { type: Boolean, default: true },
      from: { type: String, default: '09:00' },
      to: { type: String, default: '18:00' }
    },
    tuesday: {
      open: { type: Boolean, default: true },
      from: { type: String, default: '09:00' },
      to: { type: String, default: '18:00' }
    },
    wednesday: {
      open: { type: Boolean, default: true },
      from: { type: String, default: '09:00' },
      to: { type: String, default: '18:00' }
    },
    thursday: {
      open: { type: Boolean, default: true },
      from: { type: String, default: '09:00' },
      to: { type: String, default: '18:00' }
    },
    friday: {
      open: { type: Boolean, default: true },
      from: { type: String, default: '09:00' },
      to: { type: String, default: '18:00' }
    },
    saturday: {
      open: { type: Boolean, default: false },
      from: { type: String, default: '10:00' },
      to: { type: String, default: '14:00' }
    },
    sunday: {
      open: { type: Boolean, default: false },
      from: { type: String, default: '00:00' },
      to: { type: String, default: '00:00' }
    }
  },

  // ✅ Preferences
  businessName: { type: String },
  currency: { type: String, default: 'NGN' },
  language: { type: String, default: 'en' },
  thankYouMessage: { type: String },
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b

  // ✅ Bot link for approved vendors
  botLink: { type: String, default: '' },

  // ✅ Feature toggles
  whatsappEnabled: { type: Boolean, default: false },
  aiEnabled: { type: Boolean, default: false },

<<<<<<< HEAD
  // ✅ Plan logic
=======
  // ✅ Plan + linked menu
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  plan: {
    type: String,
    enum: ['free', 'pro', 'premium'],
    default: 'free'
  },
<<<<<<< HEAD
  planActivatedAt: {
    type: Date,
    default: Date.now
  },

  // ✅ Linked menu
  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }]
}, { timestamps: true });

export default mongoose.models.Vendor || mongoose.model('Vendor', vendorSchema);
=======

  menu: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Menu' }]
}, { timestamps: true });

export default mongoose.model('Vendor', vendorSchema);
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
