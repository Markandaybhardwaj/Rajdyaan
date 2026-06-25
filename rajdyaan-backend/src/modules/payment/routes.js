// ---------------------------------------------------------------------------
// Payment Routes
// ---------------------------------------------------------------------------
import { Router } from 'express';
import protect from '../../middleware/auth.js';
import { createOrder, verifyPayment, getKey } from './controller.js';
import handleWebhook from './webhook.js';

const router = Router();

// Public — frontend needs the key to initialise Razorpay checkout
router.get('/key', getKey);

// Protected — user must be logged in to create an order or verify payment
router.post('/create-order', protect, createOrder);
router.post('/verify',       protect, verifyPayment);

// Webhook — called by Razorpay servers, NOT by our frontend
// No auth middleware — Razorpay can't send our JWT cookie.
// Security is handled by HMAC signature verification inside the handler.
router.post('/webhook', handleWebhook);

export default router;
