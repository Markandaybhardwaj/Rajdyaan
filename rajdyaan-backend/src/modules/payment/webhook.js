// ---------------------------------------------------------------------------
// Razorpay Webhook Handler
// ---------------------------------------------------------------------------
// WHY webhooks are critical:
//   The frontend verify call can fail (user closes browser, network drops).
//   Razorpay's webhook is the FAILSAFE — it guarantees we're notified of
//   every payment, even if the user never comes back to our site.
//
// SECURITY:
//   Razorpay signs every webhook payload with HMAC SHA-256 using our secret.
//   We MUST verify this before processing — otherwise anyone could POST
//   fake "payment.captured" events to our endpoint.
// ---------------------------------------------------------------------------
import crypto from 'crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Coupon from '../../models/Coupon.js';

const handleWebhook = asyncHandler(async (req, res) => {
  const secret = process.env.RAZORPAY_KEY_SECRET;

  // ---- Verify webhook signature ----
  const webhookSignature = req.headers['x-razorpay-signature'];
  if (!webhookSignature) {
    return res.status(400).json({ success: false, message: 'Missing signature' });
  }

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (expectedSignature !== webhookSignature) {
    console.error('[Webhook] Signature mismatch — rejecting');
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // ---- Process event ----
  const event = req.body.event;
  const payment = req.body.payload?.payment?.entity;

  if (event === 'payment.captured' && payment) {
    const razorpayOrderId = payment.order_id;

    // Find our order by Razorpay order ID
    const order = await Order.findOne({ razorpayOrderId });

    if (!order) {
      console.warn('[Webhook] No order found for razorpayOrderId:', razorpayOrderId);
      // Still return 200 — Razorpay will keep retrying on non-200
      return res.status(200).json({ success: true, message: 'Order not found, acknowledged' });
    }

    // Only process if still pending (idempotent)
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'paid';
      order.razorpayPaymentId = payment.id;
      order.orderStatus = 'confirmed';
      order.paidAt = new Date();
      await order.save();

      // Deduct stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: -item.quantity },
        });
      }

      // Increment coupon usage
      if (order.couponCode) {
        await Coupon.findOneAndUpdate(
          { code: order.couponCode },
          { $inc: { usedCount: 1 } }
        );
      }

      console.log('[Webhook] Order', order._id, 'marked as paid via webhook');
    }
  }

  // Always return 200 so Razorpay stops retrying
  res.status(200).json({ success: true, message: 'Webhook processed' });
});

export default handleWebhook;
