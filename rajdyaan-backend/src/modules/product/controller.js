// ---------------------------------------------------------------------------
// Product Controller — HTTP handlers
// ---------------------------------------------------------------------------
// WHERE this sits:
//   Request → routes.js → CONTROLLER.js ← You are here → service.js → Model
//
// WHAT controllers do:
//   1. Extract data from the request (req.body, req.params, req.query, req.files)
//   2. Call the service function with that data
//   3. Send the response back to the client
//
// WHAT controllers DON'T do:
//   - Database queries (that's the service's job)
//   - Business logic (that's the service's job)
//   - Validation (that's express-validator's job, in routes.js)
//
// WHY asyncHandler:
//   Every async function can throw. Without asyncHandler, you'd need
//   try/catch in EVERY handler. asyncHandler wraps each handler and
//   automatically catches errors → passes them to Express's error handler.
//   It's the same pattern as Next.js error boundaries, but for Express.
// ---------------------------------------------------------------------------
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import Category from '../../models/Category.js';
import {
  getAllProducts,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  createCategory,
  updateCategory,
  deleteCategory,
} from './service.js';

// ---------------------------------------------------------------------------
// Helper: safely parse JSON fields from multipart form data
// ---------------------------------------------------------------------------
// WHY this is needed:
//   multipart/form-data sends EVERYTHING as strings. When the frontend sends
//   storySections: [{title: "...", description: "..."}], it arrives as a
//   JSON string. We must parse it back into an array/object.
// ---------------------------------------------------------------------------
const parseJsonField = (data, field) => {
  if (typeof data[field] === 'string' && data[field].trim()) {
    try {
      data[field] = JSON.parse(data[field]);
    } catch {
      data[field] = undefined; // drop invalid JSON silently
    }
  }
};

