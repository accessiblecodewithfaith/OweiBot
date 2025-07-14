import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';
import Admin from '../models/AdminModel.js';

// __dirname workaround for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🔍 MONGO_URI Loaded:', process.env.MONGO_URI);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const existing = await Admin.findOne({ email: 'admin@oweibot.com' });
  if (existing) {
    console.log('⚠️ Admin already exists');
    process.exit();
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = new Admin({
    name: 'Owei Admin',
    email: 'admin@oweibot.com',
    password: hashedPassword,
    role: 'admin'
  });

  await admin.save();
  console.log('✅ Admin created with password: admin123');
  process.exit();
}).catch(err => {
  console.error('❌ Mongo error:', err);
  process.exit(1);
});
