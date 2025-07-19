import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import path from 'path';
import Admin from '../models/AdminModel.js';

// __dirname workaround
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('🔍 MONGO_URI Loaded:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const existing = await Admin.findOne({ email: 'super@oweibot.com' });
  if (existing) {
    console.log('⚠️ Superadmin already exists');
    process.exit();
  }

  const superadmin = new Admin({
    name: 'Super Admin',
    email: 'super@oweibot.com',
    password: 'admin123', // ❌ no bcrypt here, let Mongoose handle it
    role: 'superadmin'
  });

  await superadmin.save();
  console.log('✅ Superadmin created with password: admin123');
  process.exit();
}).catch(err => {
  console.error('❌ Mongo error:', err);
  process.exit(1);
});
