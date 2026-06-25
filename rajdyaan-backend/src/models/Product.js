// ---------------------------------------------------------------------------
// Product Model
// ---------------------------------------------------------------------------
// WHY this is designed this way:
//
//   This is an e-commerce product for physical goods (natural/organic).
//   Every field serves a specific business purpose:
//
//   - `slug`        → SEO URLs. Google ranks /products/organic-honey-500g
//                     WAY higher than /products/64a3f2b1c8e9d. slugify
//                     auto-generates this from the product name.
//
//   - `images[]`    → Array of {url, publicId, alt}. We store Cloudinary
//                     URLs (not files on our server). publicId is needed
//                     to DELETE the image from Cloudinary later.
//                     alt text is for SEO + accessibility.
//
//   - `comparePrice`→ The "MRP" or "was ₹599" price. If set, the frontend
//                     shows a strike-through: ₹599 → ₹449 (25% off).
//
//   - `weight`      → Needed for shipping cost calculation (Shiprocket API
//                     requires weight in grams/kg to calculate courier charges).
//
//   - `ratingsAverage / ratingsCount` → Denormalized from the Review model.
//                     Instead of computing avg rating from 10,000 reviews on
//                     every page load, we store the computed value here and
//                     update it when a review is added/deleted.
//                     This is a VERY common MongoDB pattern.
//
//   - Text index    → MongoDB's built-in full-text search. When a user types
//                     "organic honey" in the search bar, Mongo searches across
//                     name, description, and tags simultaneously.
//                     It's free, fast, and good enough until you need Algolia.
//
// WHERE this file sits in the architecture:
//   src/models/Product.js ← You are here (data layer)
//   src/modules/product/service.js reads/writes this model (business logic)
//   src/modules/product/controller.js calls the service (HTTP handler)
//   src/modules/product/routes.js maps URLs to controllers (routing)
// ---------------------------------------------------------------------------
import mongoose from 'mongoose';
import slugify from 'slugify';

// ---------------------------------------------------------------------------
// Sub-schema for product images
// ---------------------------------------------------------------------------
const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true }, // needed to delete from Cloudinary
    alt: { type: String, default: '' },         // SEO alt text
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Sub-schema for story sections (The Bilona Method, Farm to Spoon, etc.)
// ---------------------------------------------------------------------------
// WHY structured:
//   Instead of a single "description" blob, each product can have multiple
//   visual story blocks. Each block has a title, body text, an optional image,
//   and a layout hint so the frontend renders alternating layouts.
// ---------------------------------------------------------------------------
const storySectionSchema = new mongoose.Schema(
  {
    title:       { type: String, required: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    image: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
    },
    layout: {
      type: String,
      enum: ['full-width', 'image-left', 'image-right', 'text-only'],
      default: 'image-left',
    },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Sub-schema for FAQ items
// ---------------------------------------------------------------------------
const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, maxlength: 300 },
    answer:   { type: String, required: true, maxlength: 2000 },
    order:    { type: Number, default: 0 },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Sub-schema for trust badges
// ---------------------------------------------------------------------------
const trustBadgeSchema = new mongoose.Schema(
  {
    icon:  { type: String, required: true }, // emoji or icon name (e.g. "🔬", "truck", "shield")
    label: { type: String, required: true, maxlength: 60 },
  },
  { _id: false }
);

// ---------------------------------------------------------------------------
// Sub-schema for structured benefits (with icon + heading + description)
// ---------------------------------------------------------------------------
const benefitSchema = new mongoose.Schema(
  {
    icon:        { type: String, default: '✅' },
    title:       { type: String, required: true, maxlength: 80 },
    description: { type: String, default: '', maxlength: 300 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [120, 'Product name cannot exceed 120 characters'],
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },

    sku: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },

    shortDescription: {
      type: String,
      maxlength: [300, 'Short description cannot exceed 300 characters'],
      default: '',
    },

    // ---------------------------------------------------------------------------
    // LEGACY plain-text fields (kept for backward compatibility + simple editing)
    // ---------------------------------------------------------------------------
    benefits: {
      type: String,
      default: '',
    },

    ingredients: {
      type: String,
      default: '',
    },

    storageConditions: {
      type: String,
      default: '',
    },

    // ---------------------------------------------------------------------------
    // STRUCTURED CONTENT — Category-Driven Product Page Data
    // ---------------------------------------------------------------------------
    // These fields power the premium, Anveshan-style product detail pages.
    // The frontend reads the category slug and picks the right template,
    // then populates these sections dynamically.
    // ---------------------------------------------------------------------------

    // Rich story sections: each block = title + paragraph + image + layout
    storySections: {
      type: [storySectionSchema],
      default: [],
    },

    // Structured benefits with icons (shown in a grid)
    benefitsList: {
      type: [benefitSchema],
      default: [],
    },

    // Structured FAQ accordion
    faq: {
      type: [faqSchema],
      default: [],
    },

    // Per-product trust badges (overrides defaults if set)
    trustBadges: {
      type: [trustBadgeSchema],
      default: [],
    },

    // Structured ingredients list (array of strings)
    ingredientsList: {
      type: [String],
      default: [],
    },

    // ---------------------------------------------------------------------------
    // CATEGORY-SPECIFIC METADATA
    // ---------------------------------------------------------------------------
    // WHY a mixed-type "categoryMeta" field:
    //   Different categories need different fields:
    //   - Ghee: { method: "Bilona", milkSource: "A2 Cow" }
    //   - Oil:  { smokePoint: "240°C", extractionMethod: "Cold Pressed" }
    //   - Saree: { fabric: "Banarasi Silk", blouseIncluded: true }
    //
    //   Using Schema.Types.Mixed lets each product store whatever key-value
    //   pairs its category template needs, without schema migrations.
    //   The frontend template knows which keys to read.
    // ---------------------------------------------------------------------------
    categoryMeta: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    // ---------------------------------------------------------------------------
    // Pricing
    // ---------------------------------------------------------------------------
    // price = selling price (what the customer pays)
    // comparePrice = original/MRP price (shown as strikethrough)
    // If comparePrice > price → frontend shows "X% off"
    // ---------------------------------------------------------------------------
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },

    comparePrice: {
      type: Number,
      default: null,
      validate: {
        validator: function (val) {
          // comparePrice should be greater than or equal to price, or null
          return val === null || val >= this.price;
        },
        message: 'Compare price must be greater than or equal to the selling price',
      },
    },

    // ---------------------------------------------------------------------------
    // Images — stored on Cloudinary, max 10 per product
    // ---------------------------------------------------------------------------
    images: {
      type: [imageSchema],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'A product can have a maximum of 10 images',
      },
    },

    // ---------------------------------------------------------------------------
    // Category reference
    // ---------------------------------------------------------------------------
    // WHY ref instead of embedding:
    //   If you rename "Honey" to "Pure Honey", you update ONE category document.
    //   If you embedded the name in every product, you'd update thousands.
    //   ref = foreign key. populate() joins them at query time.
    // ---------------------------------------------------------------------------
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
      index: true,
    },

    // Free-form tags for search + filtering: ["organic", "raw", "unprocessed"]
    tags: [{ type: String, trim: true, lowercase: true }],

    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Weight in grams — required for Shiprocket shipping cost calc
    weight: {
      type: Number,
      default: 0,
      min: [0, 'Weight cannot be negative'],
    },

    // ---------------------------------------------------------------------------
    // Denormalized ratings
    // ---------------------------------------------------------------------------
    // WHY denormalize:
    //   Computing avg(all reviews for product X) on every product list page
    //   is extremely expensive at scale. Instead, the Review module updates
    //   these two fields whenever a review is created/updated/deleted.
    //   This is standard in MongoDB — trade write complexity for read speed.
    // ---------------------------------------------------------------------------
    ratingsAverage: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be below 0'],
      max: [5, 'Rating cannot exceed 5'],
      set: (val) => Math.round(val * 10) / 10, // 4.666 → 4.7
    },

    ratingsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // adds createdAt + updatedAt automatically

    // ---------------------------------------------------------------------------
    // Virtual fields
    // ---------------------------------------------------------------------------
    // WHY virtuals:
    //   Computed fields that don't get stored in the DB but appear in JSON.
    //   `discount` tells the frontend "this product is 25% off" without
    //   storing it — it's always derived from price vs comparePrice.
    // ---------------------------------------------------------------------------
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ---------------------------------------------------------------------------
// Virtual: discount percentage
// ---------------------------------------------------------------------------
productSchema.virtual('discount').get(function () {
  if (!this.comparePrice || this.comparePrice <= this.price) return 0;
  return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
});

