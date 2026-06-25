import Banner from '../../models/Banner.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import ApiError from '../../utils/ApiError.js';

/**
 * Fetch banners based on filters
 * @param {Object} query - Express req.query filters
 * @returns {Promise<Array>} List of banners
 */
export const fetchBanners = async (query = {}) => {
  const filter = {};

  // Public users only see active banners
  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === 'true';
  }

  if (query.section) {
    filter.section = query.section.toLowerCase();
  }

  return await Banner.find(filter).sort({ section: 1, key: 1 }).lean();
};

/**
 * Create or update a banner slot by key
 * @param {string} key - Unique key of the banner
 * @param {Object} data - Update payload
 * @param {Object} file - Uploaded file from multer
 * @returns {Promise<Object>} The upserted banner document
 */
export const upsertBanner = async (key, data, file) => {
  if (!key) {
    throw new ApiError(400, 'Banner key is required');
  }

  const lowercaseKey = key.trim().toLowerCase();
  let banner = await Banner.findOne({ key: lowercaseKey });

  // Handle image removal requested from frontend
  let imageUpdate = null;
  if (data.removeImage === 'true') {
    if (banner?.image?.publicId) {
      await deleteFromCloudinary(banner.image.publicId);
    }
    imageUpdate = { url: '', publicId: '' };
  }

  // Handle new image file upload
  if (file) {
    if (banner?.image?.publicId) {
      await deleteFromCloudinary(banner.image.publicId);
    }
    // Upload image to Cloudinary under folder 'rajdyaan/banners'
    const uploadResult = await uploadToCloudinary(file.buffer, 'rajdyaan/banners');
    imageUpdate = { url: uploadResult.url, publicId: uploadResult.publicId };
  }

  const updateFields = {
    label: data.label?.trim() || banner?.label || `Banner ${lowercaseKey}`,
    altText: data.altText !== undefined ? data.altText.trim() : (banner?.altText || ''),
    link: data.link !== undefined ? data.link.trim() : (banner?.link || ''),
    section: data.section?.trim().toLowerCase() || banner?.section || 'general',
  };

  if (data.isActive !== undefined) {
    updateFields.isActive = String(data.isActive) === 'true';
  }

  if (imageUpdate) {
    updateFields.image = imageUpdate;
  }

  // Upsert banner
  banner = await Banner.findOneAndUpdate(
    { key: lowercaseKey },
    { $set: updateFields },
    { new: true, upsert: true, runValidators: true }
  );

  return banner;
};

/**
 * Delete a banner slot, deleting its Cloudinary image if present
 * @param {string} key - Unique key of the banner
 * @returns {Promise<void>}
 */
export const deleteBanner = async (key) => {
  const lowercaseKey = key.trim().toLowerCase();
  const banner = await Banner.findOne({ key: lowercaseKey });

  if (!banner) {
    throw new ApiError(404, 'Banner slot not found');
  }

  if (banner.image?.publicId) {
    await deleteFromCloudinary(banner.image.publicId);
  }

  await Banner.findOneAndDelete({ key: lowercaseKey });
};
