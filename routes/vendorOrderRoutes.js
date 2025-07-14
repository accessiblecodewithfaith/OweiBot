import express from 'express';
import {
  createOrder,
  getOrdersByVendor,
  updateOrderStatus
} from '../controllers/OrderController.js';
import { isVendor } from '../middleware/auth.js';

const router = express.Router();

router.post('/', isVendor, createOrder);
router.get('/', isVendor, getOrdersByVendor);
router.patch('/status', isVendor, updateOrderStatus);

export default router;
