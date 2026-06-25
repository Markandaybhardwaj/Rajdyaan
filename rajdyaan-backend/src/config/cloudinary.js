// ---------------------------------------------------------------------------
// Cloudinary Configuration + Upload Utility
// ---------------------------------------------------------------------------
// WHY Cloudinary:
//   1. We NEVER store image files on our server. Our server has limited disk
//      space (40GB on Hetzner). 2000 products × 5 images × 2MB = 20GB gone.
//   2. Cloudinary gives us a CDN — images load from the nearest edge server
//      (Mumbai, Singapore, etc.) instead of our single VPS in Germany.
//   3. Auto WebP conversion — modern browsers get smaller WebP files,
//      older browsers get JPEG. We don't manage this — Cloudinary does it.
//   4. On-the-fly transformations — one URL gives us any size:
//      ?w=400 → thumbnail, ?w=800 → product page, ?w=1200 → zoom.
//
// WHERE this sits:
//   src/config/cloudinary.js ← You are here
//   The product service calls uploadToCloudinary() when creating a product.
//   The product service calls deleteFromCloudinary() when deleting images.
//
// HOW the upload flow works:
//   1. User uploads a file via POST /api/v1/products (multipart form data)
//   2. multer (middleware) intercepts the file and stores it IN MEMORY as a buffer
//      (we use memoryStorage — the file NEVER touches our disk)
//   3. We take that buffer and pipe it to Cloudinary via their SDK
//   4. Cloudinary returns a URL + publicId
//   5. We save { url, publicId } in the Product document in MongoDB
//   6. Frontend loads the image from Cloudinary's CDN — never from our server
// ---------------------------------------------------------------------------
import { v2 as cloudinary } from 'cloudinary';

// ---------------------------------------------------------------------------
// Configure Cloudinary with environment variables
// ---------------------------------------------------------------------------
// These 3 values come from your Cloudinary dashboard → Settings → API Keys.
// They're stored in .env and NEVER committed to git.
// ---------------------------------------------------------------------------
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ---------------------------------------------------------------------------
// Upload a file buffer to Cloudinary
// ---------------------------------------------------------------------------
// WHAT this does:
//   Takes a raw file buffer (from multer) and uploads it to Cloudinary.
//   Returns { url, publicId } — these get stored in our MongoDB document.
//
// WHY we use upload_stream (not upload):
//   cloudinary.uploader.upload() accepts a FILE PATH on disk.
//   But we're using multer's memoryStorage — the file is a BUFFER in RAM.
//   upload_stream() accepts a Node.js stream, which we create from the buffer.
//
// WHAT the options do:
//   folder: "rajdyaan/products" → organises images in Cloudinary dashboard
//   format: "webp" → auto-converts ANY uploaded format (JPEG, PNG) to WebP
//   quality: "auto:good" → Cloudinary picks optimal quality (smaller file, good looks)
//   transformation: width 1200, crop limit → caps max width, preserves aspect ratio
//
// @param {Buffer} buffer — raw file data from multer
// @param {string} folder — Cloudinary folder path (e.g., "rajdyaan/products")
// @returns {{ url: string, publicId: string }}
// ---------------------------------------------------------------------------
export const uploadToCloudinary = (buffer, folder = 'rajdyaan/products') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        format: 'webp',               // auto-convert to WebP for fast loading
        quality: 'auto:good',         // let Cloudinary optimise quality
        transformation: [
          { width: 1200, crop: 'limit' }, // cap max width at 1200px
        ],
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,      // HTTPS URL to the image on CDN
          publicId: result.public_id,  // unique ID needed for deletion
        });
      }
    );

    // Pipe the buffer into the upload stream
    // We write the entire buffer at once and signal "end" — that's what .end() does
    uploadStream.end(buffer);
  });
};

// ---------------------------------------------------------------------------
// Delete an image from Cloudinary
// ---------------------------------------------------------------------------
// WHY we need this:
//   When an admin replaces a product image or deletes a product,
//   we MUST delete the old image from Cloudinary.
//   Otherwise, old images pile up → eat into the free 25GB quota.
//
// @param {string} publicId — the Cloudinary public_id stored in our DB
// ---------------------------------------------------------------------------
export const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Log but don't crash — image deletion is not critical path
    console.error(`Failed to delete Cloudinary image ${publicId}:`, err.message);
  }
};

export default cloudinary;
