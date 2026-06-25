// ---------------------------------------------------------------------------
// B2B Lead Model — stores wholesale enquiry submissions
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';

const b2bLeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
      maxlength: 200,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    product: {
      type: String,
      required: [true, 'Product selection is required'],
      enum: [
        'Jaggery Balls / Laddu Gur',
        'Jaggery Candy / Cubes / Barfi',
        'Desi Khand / Jaggery Powder',
        'Multiple Products',
        'Other',
      ],
    },
    quantity: {
      type: String,
      required: [true, 'Quantity is required'],
      trim: true,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: '',
    },
    status: {
      type: String,
      enum: ['new', 'contacted', 'in-progress', 'converted', 'closed'],
      default: 'new',
    },
  },
  {
    timestamps: true,
  }
);

// Index for quick admin lookups
b2bLeadSchema.index({ status: 1, createdAt: -1 });

const B2BLead = mongoose.model('B2BLead', b2bLeadSchema);

export default B2BLead;
