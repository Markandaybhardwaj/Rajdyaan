// ---------------------------------------------------------------------------
// Razorpay Helper — initialises the SDK and exposes order-creation
// ---------------------------------------------------------------------------
// WHY a separate helper:
//   The controller shouldn't know HOW to talk to Razorpay (SDK init, amount
//   conversion, error wrapping). This module encapsulates all of that.
//   If we ever switch to Cashfree/Paytm, only this file changes.
// ---------------------------------------------------------------------------
import Razorpay from 'razorpay';
import ApiError from '../../utils/ApiError.js';

let instance = null;

/**
 * Lazily initialise the Razorpay SDK.
 * Called once; subsequent calls return the cached instance.
 */
function getRazorpayInstance() {
  if (instance) return instance;

  const key_id     = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    throw new ApiError(500, 'Razorpay credentials not configured on server');
  }

  instance = new Razorpay({ key_id, key_secret });
  return instance;
}

/**
 * Create a Razorpay order.
 *
 * @param {number} amountInRupees — e.g. 499.50
 * @param {string} receipt        — unique receipt id (our DB order _id)
 * @param {string} currency       — default INR
 * @returns {Promise<Object>}     — Razorpay order object with `id`, `amount`, etc.
 */
export async function createRazorpayOrder(amountInRupees, receipt, currency = 'INR') {
  const razorpay = getRazorpayInstance();

  // Razorpay expects amount in PAISE (₹1 = 100 paise)
  const amountInPaise = Math.round(amountInRupees * 100);

  if (amountInPaise < 100) {
    throw new ApiError(400, 'Order amount must be at least ₹1');
  }

  try {
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency,
      receipt,
      payment_capture: 1, // auto-capture on successful payment
    });

    return order;
  } catch (err) {
    console.error('[Razorpay] Order creation failed:', err);
    throw new ApiError(502, 'Payment gateway error — please try again');
  }
}

/**
 * Fetch a Razorpay order by its ID (used in webhook reconciliation).
 */
export async function fetchRazorpayOrder(razorpayOrderId) {
  const razorpay = getRazorpayInstance();
  return razorpay.orders.fetch(razorpayOrderId);
}

export default getRazorpayInstance;
