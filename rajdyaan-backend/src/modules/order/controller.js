// ---------------------------------------------------------------------------
// Order Controller — user-facing order queries + coupon validation
// ---------------------------------------------------------------------------
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Order from '../../models/Order.js';
import Coupon from '../../models/Coupon.js';

// ---------------------------------------------------------------------------
// GET /api/v1/order/my-orders
// ---------------------------------------------------------------------------
// Returns all orders for the logged-in user, newest first.
// ---------------------------------------------------------------------------
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json(new ApiResponse(200, { orders }));
});

// ---------------------------------------------------------------------------
// GET /api/v1/order/:id
// ---------------------------------------------------------------------------
// Returns a single order — only if it belongs to the logged-in user.
// ---------------------------------------------------------------------------
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).lean();

  if (!order) throw new ApiError(404, 'Order not found');

  // Ensure the user owns this order (or is admin)
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorised to view this order');
  }

  res.status(200).json(new ApiResponse(200, { order }));
});

// ---------------------------------------------------------------------------
// POST /api/v1/order/validate-coupon
// ---------------------------------------------------------------------------
// Body: { code, subtotal }
// Used by the cart page to show discount preview.
// The REAL discount is recalculated server-side during create-order.
// ---------------------------------------------------------------------------
export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, subtotal } = req.body;

  if (!code) throw new ApiError(400, 'Coupon code is required');

  const coupon = await Coupon.findOne({
    code: code.toUpperCase(),
    isActive: true,
  });

  if (!coupon) throw new ApiError(404, 'Invalid coupon code');

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    throw new ApiError(400, 'Coupon has expired');
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new ApiError(400, 'Coupon usage limit reached');
  }

  if (subtotal < coupon.minOrderAmount) {
    throw new ApiError(400, `Minimum order ₹${coupon.minOrderAmount} required`);
  }

  res.status(200).json(
    new ApiResponse(200, {
      coupon: {
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        maxDiscount: coupon.maxDiscount,
      },
    }, 'Coupon is valid')
  );
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/order/:id/cancel
// ---------------------------------------------------------------------------
// Cancels an order — only if it belongs to the user AND status is 'pending'.
// If a Shiprocket shipment exists, it's cancelled there too.
// ---------------------------------------------------------------------------
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) throw new ApiError(404, 'Order not found');

  // Ownership check
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorised to cancel this order');
  }

  // Only pending or confirmed orders can be cancelled by user
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    throw new ApiError(
      400,
      `Cannot cancel — order is already "${order.orderStatus}"`
    );
  }

  // Cancel on Shiprocket if shipment was created
  if (order.shiprocketOrderId) {
    try {
      const { cancelShiprocketOrder } = await import('./../../modules/shipping/shiprocket.js');
      await cancelShiprocketOrder(order.shiprocketOrderId);
    } catch (err) {
      console.warn('[Cancel] Shiprocket cancellation failed:', err.message);
      // Continue with local cancellation even if Shiprocket fails
    }
  }

  order.orderStatus = 'cancelled';
  await order.save();

  res.status(200).json(
    new ApiResponse(200, { order }, 'Order cancelled successfully')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/order/admin/all
// ---------------------------------------------------------------------------
// Admin-only — returns all orders with optional filters + pagination
// ---------------------------------------------------------------------------
export const adminGetAllOrders = asyncHandler(async (req, res) => {
  const {
    status,
    paymentStatus,
    search,
    page = 1,
    limit = 20,
    sort = '-createdAt',
  } = req.query;

  const filter = {};

  if (status && status !== 'all') filter.orderStatus = status;
  if (paymentStatus && paymentStatus !== 'all') filter.paymentStatus = paymentStatus;

  // Search by order ID (last 8 chars) or customer name in shipping address
  if (search) {
    filter.$or = [
      { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
  const skip = (pageNum - 1) * limitNum;

  // Build sort
  const sortObj = {};
  if (sort.startsWith('-')) {
    sortObj[sort.slice(1)] = -1;
  } else {
    sortObj[sort] = 1;
  }

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email')
      .lean(),
    Order.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      orders,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
    })
  );
});

// ---------------------------------------------------------------------------
// PATCH /api/v1/order/admin/:id/status
// ---------------------------------------------------------------------------
// Admin-only — update order status (e.g. pending → confirmed → processing)
// ---------------------------------------------------------------------------
export const adminUpdateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

  if (!validStatuses.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${validStatuses.join(', ')}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, 'Order not found');

  // Cancel on Shiprocket if cancelling a shipped order
  if (status === 'cancelled' && order.shiprocketOrderId) {
    try {
      const { cancelShiprocketOrder } = await import('./../../modules/shipping/shiprocket.js');
      await cancelShiprocketOrder(order.shiprocketOrderId);
    } catch (err) {
      console.warn('[Admin] Shiprocket cancellation failed:', err.message);
    }
  }

  order.orderStatus = status;

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json(
    new ApiResponse(200, { order }, `Order status updated to "${status}"`)
  );
});

