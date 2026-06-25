// ---------------------------------------------------------------------------
// OTPRecord Model — stores hashed OTPs for password reset flow
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';

const otpRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    hashedOTP: {
      type: String,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // MongoDB TTL index — auto-deletes expired docs
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient lookup: latest unused OTP for a user
otpRecordSchema.index({ userId: 1, used: 1, createdAt: -1 });

const OTPRecord = mongoose.model('OTPRecord', otpRecordSchema);
export default OTPRecord;
