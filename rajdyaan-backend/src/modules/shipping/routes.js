// ---------------------------------------------------------------------------
// Shipping Routes — /api/v1/shipping/*
// ---------------------------------------------------------------------------
// POST /create           — Admin only — create Shiprocket shipment + AWB
// GET  /track/:orderId   — Auth required — get live tracking for an order
// POST /webhook          — Public — Shiprocket pushes status updates here
// ---------------------------------------------------------------------------
import { Router } from 'express';
import protect from '../../middleware/auth.js';
import adminOnly from '../../middleware/admin.js';
import {
  createShiprocketShipment,
  trackOrder,
  shiprocketWebhook,
} from './controller.js';

const router = Router();

// Admin creates shipment on Shiprocket
router.post('/create', protect, adminOnly, createShiprocketShipment);

// User tracks their order
router.get('/track/:orderId', protect, trackOrder);

// Shiprocket webhook — no auth (Shiprocket can't send our JWT)
router.post('/webhook', shiprocketWebhook);

export default router;
