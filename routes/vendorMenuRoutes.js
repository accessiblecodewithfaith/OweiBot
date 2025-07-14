import express from 'express';
import {
  addMenuItem,
  getMenuItems,
  updateCrossAndUpsellItems,
  upload,
  updateMenuItem,       // ✅ Edit route
  deleteMenuItem        // ✅ Delete route
} from '../controllers/MenuController.js';
import { isVendor } from '../middleware/auth.js';

const router = express.Router();

// Create a new menu item (with file upload)
router.post('/', isVendor, upload, addMenuItem);

// Get all menu items for the logged-in vendor
router.get('/', isVendor, getMenuItems);

// Update upsell / cross-sell items
router.put('/links/:itemId', isVendor, updateCrossAndUpsellItems);

// Edit a menu item
router.put('/:id', isVendor, updateMenuItem);

// Delete a menu item
router.delete('/:id', isVendor, deleteMenuItem);

export default router;
