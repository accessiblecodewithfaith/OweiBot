import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
<<<<<<< HEAD
import checkPlan from '../middleware/checkPlan.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to block users if trial expired
const restrictIfLimited = (req, res, next) => {
  if (req.limitedAccess) {
    return res.sendFile(path.join(__dirname, '../public/dashboard/upgrade.html')); // You can customize this page
  }
  next();
};

// Dashboard Home
router.get('/dashboard', checkPlan, restrictIfLimited, (req, res) => {
=======

const router = express.Router();

// For __dirname support in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dashboard Home
router.get('/dashboard', (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  res.sendFile(path.join(__dirname, '../public/dashboard/index.html'));
});

// Menu Page
<<<<<<< HEAD
router.get('/dashboard/menu', checkPlan, restrictIfLimited, (req, res) => {
=======
router.get('/dashboard/menu', (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  res.sendFile(path.join(__dirname, '../public/dashboard/menu.html'));
});

// Orders Page
<<<<<<< HEAD
router.get('/dashboard/orders', checkPlan, restrictIfLimited, (req, res) => {
=======
router.get('/dashboard/orders', (req, res) => {
>>>>>>> 2179414cd6a37cf973d561ce484eff25dc08781b
  res.sendFile(path.join(__dirname, '../public/dashboard/orders.html'));
});

export default router;
