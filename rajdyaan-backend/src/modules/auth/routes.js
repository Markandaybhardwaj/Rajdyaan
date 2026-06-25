// ---------------------------------------------------------------------------
// Auth Routes — /api/v1/auth/*
//
// Endpoints:
//   POST   /register           — create account, set JWT cookie
//   POST   /login              — authenticate, set JWT cookie
//   POST   /logout             — clear JWT cookie
//   GET    /me                 — get current user (protected)
//   POST   /forgot-password    — STEP 1: send OTP to email
//   POST   /verify-otp         — STEP 2: verify OTP, get reset token
//   POST   /reset-password     — STEP 3: reset password with reset token
//   GET    /google             — redirect to Google OAuth consent
//   GET    /google/callback    — handle Google OAuth callback
// ---------------------------------------------------------------------------
import { Router } from 'express';
import { body } from 'express-validator';
import validate from '../../middleware/validate.js';
import protect from '../../middleware/auth.js';
import verifyResetToken from '../../middleware/verifyResetToken.js';
import { authLimiter, otpLimiter, forgotPasswordLimiter } from '../../middleware/rateLimiter.js';
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  verifyOTP,
  resetPassword,
  googleAuth,
  googleCallback,
} from './controller.js';

const router = Router();

// ---------------------------------------------------------------------------
// Validation rules
// ---------------------------------------------------------------------------

const registerRules = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),

  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one digit'),
];

const loginRules = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

const forgotPasswordRules = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),
];

const verifyOTPRules = [
  body('email')
    .trim()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email address'),

  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('OTP must be a 6-digit number'),
];

const resetPasswordRules = [
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/)
    .withMessage('Password must contain at least one uppercase letter')
    .matches(/[0-9]/)
    .withMessage('Password must contain at least one digit'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Please confirm your new password'),
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

router.post('/register', authLimiter, registerRules, validate, register);
router.post('/login', authLimiter, loginRules, validate, login);
router.post('/logout', logout);
router.get('/me', protect, getMe);

// Forgot Password — 3-step flow
router.post('/forgot-password', forgotPasswordLimiter, forgotPasswordRules, validate, forgotPassword);
router.post('/verify-otp', otpLimiter, verifyOTPRules, validate, verifyOTP);
router.post('/reset-password', otpLimiter, resetPasswordRules, validate, verifyResetToken, resetPassword);

// Google OAuth
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);

export default router;
