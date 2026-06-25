// ---------------------------------------------------------------------------
// Order Routes — /api/v1/order/*
// ---------------------------------------------------------------------------
import { Router } from 'express';
import protect from '../../middleware/auth.js';
import adminOnly from '../../middleware/admin.js';
import { getMyOrders, getOrderById, validateCoupon, cancelOrder, adminGetAllOrders, adminUpdateOrderStatus } from './controller.js';

const router = Router();

// Coupon validation (used by cart page — needs auth for future per-user limits)
router.post('/validate-coupon', protect, validateCoupon);

// Admin: all orders with filters + pagination
router.get('/admin/all', protect, adminOnly, adminGetAllOrders);

// Admin: update order status
router.patch('/admin/:id/status', protect, adminOnly, adminUpdateOrderStatus);

// User's order history
router.get('/my-orders', protect, getMyOrders);

// Single order detail
router.get('/:id', protect, getOrderById);

// Cancel an order (only pending/confirmed)
router.patch('/:id/cancel', protect, cancelOrder);

export default router;
