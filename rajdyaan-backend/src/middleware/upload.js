// ---------------------------------------------------------------------------
// Multer Upload Middleware
// ---------------------------------------------------------------------------
// WHAT multer does:
//   Express can't handle multipart/form-data (file uploads) natively.
//   multer is middleware that:
//   1. Intercepts the incoming request
//   2. Parses the file(s) from the form data
//   3. Makes them available as req.file (single) or req.files (multiple)
//
// WHY memoryStorage:
//   Two storage options: diskStorage (saves to temp folder) vs memoryStorage.
//   We use memoryStorage because:
//   - Files stay as buffers in RAM — never written to disk
//   - We immediately pipe them to Cloudinary and discard
//   - No temp file cleanup needed
//   - Faster (no disk I/O)
//   Trade-off: large files eat RAM. That's why we cap at 5MB per file.
//
// WHERE this sits:
//   src/middleware/upload.js ← You are here
//   Used in product routes: router.post('/', upload.array('images', 10), createProduct)
//   multer runs BEFORE the controller — by the time createProduct() runs,
//   req.files is already populated with the uploaded images.
// ---------------------------------------------------------------------------
import multer from 'multer';
import ApiError from '../utils/ApiError.js';

// Store files in memory as Buffer objects
const storage = multer.memoryStorage();

// ---------------------------------------------------------------------------
// File filter — only accept image/* MIME types
// ---------------------------------------------------------------------------
// WHY filter:
//   Without this, someone could upload a .exe or .pdf as a "product image".
//   The filter checks the MIME type: image/jpeg, image/png, image/webp → ✅
//   application/pdf, text/html → ❌ rejected with 400 error.
// ---------------------------------------------------------------------------
const fileFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);  // accept the file
  } else {
    cb(new ApiError(400, 'Only image files are allowed (JPEG, PNG, WebP)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 10,                  // max 10 files per request
  },
});

export default upload;
