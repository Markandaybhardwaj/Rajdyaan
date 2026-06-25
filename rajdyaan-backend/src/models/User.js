import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema({
  label: { type: String, default: 'Home' },           // Home / Office / Other
  fullName: { type: String },
  phone: { type: String },
  addressLine1: { type: String, required: true },
  addressLine2: String,
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  isDefault: { type: Boolean, default: false },
}, { _id: true });

const userSchema = new mongoose.Schema(
  {
    // ---- Auth / Identity -----------------------------------------------
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },

    // Separate first / last name for profile display & avatar initials
    firstName: { type: String, trim: true, maxlength: 30 },
    lastName:  { type: String, trim: true, maxlength: 30 },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    passwordHash: {
      type: String,
      minlength: [8, 'Password must be at least 8 characters'],
      // Not required — Google OAuth users won't have a password
      select: false,
    },

    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    googleId: {
      type: String,
      default: null,
      sparse: true,
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // ---- Contact -------------------------------------------------------
    phone:    { type: String, trim: true, maxlength: 15 },
    whatsapp: { type: String, trim: true, maxlength: 15 },

    // ---- Demographics --------------------------------------------------
    gender: {
      type: String,
      enum: ['female', 'male', 'other', 'prefer_not_to_say', ''],
      default: '',
    },
    ageRange: {
      type: String,
      enum: ['18-24', '25-34', '35-44', '45-54', '55+', ''],
      default: '',
    },

    // ---- Food preferences ----------------------------------------------
    dietType: [{
      type: String,
      enum: ['vegetarian', 'vegan', 'jain', 'non-veg', 'no_preference'],
    }],
    allergies: [{
      type: String,
      enum: ['gluten', 'nuts', 'dairy', 'soy', 'sugar_free'],
    }],

    // ---- Notification preferences --------------------------------------
    notifications: {
      sms:          { type: Boolean, default: true  },
      emailOffers:  { type: Boolean, default: false },
      whatsapp:     { type: Boolean, default: true  },
    },

    // ---- Addresses & wishlist ------------------------------------------
    addresses: [addressSchema],

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      transform(_doc, ret) {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook: hash password with bcryptjs (saltRounds: 12) if modified
// ---------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Only hash if passwordHash was actually set/modified
  if (!this.isModified('passwordHash')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// ---------------------------------------------------------------------------
// Instance method: compare a plain-text password against the stored hash
// ---------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (plainPassword) {
  // passwordHash has select: false, so it must have been explicitly selected
  if (!this.passwordHash) return false;
  return bcrypt.compare(plainPassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);
export default User;
