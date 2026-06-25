// ---------------------------------------------------------------------------
// Product Service — business logic for CRUD, search, filtering, images
// ---------------------------------------------------------------------------
// WHERE this sits in the architecture:
//
//   Request → routes.js → controller.js → SERVICE.js ← You are here → Model
//
// WHY a service layer:
//   Controllers should ONLY handle HTTP (req/res). Business logic lives here.
//   Benefits:
//   1. Testable — you can unit-test getAllProducts() without HTTP mocking
//   2. Reusable — if the admin module also needs to fetch products, it
//      imports this service instead of duplicating code
//   3. Single responsibility — controller handles HTTP, service handles logic
// ---------------------------------------------------------------------------
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import ApiError from '../../utils/ApiError.js';

// ---------------------------------------------------------------------------
// GET ALL PRODUCTS — with filtering, sorting, search, pagination
// ---------------------------------------------------------------------------
// HOW filtering works (the query pipeline):
//
//   Frontend sends: GET /api/v1/products?category=abc123&minPrice=200&maxPrice=500
//                                        &search=honey&sort=-price&page=2&limit=12
//
//   We build a MongoDB filter object step by step:
//     1. Start with { isActive: true } (never show deactivated products)
//     2. If category param exists → add { category: 'abc123' }
//     3. If price range → add { price: { $gte: 200, $lte: 500 } }
//     4. If search → add { $text: { $search: 'honey' } }
//
//   Then:
//     5. Sort: "-price" → { price: -1 } (descending), "price" → { price: 1 }
//     6. Pagination: skip = (page - 1) * limit, limit = items per page
//
// WHY we return totalCount separately:
//   Frontend needs it to show "Page 2 of 15" and render pagination buttons.
//   We run countDocuments() with the SAME filter to get total matches.
//
// @param {Object} query — req.query from Express
// @returns {{ products: Array, totalCount: number, page: number, totalPages: number }}
// ---------------------------------------------------------------------------
export const getAllProducts = async (query) => {
  const {
    category,
    minPrice,
    maxPrice,
    search,
    tag,
    sort = '-createdAt', // default: newest first
    page = 1,
    limit = 12,
    isActive,
    isFeatured,
  } = query;

  // --- Build filter ---
  const filter = {};

  // Only admins see inactive products — public always sees active only
  if (isActive !== undefined) {
    filter.isActive = isActive === 'true';
  } else {
    filter.isActive = true;
  }

  if (category) filter.category = category;
  if (isFeatured === 'true') filter.isFeatured = true;
  if (tag) filter.tags = { $in: [tag.toLowerCase()] };

  // Price range filter
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  // Full-text search
  // MongoDB $text search looks across ALL fields in the text index
  // (name, description, tags — as defined in the Product model)
  if (search) {
    filter.$text = { $search: search };
  }

  // --- Build sort ---
  // Convert "-price" → { price: -1 }, "createdAt" → { createdAt: 1 }
  const sortObj = {};
  if (search) {
    // When searching, sort by text relevance score first
    sortObj.score = { $meta: 'textScore' };
  }
  if (sort) {
    const sortFields = sort.split(',');
    sortFields.forEach((field) => {
      if (field.startsWith('-')) {
        sortObj[field.slice(1)] = -1; // descending
      } else {
        sortObj[field] = 1;           // ascending
      }
    });
  }

  // --- Pagination ---
  const pageNum = Math.max(1, parseInt(page, 10));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10))); // cap at 50
  const skip = (pageNum - 1) * limitNum;

  // --- Execute query ---
  // We run find() and countDocuments() in parallel for performance
  // Promise.all means both queries go to MongoDB simultaneously
  const [products, totalCount] = await Promise.all([
    Product.find(filter)
      .select(search ? { score: { $meta: 'textScore' } } : {})
      .sort(sortObj)
      .skip(skip)
      .limit(limitNum)
      .populate('category', 'name slug'), // join category — only grab name + slug

    Product.countDocuments(filter),
  ]);

  return {
    products,
    totalCount,
    page: pageNum,
    totalPages: Math.ceil(totalCount / limitNum),
  };
};

