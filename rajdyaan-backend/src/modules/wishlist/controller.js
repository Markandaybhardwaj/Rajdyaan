// ---------------------------------------------------------------------------
// Wishlist Controller — handles add, remove, get
// ---------------------------------------------------------------------------
import Wishlist from '../../models/Wishlist.js';
import ApiError from '../../utils/ApiError.js';

/**
 * GET /api/v1/wishlist
 * Returns all wishlisted product IDs for the logged-in user.
 */
export const getWishlist = async (req, res, next) => {
  try {
    const items = await Wishlist.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: {
        items: items.map((i) => ({
          productId: i.productId,
          createdAt: i.createdAt,
        })),
        count: items.length,
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/wishlist/add
 * Body: { productId: string }
 * Adds a product to the wishlist. Silently ignores duplicates.
 */
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new ApiError(400, 'productId is required');
    }

    // Upsert to prevent duplicate errors
    await Wishlist.findOneAndUpdate(
      { userId: req.user.id, productId },
      { userId: req.user.id, productId },
      { upsert: true, new: true }
    );

    // Return updated count
    const count = await Wishlist.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Added to wishlist',
      data: { productId, count },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/v1/wishlist/remove
 * Body: { productId: string }
 * Removes a product from the wishlist.
 */
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    if (!productId) {
      throw new ApiError(400, 'productId is required');
    }

    await Wishlist.findOneAndDelete({ userId: req.user.id, productId });

    // Return updated count
    const count = await Wishlist.countDocuments({ userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Removed from wishlist',
      data: { productId, count },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/v1/wishlist/sync
 * Body: { productIds: string[] }
 * Syncs localStorage wishlist to server after login.
 */
export const syncWishlist = async (req, res, next) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds)) {
      throw new ApiError(400, 'productIds must be an array');
    }

    // Bulk upsert all items
    const operations = productIds.map((productId) => ({
      updateOne: {
        filter: { userId: req.user.id, productId },
        update: { userId: req.user.id, productId },
        upsert: true,
      },
    }));

    if (operations.length > 0) {
      await Wishlist.bulkWrite(operations);
    }

    // Return full updated list
    const items = await Wishlist.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      message: 'Wishlist synced',
      data: {
        items: items.map((i) => ({
          productId: i.productId,
          createdAt: i.createdAt,
        })),
        count: items.length,
      },
    });
  } catch (err) {
    next(err);
  }
};
