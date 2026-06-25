// ---------------------------------------------------------------------------
// Product Routes — /api/v1/products/*
// ---------------------------------------------------------------------------
// HOW Express routing works (the middleware chain):
//
//   Each route is a PIPELINE of functions that run left-to-right:
//
//   router.post('/', protect, adminOnly, upload.array('images', 10), addProduct)
//                    ↑         ↑           ↑                          ↑
//                    1st       2nd         3rd                        4th
//
//   1. protect   → checks JWT cookie, sets req.user = { id, role }
//   2. adminOnly → checks req.user.role === 'admin', blocks if not
//   3. upload    → multer parses multipart form data, populates req.files
//   4. addProduct → our controller function (finally runs)
//
//   If ANY middleware calls next() → the next one runs.
//   If ANY middleware throws → Express skips to the error handler.
//   This is called the "middleware chain" pattern.
//
// ROUTE ORDER MATTERS:
//   /featured MUST come before /:slug, otherwise Express treats
//   "featured" as a slug value and calls getProduct("featured").
//
// Endpoints:
//   GET    /                  — list all products (public, paginated)
//   GET    /featured          — get featured products (public, max 8)
//   GET    /:slug             — get single product by slug (public)
//   POST   /                  — create product (admin + images)
//   PUT    /:id               — update product (admin)
//   DELETE /:id               — delete product (admin)
// ---------------------------------------------------------------------------
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import protect from '../../middleware/auth.js';
import adminOnly from '../../middleware/admin.js';
import validate from '../../middleware/validate.js';
import upload from '../../middleware/upload.js';
import {
  getProducts,
  getProductsFeatured,
  getProduct,
  addProduct,
  editProduct,
  removeProduct,
  getCategories,
  addCategory,
  editCategory,
  removeCategory,
} from './controller.js';

const router = Router();

// ---------------------------------------------------------------------------
// PUBLIC Routes — no auth needed
// ---------------------------------------------------------------------------

// GET /api/v1/products/categories (Must be before /:slug)
router.get('/categories', getCategories);

// POST /api/v1/products/categories
router.post(
  '/categories',
  protect,
  adminOnly,
  upload.single('image'),
  [
    body('name').trim().notEmpty().withMessage('Category name is required')
  ],
  validate,
  addCategory
);

// PUT /api/v1/products/categories/:id
router.put(
  '/categories/:id',
  protect,
  adminOnly,
  upload.single('image'),
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  editCategory
);

// DELETE /api/v1/products/categories/:id
router.delete(
  '/categories/:id',
  protect,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid category ID'),
  validate,
  removeCategory
);

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

// For creating a product — name, description, price, category are required
const createProductRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 120 })
    .withMessage('Product name cannot exceed 120 characters'),

  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 5000 })
    .withMessage('Description cannot exceed 5000 characters'),

  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .customSanitizer(v => Number(v))
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('stock')
    .optional()
    .customSanitizer(v => Number(v))
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('comparePrice')
    .optional()
    .customSanitizer(v => v ? Number(v) : undefined)
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
];

// For updating — same fields but all optional
const updateProductRules = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 120 })
    .withMessage('Product name must be 1-120 characters'),

  body('price')
    .optional()
    .customSanitizer(v => Number(v))
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),

  body('category')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),

  body('stock')
    .optional()
    .customSanitizer(v => Number(v))
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),

  body('comparePrice')
    .optional()
    .customSanitizer(v => v ? Number(v) : undefined)
    .isFloat({ min: 0 })
    .withMessage('Compare price must be a positive number'),
];

// Validate that :id param is a valid MongoDB ObjectId
const mongoIdParam = [
  param('id')
    .isMongoId()
    .withMessage('Invalid product ID'),
];

// ---------------------------------------------------------------------------
// PUBLIC Routes — no auth needed
// ---------------------------------------------------------------------------

// GET /api/v1/products
// Supports: ?category=id&minPrice=100&maxPrice=500&search=honey&sort=-price&page=2&limit=12
router.get('/', getProducts);

// GET /api/v1/products/featured  ← MUST be before /:slug!
router.get('/featured', getProductsFeatured);

// GET /api/v1/products/organic-honey-500g
router.get('/:slug', getProduct);

// ---------------------------------------------------------------------------
// ADMIN Routes — require JWT + admin role
// ---------------------------------------------------------------------------
// WHY upload.array('images', 10):
//   'images' = the field name in the form data (frontend must match this)
//   10 = max number of files. If someone sends 11, multer rejects with error.
//   The files are available as req.files (array of buffer objects).
// ---------------------------------------------------------------------------

// POST /api/v1/products — create new product with images
router.post(
  '/',
  protect,
  adminOnly,
  upload.fields([
    { name: 'mainImage', maxCount: 1 }, 
    { name: 'hoverImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 8 }
  ]),
  createProductRules,
  validate,
  addProduct
);

// PUT /api/v1/products/:id — update existing product
router.put(
  '/:id',
  protect,
  adminOnly,
  upload.fields([
    { name: 'mainImage', maxCount: 1 }, 
    { name: 'hoverImage', maxCount: 1 },
    { name: 'extraImages', maxCount: 8 }
  ]),
  mongoIdParam,
  updateProductRules,
  validate,
  editProduct
);

// DELETE /api/v1/products/:id — delete product + Cloudinary images
router.delete(
  '/:id',
  protect,
  adminOnly,
  mongoIdParam,
  validate,
  removeProduct
);

export default router;