// ---------------------------------------------------------------------------
// GET PRODUCT BY SLUG — for the public product detail page
// ---------------------------------------------------------------------------
// WHY by slug and not by _id:
//   SEO. "/products/organic-honey-500g" is readable by humans AND Google.
//   "/products/64a3f2b1c8e9d00012345678" tells Google nothing.
//   The slug IS the URL identifier for public routes.
// ---------------------------------------------------------------------------
export const getProductBySlug = async (slug) => {
  const product = await Product.findOne({ slug, isActive: true }).populate(
    'category',
    'name slug description templateSlug defaultTrustBadges image'
  );

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

// ---------------------------------------------------------------------------
// GET PRODUCT BY ID — for admin edit pages
// ---------------------------------------------------------------------------
export const getProductById = async (id) => {
  const product = await Product.findById(id).populate('category', 'name slug');

  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  return product;
};

// ---------------------------------------------------------------------------
// GET FEATURED PRODUCTS — for homepage carousel
// ---------------------------------------------------------------------------
export const getFeaturedProducts = async (maxCount = 8) => {
  const products = await Product.find({ isFeatured: true, isActive: true })
    .sort('-createdAt')
    .limit(maxCount)
    .populate('category', 'name slug');

  return products;
};

// ---------------------------------------------------------------------------
// CREATE PRODUCT — admin only
// ---------------------------------------------------------------------------
// HOW this works:
//   1. Admin sends a POST with form data (name, price, etc.) + image files
//   2. multer has already parsed the files into req.files (array of buffers)
//   3. We upload each buffer to Cloudinary → get back { url, publicId }
//   4. We create the Product document with those image URLs
//
// WHY Promise.all for uploads:
//   If admin uploads 5 images, we don't want to upload them one-by-one
//   (5 sequential network calls = slow). Promise.all uploads all 5
//   simultaneously → total time = slowest single upload, not sum of all.
// ---------------------------------------------------------------------------
export const createProduct = async (data, files = {}) => {
  const images = [];

  // Upload main image (Index 0)
  if (files.mainImage && files.mainImage[0]) {
    const result = await uploadToCloudinary(files.mainImage[0].buffer, 'rajdyaan/products');
    images.push({
      url: result.url,
      publicId: result.publicId,
      alt: data.name || '',
    });
  }

  // Upload hover image (Index 1)
  if (files.hoverImage && files.hoverImage[0]) {
    const result = await uploadToCloudinary(files.hoverImage[0].buffer, 'rajdyaan/products');
    images.push({
      url: result.url,
      publicId: result.publicId,
      alt: data.name ? `${data.name} hover` : '',
    });
  }

  // Upload extra images (Indices 2+)
  if (files.extraImages && files.extraImages.length > 0) {
    for (const file of files.extraImages) {
      const result = await uploadToCloudinary(file.buffer, 'rajdyaan/products');
      images.push({
        url: result.url,
        publicId: result.publicId,
        alt: data.name || '',
      });
    }
  }

  // --- Auto-generate SKU ---
  // Format: [First 2 of Name][First 1 of Category]-[4 random hex chars]
  // Example: 'Khand' + 'Jaggery' = KHJ-A1B2
  let sku = '';
  if (data.name && data.category) {
    const namePart = data.name.substring(0, 2).toUpperCase();
    const categoryDoc = await Category.findById(data.category);
    const catPart = categoryDoc ? categoryDoc.name.substring(0, 1).toUpperCase() : 'X';
    const randomPart = Math.random().toString(16).substring(2, 6).toUpperCase();
    sku = `${namePart}${catPart}-${randomPart}`;
  }

  const product = await Product.create({
    ...data,
    sku: data.sku || sku, // allow manual SKU if provided
    images,
  });

  // Return with category populated
  return Product.findById(product._id).populate('category', 'name slug');
};

// ---------------------------------------------------------------------------
// UPDATE PRODUCT — admin only
// ---------------------------------------------------------------------------
// HOW image updates work:
//   Two scenarios:
//   1. Admin sends new image files → upload to Cloudinary, ADD to existing images
//   2. Admin sends `removeImages` array of publicIds → delete from Cloudinary + DB
//
//   This allows partial updates — admin can add 2 new images AND remove 1 old
//   image in a single request.
// ---------------------------------------------------------------------------
export const updateProduct = async (id, data, files = {}) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // --- Handle explicit removals from frontend ---
  if (data.removeImages && Array.isArray(data.removeImages)) {
    for (const publicId of data.removeImages) {
      await deleteFromCloudinary(publicId);
      // Remove from the product's images array
      product.images = product.images.filter((img) => img.publicId !== publicId);
    }
    delete data.removeImages;
  }

  // --- Handle new Main Image ---
  if (files.mainImage && files.mainImage[0]) {
    // If there's already a main image, delete it from Cloudinary to avoid orphans
    if (product.images[0]) {
      await deleteFromCloudinary(product.images[0].publicId);
    }
    
    const result = await uploadToCloudinary(files.mainImage[0].buffer, 'rajdyaan/products');
    const newImg = { url: result.url, publicId: result.publicId, alt: data.name || product.name || '' };
    
    if (product.images.length > 0) {
      product.images[0] = newImg;
    } else {
      product.images.push(newImg);
    }
  }

  // --- Handle new Hover Image ---
  if (files.hoverImage && files.hoverImage[0]) {
    // If there's already a hover image (index 1), delete it
    if (product.images[1]) {
      await deleteFromCloudinary(product.images[1].publicId);
    }

    const result = await uploadToCloudinary(files.hoverImage[0].buffer, 'rajdyaan/products');
    const newImg = { url: result.url, publicId: result.publicId, alt: (data.name || product.name || '') + ' hover' };

    if (product.images.length > 1) {
      product.images[1] = newImg;
    } else {
      // If there's a main image but no hover image, push to index 1
      product.images.push(newImg);
    }
  }

  // --- Handle new Extra Images ---
  if (files.extraImages && files.extraImages.length > 0) {
    for (const file of files.extraImages) {
      const result = await uploadToCloudinary(file.buffer, 'rajdyaan/products');
      product.images.push({
        url: result.url,
        publicId: result.publicId,
        alt: data.name || product.name || '',
      });
    }
  }

  // --- Update other fields ---
  // Only update fields that were actually sent in the request
  const allowedFields = [
    'name', 'description', 'shortDescription', 'price', 'comparePrice',
    'category', 'tags', 'stock', 'isActive', 'isFeatured', 'weight', 'sku',
    'benefits', 'ingredients', 'storageConditions',
    // Structured content fields (Phase 1)
    'storySections', 'benefitsList', 'faq', 'trustBadges',
    'ingredientsList', 'categoryMeta',
  ];

  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      product[field] = data[field];
    }
  });

  product.markModified('images');
  await product.save(); // triggers pre-save slug generation if name changed

  return Product.findById(product._id).populate('category', 'name slug');
};

