// ---------------------------------------------------------------------------
// Category Model
// ---------------------------------------------------------------------------
// WHY this exists:
//   Every product belongs to a category (e.g., "Honey", "Oils", "Spices").
//   Categories let us:
//     1. Filter products on the frontend (/products?category=honey)
//     2. Build a category navigation sidebar
//     3. Create SEO-friendly category pages (/category/organic-honey)
//
// HOW it works:
//   - `name` is the display name ("Organic Honey")
//   - `slug` is auto-generated from name for URLs ("organic-honey")
//   - `parentCategory` allows nesting (e.g., "Raw Honey" under "Honey")
//     This is called a "self-referencing" relationship — a category can
//     point to another category as its parent.
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';
import slugify from 'slugify';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      unique: true,
      maxlength: [60, 'Category name cannot exceed 60 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // Category banner/icon image — stored on Cloudinary
    image: {
      url: { type: String, default: '' },
      publicId: { type: String, default: '' },
    },

    // Self-referencing: allows "Honey > Raw Honey > Wild Forest Honey"
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    // ---------------------------------------------------------------------------
    // Template slug — maps this category to a frontend template
    // ---------------------------------------------------------------------------
    // WHY:
    //   The product detail page uses this to decide which template to render:
    //   \"ghee\" → GheeTemplate, \"oil\" → OilTemplate, \"sweetener\" → SweetenerTemplate
    //   If not set, the page falls back to a DefaultTemplate.
    // ---------------------------------------------------------------------------
    templateSlug: {
      type: String,
      enum: ['ghee', 'oil', 'sweetener', 'saree', 'default'],
      default: 'sweetener',
    },

    // Default trust badges for all products in this category
    defaultTrustBadges: [
      {
        icon:  { type: String },
        label: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// ---------------------------------------------------------------------------
// Pre-save hook: auto-generate slug from name
// ---------------------------------------------------------------------------
// WHAT this does:
//   Before saving to MongoDB, if `name` changed, we create a URL-safe slug.
//   slugify("Organic Honey") → "organic-honey"
//   This slug is what appears in URLs: /category/organic-honey
//
// WHY pre-save and not in controller:
//   Keeps the logic IN the model — no matter where a category is created
//   (admin panel, seed script, API), the slug is always generated correctly.
// ---------------------------------------------------------------------------
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);
export default Category;
