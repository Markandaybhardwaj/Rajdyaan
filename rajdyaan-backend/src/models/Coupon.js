// ---------------------------------------------------------------------------
// Coupon Model — server-side validated discount codes
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },

    // 'percentage' → value is 10 (means 10% off)
    // 'flat'       → value is 100 (means ₹100 off)
    type: {
      type: String,
      enum: ['percentage', 'flat'],
      required: true,
    },

    value: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0, 'Discount cannot be negative'],
    },

    // For percentage coupons: cap the max discount
    // E.g. 20% off, max ₹200
    maxDiscount: {
      type: Number,
      default: null,
    },

    // Minimum cart subtotal required to use this coupon
    minOrderAmount: {
      type: Number,
      default: 0,
    },

    // How many times this coupon can be used in total
    usageLimit: {
      type: Number,
      default: null, // null = unlimited
    },

    // How many times it has already been used
    usedCount: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Coupon = mongoose.model('Coupon', couponSchema);
export default Coupon;
