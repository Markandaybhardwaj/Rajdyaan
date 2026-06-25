// ---------------------------------------------------------------------------
// Payment Controller — create-order + verify
// ---------------------------------------------------------------------------
// SECURITY:
//   1. NEVER trust amounts from the frontend — always recalculate from DB.
//   2. ALWAYS verify Razorpay signature with HMAC SHA-256 before marking paid.
//   3. razorpayKeyId is safe to expose to frontend (it's a public identifier).
//      razorpayKeySecret NEVER leaves this server.
// ---------------------------------------------------------------------------
import crypto from 'crypto';
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import Coupon from '../../models/Coupon.js';
import { createRazorpayOrder } from './razorpay.js';
import { sendOrderConfirmation } from '../notification/email.js';

// ---------------------------------------------------------------------------
// POST /api/v1/payment/create-order
// ---------------------------------------------------------------------------
// Body: { items: [{ productId, quantity }], shippingAddress: {}, couponCode? }
// Auth: required (req.user.id)
//
// FLOW:
//   1. Fetch every product from DB → get real prices (NEVER trust frontend)
//   2. Calculate subtotal server-side
//   3. Apply coupon if present (server-side validation)
//   4. Save Order to MongoDB with paymentStatus: 'pending'
//   5. Create Razorpay order
//   6. Return razorpayOrderId + amount + keyId to frontend
// ---------------------------------------------------------------------------
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, couponCode } = req.body;

  // ---- Validate inputs ----
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }
  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone ||
      !shippingAddress.addressLine1 || !shippingAddress.city ||
      !shippingAddress.state || !shippingAddress.pincode) {
    throw new ApiError(400, 'Complete shipping address is required');
  }

  // ---- Validate all productIds are real MongoDB ObjectIds ----
  // Cart items from static/fallback data (e.g. 'jag-006') are NOT real DB products.
  // MongoDB would crash with a CastError — we catch it here with a clear message.
  const { Types: { ObjectId } } = (await import('mongoose'));
  const invalidIds = items.filter((i) => !ObjectId.isValid(i.productId));
  if (invalidIds.length > 0) {
    throw new ApiError(400, `Your cart contains demo products ("${invalidIds[0].productId}") that are not available for purchase. Please add real products from the Products page.`);
  }

  // ---- Fetch product prices from DB (NEVER trust frontend prices) ----
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds }, isActive: true });

  if (products.length !== productIds.length) {
    throw new ApiError(400, 'One or more products are unavailable');
  }

  // Build order items with DB prices + check stock
  const orderItems = [];
  let subtotal = 0;

  for (const cartItem of items) {
    const product = products.find((p) => p._id.toString() === cartItem.productId);
    if (!product) throw new ApiError(400, `Product ${cartItem.productId} not found`);

    if (product.stock < cartItem.quantity) {
      throw new ApiError(400, `"${product.name}" has only ${product.stock} units in stock`);
    }

    const lineTotal = product.price * cartItem.quantity;
    subtotal += lineTotal;

    orderItems.push({
      product: product._id,
      name: product.name,
      price: product.price,
      quantity: cartItem.quantity,
      image: product.images?.[0]?.url || '',
    });
  }

  // ---- Apply coupon (server-side only) ----
  let discountAmount = 0;
  let validatedCouponCode = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      isActive: true,
    });

    if (!coupon) {
      throw new ApiError(400, 'Invalid coupon code');
    }
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      throw new ApiError(400, 'Coupon has expired');
    }
    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      throw new ApiError(400, 'Coupon usage limit reached');
    }
    if (subtotal < coupon.minOrderAmount) {
      throw new ApiError(400, `Minimum order ₹${coupon.minOrderAmount} required for this coupon`);
    }

    if (coupon.type === 'percentage') {
      const raw = (subtotal * coupon.value) / 100;
      discountAmount = coupon.maxDiscount ? Math.min(raw, coupon.maxDiscount) : raw;
    } else {
      discountAmount = Math.min(coupon.value, subtotal);
    }

    discountAmount = Math.round(discountAmount * 100) / 100;
    validatedCouponCode = coupon.code;
  }

  // ---- Calculate final total ----
  const shippingCharge = subtotal >= 499 ? 0 : 49; // free shipping above ₹499
  const total = Math.max(0, subtotal - discountAmount + shippingCharge);

  // Round to 2 decimal places (Razorpay needs clean numbers)
  const finalTotal = Math.round(total * 100) / 100;

  // ---- Create Order in DB (pending payment) ----
  const order = await Order.create({
    user: req.user.id,
    items: orderItems,
    shippingAddress,
    subtotal,
    discountAmount,
    shippingCharge,
    total: finalTotal,
    couponCode: validatedCouponCode,
    paymentMethod: 'razorpay',
    paymentStatus: 'pending',
    orderStatus: 'pending',
  });

  // ---- Create Razorpay order ----
  const razorpayOrder = await createRazorpayOrder(
    finalTotal,
    order._id.toString()
  );

  // Save Razorpay order ID back to our order
  order.razorpayOrderId = razorpayOrder.id;
  await order.save();

  // ---- 1 Hour Payment Pending Timer ----
  setTimeout(async () => {
    try {
      const pendingOrder = await Order.findById(order._id);
      if (pendingOrder && pendingOrder.paymentStatus === 'pending' && pendingOrder.orderStatus !== 'cancelled') {
        pendingOrder.orderStatus = 'cancelled';
        pendingOrder.paymentStatus = 'failed';
        await pendingOrder.save();
        console.log(`[Timer] Order ${pendingOrder._id} auto-cancelled after 1 hour of pending payment.`);
      }
    } catch (err) {
      console.error(`[Timer Error] Failed to auto-cancel order ${order._id}:`, err);
    }
  }, 60 * 60 * 1000); // 1 hour

  // ---- Respond ----
  res.status(201).json(
    new ApiResponse(201, {
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,        // in paise
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,  // safe to expose — it's a public key
    }, 'Order created successfully')
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/payment/verify
// ---------------------------------------------------------------------------
// Body: { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId }
// Auth: required
//
// CRITICAL SECURITY:
//   Razorpay sends a signature = HMAC-SHA256(orderId + "|" + paymentId, secret).
//   We recreate this on our server and compare. If they don't match, the
//   payment is FAKE — someone is trying to mark an order as paid without paying.
// ---------------------------------------------------------------------------
export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature, orderId } = req.body;

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !orderId) {
    throw new ApiError(400, 'Missing payment verification data');
  }

  // ---- HMAC SHA-256 verification ----
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpaySignature) {
    // SECURITY: signature mismatch — do NOT mark as paid
    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'failed' });
    throw new ApiError(400, 'Payment verification failed — signature mismatch');
  }

  // ---- Signature valid — update order ----
  const order = await Order.findById(orderId).populate('user');
  if (!order) throw new ApiError(404, 'Order not found');

  // Prevent double-processing
  if (order.paymentStatus === 'paid') {
    return res.status(200).json(
      new ApiResponse(200, { orderId: order._id }, 'Payment already verified')
    );
  }

  order.paymentStatus = 'paid';
  order.razorpayPaymentId = razorpayPaymentId;
  order.orderStatus = 'confirmed';
  order.paidAt = new Date();
  await order.save();

  // Send order confirmation email
  if (order.user && order.user.email) {
    await sendOrderConfirmation(order, order.user);
  }

  // ---- Deduct stock ----
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity },
    });
  }

  // ---- Increment coupon usage ----
  if (order.couponCode) {
    await Coupon.findOneAndUpdate(
      { code: order.couponCode },
      { $inc: { usedCount: 1 } }
    );
  }

  res.status(200).json(
    new ApiResponse(200, { orderId: order._id }, 'Payment verified successfully')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/payment/key
// ---------------------------------------------------------------------------
// Returns the Razorpay key_id (public) so the frontend can initialise checkout.
// This avoids hardcoding the key in frontend env files during deployment.
// ---------------------------------------------------------------------------
export const getKey = asyncHandler(async (req, res) => {
  res.status(200).json(
    new ApiResponse(200, { keyId: process.env.RAZORPAY_KEY_ID })
  );
});
