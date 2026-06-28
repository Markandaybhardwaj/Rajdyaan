// ---------------------------------------------------------------------------
// Auth Controller — route handlers for registration, login, logout,
// forgot-password (3-step), current user, and Google OAuth
// ---------------------------------------------------------------------------
import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import ApiError from '../../utils/ApiError.js';
import User from '../../models/User.js';
import {
  registerUser,
  loginUser,
  generateJWT,
  getCookieOptions,
  getResetCookieOptions,
  sendForgotPasswordOTP,
  verifyOTPAndGenerateResetToken,
  resetPasswordWithToken,
  getGoogleAuthURL,
  getGoogleUserProfile,
  findOrCreateGoogleUser,
} from './service.js';

// ---------------------------------------------------------------------------
// POST /api/v1/auth/register
// Body: { name, email, password }
// Sets HttpOnly JWT cookie, returns sanitised user
// ---------------------------------------------------------------------------
export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const user = await registerUser(name, email, password);
  const token = generateJWT(user._id, user.role);

  res
    .status(201)
    .cookie('token', token, getCookieOptions())
    .json(new ApiResponse(201, { user }, 'Registration successful'));
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/login
// Body: { email, password }
// Sets HttpOnly JWT cookie, returns sanitised user
// ---------------------------------------------------------------------------
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const { user, token } = await loginUser(email, password);

  res
    .status(200)
    .cookie('token', token, getCookieOptions())
    .json(new ApiResponse(200, { user }, 'Login successful'));
});

// ---------------------------------------------------------------------------
// POST /api/v1/auth/logout
// Clears the JWT cookie
// ---------------------------------------------------------------------------
export const logout = asyncHandler(async (_req, res) => {
  const isProd = process.env.NODE_ENV === 'production';
  res
    .status(200)
    .cookie('token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 0, // expire immediately
    })
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});

// ---------------------------------------------------------------------------
// GET /api/v1/auth/me
// Protected — returns the currently authenticated user
// ---------------------------------------------------------------------------
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(new ApiResponse(200, { user }, 'User profile'));
});

// ---------------------------------------------------------------------------
// STEP 1 — POST /api/v1/auth/forgot-password
// Body: { email }
// Generates OTP, hashes with bcrypt, stores in MongoDB, sends branded email
// Never exposes OTP in response
// ---------------------------------------------------------------------------
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  await sendForgotPasswordOTP(email);

  // Always return success — don't reveal if email exists (enumeration defence)
  res
    .status(200)
    .json(new ApiResponse(200, null, 'If this email is registered, an OTP has been sent'));
});

// ---------------------------------------------------------------------------
// STEP 2 — POST /api/v1/auth/verify-otp
// Body: { email, otp }
// Verifies OTP via bcrypt.compare, returns short-lived reset JWT
// ---------------------------------------------------------------------------
export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const resetToken = await verifyOTPAndGenerateResetToken(email, otp);

  // Send reset token as HttpOnly cookie AND in body (frontend can choose)
  res
    .status(200)
    .cookie('resetToken', resetToken, getResetCookieOptions())
    .json(new ApiResponse(200, { resetToken }, 'OTP verified — you may now reset your password'));
});

// ---------------------------------------------------------------------------
// STEP 3 — POST /api/v1/auth/reset-password
// Body: { newPassword, confirmPassword }
// Reset token read from cookie or Authorization header (via middleware)
// ---------------------------------------------------------------------------
export const resetPassword = asyncHandler(async (req, res) => {
  const { newPassword, confirmPassword } = req.body;

  // Validate passwords match
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, 'Passwords do not match');
  }

  // Validate minimum length
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  // req.resetUser is set by verifyResetToken middleware
  const { userId } = req.resetUser;

  await resetPasswordWithToken(userId, newPassword);

  // Clear the resetToken cookie and any existing session cookie
  const isProd = process.env.NODE_ENV === 'production';
  res
    .status(200)
    .cookie('resetToken', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 0,
    })
    .cookie('token', '', {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 0,
    })
    .json(new ApiResponse(200, null, 'Password reset successful — please log in with your new password'));
});

// ---------------------------------------------------------------------------
// GET /api/v1/auth/google
// Redirects user to Google OAuth consent screen
// ---------------------------------------------------------------------------
export const googleAuth = asyncHandler(async (_req, res) => {
  const url = await getGoogleAuthURL();
  res.redirect(url);
});

// ---------------------------------------------------------------------------
// GET /api/v1/auth/google/callback
// Exchanges authorization code for user profile, sets JWT cookie,
// redirects to frontend
// ---------------------------------------------------------------------------
export const googleCallback = asyncHandler(async (req, res) => {
  const { code } = req.query;

  if (!code) {
    throw new ApiError(400, 'Authorization code missing');
  }

  const profile = await getGoogleUserProfile(code);
  const { user, token } = await findOrCreateGoogleUser(profile);

  res
    .cookie('token', token, getCookieOptions())
    .redirect(process.env.FRONTEND_URL || 'http://localhost:3000');
});
