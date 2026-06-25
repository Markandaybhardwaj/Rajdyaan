import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { fetchBanners, upsertBanner, deleteBanner } from './service.js';

/**
 * GET /api/v1/banners
 * Public - fetches banners. By default returns active ones only unless specified.
 */
export const getBanners = asyncHandler(async (req, res) => {
  const banners = await fetchBanners(req.query);

  res.status(200).json(
    new ApiResponse(200, { banners }, 'Banners fetched successfully')
  );
});

/**
 * PUT /api/v1/banners/:key
 * Admin - creates or updates a banner slot by key. Accepts image upload.
 */
export const updateBanner = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const banner = await upsertBanner(key, req.body, req.file);

  res.status(200).json(
    new ApiResponse(200, { banner }, 'Banner updated successfully')
  );
});

/**
 * DELETE /api/v1/banners/:key
 * Admin - deletes a banner slot by key, purging its image from Cloudinary.
 */
export const removeBanner = asyncHandler(async (req, res) => {
  const { key } = req.params;
  await deleteBanner(key);

  res.status(200).json(
    new ApiResponse(200, null, 'Banner deleted successfully')
  );
});