// ---------------------------------------------------------------------------
// Indexes
// ---------------------------------------------------------------------------
// WHY these indexes:
//   - slug: every public product page does findOne({ slug }) — must be fast
//   - category + isActive: product listing pages filter by both
//   - text index: enables $text search across name, description, tags
//     Example: Product.find({ $text: { $search: "organic honey" } })
//
// HOW text index works:
//   MongoDB breaks text into "stems" — "running" becomes "run".
//   It then searches across ALL indexed text fields simultaneously.
//   The { weights } tell Mongo which field matters more:
//     name (weight 10) > tags (5) > description (1)
//   So "honey" in the name ranks higher than "honey" in the description.
// ---------------------------------------------------------------------------
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index(
  { name: 'text', description: 'text', tags: 'text' },
  { weights: { name: 10, tags: 5, description: 1 } }
);

// ---------------------------------------------------------------------------
// Pre-save hook: auto-generate slug from product name
// ---------------------------------------------------------------------------
// WHAT happens:
//   "Organic Honey 500g" → "organic-honey-500g"
//   If "organic-honey-500g" already exists, append a random suffix:
//   "organic-honey-500g-a3f2" — prevents duplicate slug crashes.
//
// WHY in pre-save:
//   Same reason as Category — ensures slug is ALWAYS generated correctly,
//   no matter if the product is created via API, admin panel, or seed script.
// ---------------------------------------------------------------------------
productSchema.pre('save', async function (next) {
  if (!this.isModified('name')) return next();

  let baseSlug = slugify(this.name, { lower: true, strict: true });

  // Check for duplicate slug (another product might have the same name)
  const existing = await mongoose.model('Product').findOne({ slug: baseSlug, _id: { $ne: this._id } });
  if (existing) {
    // Append 4 random hex chars: "organic-honey-500g" → "organic-honey-500g-a3f2"
    const suffix = Math.random().toString(16).slice(2, 6);
    baseSlug = `${baseSlug}-${suffix}`;
  }

  this.slug = baseSlug;
  next();
});

const Product = mongoose.model('Product', productSchema);
export default Product;