// ---------------------------------------------------------------------------
// DELETE PRODUCT — admin only
// ---------------------------------------------------------------------------
// IMPORTANT: We delete ALL images from Cloudinary BEFORE deleting the product.
// If we delete the product first and Cloudinary fails, those images become
// orphaned — taking up space on Cloudinary with no way to find them.
// ---------------------------------------------------------------------------
export const deleteProduct = async (id) => {
  const product = await Product.findById(id);
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }

  // Delete all images from Cloudinary
  if (product.images.length > 0) {
    await Promise.all(
      product.images.map((img) => deleteFromCloudinary(img.publicId))
    );
  }

  await Product.findByIdAndDelete(id);
};

// ---------------------------------------------------------------------------
// CATEGORY CRUD
// ---------------------------------------------------------------------------

export const createCategory = async (data, file) => {
  let image = { url: '', publicId: '' };

  if (file) {
    const result = await uploadToCloudinary(file.buffer, 'rajdyaan/categories');
    image = { url: result.url, publicId: result.publicId };
  }

  const category = await Category.create({
    ...data,
    image,
  });

  return category;
};

export const updateCategory = async (id, data, file) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  // Handle image removal requested from frontend
  if (data.removeImage === 'true' && category.image?.publicId) {
    await deleteFromCloudinary(category.image.publicId);
    category.image = { url: '', publicId: '' };
  }

  // Handle new image upload
  if (file) {
    if (category.image?.publicId) {
      await deleteFromCloudinary(category.image.publicId);
    }
    const result = await uploadToCloudinary(file.buffer, 'rajdyaan/categories');
    category.image = { url: result.url, publicId: result.publicId };
  }

  // Update other fields
  const allowedFields = ['name', 'description', 'parentCategory', 'isActive', 'templateSlug', 'defaultTrustBadges'];
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      // Parse defaultTrustBadges if it comes as JSON string
      if (field === 'defaultTrustBadges' && typeof data[field] === 'string') {
        try {
          category[field] = JSON.parse(data[field]);
        } catch {
           // ignore invalid
        }
      } else {
        category[field] = data[field];
      }
    }
  });

  await category.save();
  return category;
};

export const deleteCategory = async (id) => {
  const category = await Category.findById(id);
  if (!category) {
    throw new ApiError(404, 'Category not found');
  }

  if (category.image?.publicId) {
    await deleteFromCloudinary(category.image.publicId);
  }

  await Category.findByIdAndDelete(id);
};
