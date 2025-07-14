import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

// For __dirname support in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dashboard Home
router.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/index.html'));
});

// Menu Page
router.get('/dashboard/menu', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/menu.html'));
});

// Orders Page
router.get('/dashboard/orders', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/dashboard/orders.html'));
});

export default router;
