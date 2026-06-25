// ---------------------------------------------------------------------------
// Wishlist Routes — /api/v1/wishlist/*
//
// Endpoints:
//   GET    /                — get user's wishlist
//   POST   /add             — add product to wishlist
//   DELETE /remove           — remove product from wishlist
//   POST   /sync            — sync localStorage wishlist after login
// ---------------------------------------------------------------------------
import { Router } from 'express';
import protect from '../../middleware/auth.js';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  syncWishlist,
} from './controller.js';

const router = Router();

// All wishlist routes require authentication
router.use(protect);

router.get('/', getWishlist);
router.post('/add', addToWishlist);
router.delete('/remove', removeFromWishlist);
router.post('/sync', syncWishlist);

export default router;
