// ---------------------------------------------------------------------------
// Banner Model
// ---------------------------------------------------------------------------
// WHY this exists:
//   The website has many static images — homepage hero, B2B banners, logo,
//   brand story images, etc. Previously these were hardcoded as Cloudinary
//   URLs in a JSON file or directly in the frontend code.
//
//   This model stores each image as a "banner slot" in the database so that
//   the admin can upload/replace any site image from the dashboard without
//   touching code or redeploying.
//
// HOW it works:
//   - `key` is a unique identifier like "home-hero", "b2b-warehouse", "main-logo"
//   - `image` stores the Cloudinary URL and publicId (for deletion)
//   - `label` is a human-readable name shown in the admin dashboard
//   - `section` groups banners by page/area for organized display
//
// WHERE this sits:
//   src/models/Banner.js ← You are here (data layer)
//   src/modules/banner/controller.js reads/writes this model
//   src/modules/banner/routes.js maps URLs to controllers
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';

const bannerSchema = new mongoose.Schema(
  {
    // Unique key identifier — e.g. "home-hero", "b2b-collage", "main-logo"
    key: {
      type: String,
      required: [true, 'Banner key is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    // Human-readable label — shown in admin dashboard
    label: {
      type: String,
      required: [true, 'Banner label is required'],
      trim: true,
      maxlength: [100, 'Label cannot exceed 100 characters'],
    },

    // Cloudinary image data
    image: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // SEO alt text for the image
    altText: {
      type: String,
      default: '',
      maxlength: [200, 'Alt text cannot exceed 200 characters'],
    },

    // Optional click-through link (e.g. banner links to /products)
    link: {
      type: String,
      default: '',
    },

    // Group banners by section for organized admin display
    // e.g. "homepage", "b2b", "branding", "about"
    section: {
      type: String,
      default: 'general',
      trim: true,
      lowercase: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Banner = mongoose.model('Banner', bannerSchema);
export default Banner;
