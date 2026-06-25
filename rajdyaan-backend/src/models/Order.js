// ---------------------------------------------------------------------------
// Order Model — stores every checkout
// ---------------------------------------------------------------------------
// WHY this design:
//   - items[] embeds product snapshots (name, price, image at time of purchase).
//     Even if a product is later deleted or its price changes, the order
//     record remains accurate forever.
//   - shippingAddress is embedded (not referenced) because addresses can
//     change — the order should always show the address it shipped to.
//   - razorpayOrderId + razorpayPaymentId link this order to Razorpay's system
//     for payment reconciliation and refunds.
//   - paymentStatus is the source of truth for "did money come in?".
//     orderStatus tracks fulfillment (packing → shipped → delivered).
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    name:     { type: String, required: true },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    image:    { type: String, default: '' },
  },
  { _id: false }
);

const shippingAddressSchema = new mongoose.Schema(
  {
    fullName:     { type: String, required: true, trim: true },
    phone:        { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, default: '',   trim: true },
    city:         { type: String, required: true, trim: true },
    state:        { type: String, required: true, trim: true },
    pincode:      { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: 'Order must have at least one item',
      },
    },

    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },

    // ---- Money ----
    subtotal:       { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0,     min: 0 },
    shippingCharge: { type: Number, default: 0,     min: 0 },
    total:          { type: Number, required: true, min: 0 },
    couponCode:     { type: String, default: null },

    // ---- Payment ----
    paymentMethod: {
      type: String,
      enum: ['razorpay', 'cod'],
      default: 'razorpay',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    razorpayOrderId:   { type: String, default: null, index: true },
    razorpayPaymentId: { type: String, default: null },

    // ---- Fulfillment ----
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending',
      index: true,
    },

    // ---- Shiprocket Integration ----
    shiprocketOrderId: { type: String, default: null },
    awbCode:           { type: String, default: null, index: true },
    courierName:       { type: String, default: null },

    paidAt:      { type: Date, default: null },
    shippedAt:   { type: Date, default: null },
    deliveredAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index for admin queries: "show me all paid orders, newest first"
orderSchema.index({ paymentStatus: 1, createdAt: -1 });

const Order = mongoose.model('Order', orderSchema);
export default Order;
