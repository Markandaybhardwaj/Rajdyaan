// ---------------------------------------------------------------------------
// Shipping Controller — admin creates shipments, users track their orders
// ---------------------------------------------------------------------------
// POST /api/v1/shipping/create     — Admin only — create Shiprocket shipment
// GET  /api/v1/shipping/track/:id  — Auth required — track order by orderId
// POST /api/v1/shipping/webhook    — Shiprocket status webhook (no auth)
// ---------------------------------------------------------------------------
import asyncHandler from '../../utils/asyncHandler.js';
import ApiError from '../../utils/ApiError.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Order from '../../models/Order.js';
import {
  createShipment,
  trackShipment,
  cancelShiprocketOrder,
} from './shiprocket.js';
import { sendDispatchNotification } from '../notification/email.js';

// ---------------------------------------------------------------------------
// POST /api/v1/shipping/create
// Body: { orderId }
// Admin creates a Shiprocket shipment → stores AWB on Order document
// ---------------------------------------------------------------------------
export const createShiprocketShipment = asyncHandler(async (req, res) => {
  const { orderId } = req.body;

  if (!orderId) {
    throw new ApiError(400, 'orderId is required');
  }

  const order = await Order.findById(orderId)
    .populate('user')
    .populate('items.product', 'weight name');

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Don't re-ship an already shipped or cancelled order
  if (order.awbCode) {
    throw new ApiError(400, `Order already has AWB: ${order.awbCode}`);
  }

  if (order.orderStatus === 'cancelled') {
    throw new ApiError(400, 'Cannot ship a cancelled order');
  }

  if (order.paymentStatus !== 'paid' && order.paymentMethod !== 'cod') {
    throw new ApiError(400, 'Cannot ship — payment not completed');
  }

  // Call Shiprocket API
  const shipment = await createShipment(order);

  // Update order in MongoDB
  order.shiprocketOrderId = shipment.shiprocketOrderId;
  order.awbCode = shipment.awbCode;
  order.courierName = shipment.courierName;
  order.orderStatus = 'shipped';
  order.shippedAt = new Date();
  await order.save();

  // Send dispatch notification email
  if (order.user && order.user.email) {
    await sendDispatchNotification(order, order.user);
  }

  res.status(200).json(
    new ApiResponse(200, {
      orderId: order._id,
      shiprocketOrderId: shipment.shiprocketOrderId,
      awbCode: shipment.awbCode,
      courierName: shipment.courierName,
    }, 'Shipment created successfully')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/shipping/track/:orderId
// Auth required — returns tracking info for an order
// ---------------------------------------------------------------------------
export const trackOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId).lean();

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  // Users can only track their own orders (admins can track any)
  if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
    throw new ApiError(403, 'Not authorised to track this order');
  }

  if (!order.awbCode) {
    // Order exists but hasn't been shipped yet — return status without tracking
    return res.status(200).json(
      new ApiResponse(200, {
        orderStatus: order.orderStatus,
        awbCode: null,
        tracking: null,
        message: 'Order has not been shipped yet',
      })
    );
  }

  // Fetch live tracking from Shiprocket
  const tracking = await trackShipment(order.awbCode);

  res.status(200).json(
    new ApiResponse(200, {
      orderStatus: order.orderStatus,
      awbCode: order.awbCode,
      courierName: order.courierName,
      shippedAt: order.shippedAt,
      tracking,
    })
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/shipping/webhook
// Shiprocket sends status updates here — no auth required
// Updates order status in DB based on Shiprocket's status codes
// ---------------------------------------------------------------------------
export const shiprocketWebhook = asyncHandler(async (req, res) => {
  const { awb, current_status, etd } = req.body;

  if (!awb) {
    return res.status(200).json({ success: true, message: 'No AWB — ignored' });
  }

  const order = await Order.findOne({ awbCode: awb });

  if (!order) {
    // Unknown AWB — might be from a different system, acknowledge anyway
    return res.status(200).json({ success: true, message: 'AWB not found — ignored' });
  }

  // Map Shiprocket status to our orderStatus enum
  const statusMap = {
    // Shiprocket status codes → our status
    6: 'shipped',       // Shipped
    7: 'delivered',     // Delivered
    8: 'cancelled',     // RTO Initiated
    17: 'shipped',      // Out for Delivery
    18: 'shipped',      // In Transit
    19: 'shipped',      // Picked Up
    22: 'delivered',    // Delivered to Customer
  };

  const newStatus = statusMap[current_status] || order.orderStatus;

  if (newStatus !== order.orderStatus) {
    order.orderStatus = newStatus;

    if (newStatus === 'delivered') {
      order.deliveredAt = new Date();
    }

    await order.save();
    console.log(`[Shiprocket Webhook] Order ${order._id} → ${newStatus} (AWB: ${awb})`);
  }

  // Always respond 200 to Shiprocket webhooks
  res.status(200).json({ success: true, message: 'Webhook processed' });
});
