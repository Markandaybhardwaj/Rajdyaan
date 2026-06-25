import { Router } from 'express';
import protect from '../../middleware/auth.js';
import adminOnly from '../../middleware/admin.js';
import upload from '../../middleware/upload.js';
import { getBanners, updateBanner, removeBanner } from './controller.js';

const router = Router();

// GET /api/v1/banners (Public)
router.get('/', getBanners);

// PUT /api/v1/banners/:key (Admin, accepts single image file upload)
router.put('/:key', protect, adminOnly, upload.single('image'), updateBanner);

// DELETE /api/v1/banners/:key (Admin)
router.delete('/:key', protect, adminOnly, removeBanner);

export default router;
