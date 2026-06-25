// ---------------------------------------------------------------------------
// B2B Routes — /api/v1/b2b/*
//
// Endpoints:
//   POST   /enquiry              — public: submit B2B enquiry
//   GET    /leads                — admin: list all leads
//   PATCH  /leads/:id/status     — admin: update lead status
// ---------------------------------------------------------------------------
import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middleware/validate.js';
import protect from '../../middleware/auth.js';
import requireAdmin from '../../middleware/admin.js';
import {
  submitEnquiry,
  getLeads,
  updateLeadStatus,
} from './controller.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation rules for enquiry
// ---------------------------------------------------------------------------
const enquiryRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ max: 100 })
    .withMessage('Name too long'),

  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required'),

  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),

  body('product')
    .trim()
    .notEmpty()
    .withMessage('Product selection is required'),

  body('quantity')
    .trim()
    .notEmpty()
    .withMessage('Quantity is required'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// Public
router.post('/enquiry', enquiryRules, validate, submitEnquiry);

// Admin-only
router.get('/leads', protect, requireAdmin, getLeads);
router.patch('/leads/:id/status', protect, requireAdmin, updateLeadStatus);

export default router;