// ---------------------------------------------------------------------------
// GET /api/v1/products
// Public — returns paginated product list with filters
// ---------------------------------------------------------------------------
// HOW query params work:
//   The frontend constructs a URL like:
//     /api/v1/products?category=64abc&minPrice=100&maxPrice=500&sort=-price&page=2
//
//   Express parses this into req.query:
//     { category: '64abc', minPrice: '100', maxPrice: '500', sort: '-price', page: '2' }
//
//   We pass the entire req.query to the service — it handles filtering.
// ---------------------------------------------------------------------------
export const getProducts = asyncHandler(async (req, res) => {
  const result = await getAllProducts(req.query);

  res.status(200).json(
    new ApiResponse(200, result, 'Products fetched successfully')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/products/featured
// Public — returns featured products for homepage
// ---------------------------------------------------------------------------
// WHY this route is ABOVE /:slug:
//   Express matches routes top-to-bottom. If /:slug was first,
//   GET /products/featured would match with slug = "featured".
//   By placing /featured ABOVE /:slug, it matches first.
//   This is a VERY common Express gotcha — route order matters!
// ---------------------------------------------------------------------------
export const getProductsFeatured = asyncHandler(async (req, res) => {
  const products = await getFeaturedProducts(8);

  res.status(200).json(
    new ApiResponse(200, { products }, 'Featured products fetched')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/products/:slug
// Public — returns a single product by its URL slug
// ---------------------------------------------------------------------------
export const getProduct = asyncHandler(async (req, res) => {
  const product = await getProductBySlug(req.params.slug);

  res.status(200).json(
    new ApiResponse(200, { product }, 'Product fetched successfully')
  );
});

// ---------------------------------------------------------------------------
// POST /api/v1/products
// Admin only — creates a new product with Cloudinary images
// ---------------------------------------------------------------------------
// HOW the request body arrives:
//   Because we're uploading files, the frontend sends multipart/form-data
//   (not JSON). multer middleware has already parsed it into:
//   - req.body → { name, description, price, ... } (text fields)
//   - req.files → [ { buffer, mimetype, ... }, ... ] (image files)
//
// WHY we parse tags manually:
//   multipart/form-data sends everything as strings.
//   tags might arrive as "organic,raw,natural" (comma-separated string)
//   or as a JSON array string. We handle both cases.
// ---------------------------------------------------------------------------
export const addProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Parse tags if sent as comma-separated string
  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(',').map((t) => t.trim().toLowerCase());
  }

  // Parse boolean fields (multipart sends "true"/"false" as strings)
  if (data.isActive !== undefined) data.isActive = data.isActive === 'true';
  if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true';

  // Parse numeric fields
  if (data.price) data.price = Number(data.price);
  if (data.comparePrice) data.comparePrice = Number(data.comparePrice);
  if (data.stock) data.stock = Number(data.stock);
  if (data.weight) data.weight = Number(data.weight);

  // Parse structured content fields (arrive as JSON strings from multipart)
  parseJsonField(data, 'storySections');
  parseJsonField(data, 'benefitsList');
  parseJsonField(data, 'faq');
  parseJsonField(data, 'trustBadges');
  parseJsonField(data, 'ingredientsList');
  parseJsonField(data, 'categoryMeta');

  const product = await createProduct(data, req.files || {});

  res.status(201).json(
    new ApiResponse(201, { product }, 'Product created successfully')
  );
});

// ---------------------------------------------------------------------------
// PUT /api/v1/products/:id
// Admin only — updates an existing product
// ---------------------------------------------------------------------------
// WHY PUT and not PATCH:
//   In practice, this handles partial updates too (only sent fields get updated).
//   PUT is used because the frontend sends the "full intended state".
//   Technically PATCH would be more correct, but PUT is the industry convention
//   for admin product updates in most e-commerce APIs.
// ---------------------------------------------------------------------------
export const editProduct = asyncHandler(async (req, res) => {
  const data = { ...req.body };

  // Same parsing as addProduct — multipart sends strings
  if (typeof data.tags === 'string') {
    data.tags = data.tags.split(',').map((t) => t.trim().toLowerCase());
  }
  if (data.isActive !== undefined) data.isActive = data.isActive === 'true';
  if (data.isFeatured !== undefined) data.isFeatured = data.isFeatured === 'true';
  if (data.price) data.price = Number(data.price);
  if (data.comparePrice) data.comparePrice = Number(data.comparePrice);
  if (data.stock) data.stock = Number(data.stock);
  if (data.weight) data.weight = Number(data.weight);

  // Parse structured content fields
  parseJsonField(data, 'storySections');
  parseJsonField(data, 'benefitsList');
  parseJsonField(data, 'faq');
  parseJsonField(data, 'trustBadges');
  parseJsonField(data, 'ingredientsList');
  parseJsonField(data, 'categoryMeta');

  // Parse removeImages if sent as JSON string
  if (typeof data.removeImages === 'string') {
    try {
      data.removeImages = JSON.parse(data.removeImages);
    } catch {
      data.removeImages = [];
    }
  }

  const product = await updateProduct(req.params.id, data, req.files || {});

  res.status(200).json(
    new ApiResponse(200, { product }, 'Product updated successfully')
  );
});

export const removeProduct = asyncHandler(async (req, res) => {
  await deleteProduct(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Product deleted successfully')
  );
});

// ---------------------------------------------------------------------------
// GET /api/v1/products/categories
// Public — returns all categories for navigation/forms
// ---------------------------------------------------------------------------
export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({}).sort({ name: 1 });
  res.status(200).json(
    new ApiResponse(200, { categories }, 'Categories fetched successfully')
  );
});

export const addCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.isActive !== undefined) data.isActive = data.isActive === 'true';

  const category = await createCategory(data, req.file);

  res.status(201).json(
    new ApiResponse(201, { category }, 'Category created successfully')
  );
});

export const editCategory = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.isActive !== undefined) data.isActive = data.isActive === 'true';

  const category = await updateCategory(req.params.id, data, req.file);

  res.status(200).json(
    new ApiResponse(200, { category }, 'Category updated successfully')
  );
});

export const removeCategory = asyncHandler(async (req, res) => {
  await deleteCategory(req.params.id);

  res.status(200).json(
    new ApiResponse(200, null, 'Category deleted successfully')
  );
});
