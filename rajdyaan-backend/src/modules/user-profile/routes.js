// ---------------------------------------------------------------------------
// User Profile Routes — /api/v1/profile
// ---------------------------------------------------------------------------
import express from 'express';
import protect from '../../middleware/auth.js';
import {
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from './controller.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Profile
router.get('/',    getProfile);
router.put('/',    updateProfile);

// Addresses
router.post('/address',                       addAddress);
router.put('/address/:addressId',             updateAddress);
router.delete('/address/:addressId',          deleteAddress);
router.patch('/address/:addressId/default',   setDefaultAddress);

export default router;
