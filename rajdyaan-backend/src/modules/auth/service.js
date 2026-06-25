// ---------------------------------------------------------------------------
// Auth Service — business logic for register, login, JWT, OTP, Google OAuth
// ---------------------------------------------------------------------------
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../../models/User.js';
import OTPRecord from '../../models/OTPRecord.js';
import ApiError from '../../utils/ApiError.js';
import { sendPasswordResetOTP } from '../notification/email.js';

// ---------------------------------------------------------------------------
// JWT helpers
// ---------------------------------------------------------------------------

/**
 * Signs a JWT with userId and role.
 * @param {string} userId  — Mongo _id
 * @param {string} role    — 'user' | 'admin'
 * @returns {string} signed JWT
 */
export const generateJWT = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Signs a short-lived JWT specifically for password reset.
 * @param {string} userId — Mongo _id
 * @returns {string} signed JWT with purpose: 'password-reset'
 */
export const generateResetToken = (userId) => {
  return jwt.sign(
    { userId, purpose: 'password-reset' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

/**
 * Standard cookie options for HttpOnly JWT cookie.
 */
export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
});

/**
 * Cookie options for the short-lived reset token.
 */
export const getResetCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000, // 15 minutes
});

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

/**
 * Creates a new user with hashed password.
 * @returns sanitised user object (no passwordHash)
 */
export const registerUser = async (name, email, password) => {
  // Check for existing user first — gives a cleaner error than Mongo duplicate key
  const existing = await User.findOne({ email });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    passwordHash: password, // pre-save hook will hash it (bcrypt, saltRounds: 12)
  });

  // Return sanitised object (toJSON transform strips passwordHash)
  return user.toJSON();
};

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

/**
 * Validates credentials and returns the user + JWT token.
 * @returns {{ user: Object, token: string }}
 */
export const loginUser = async (email, password) => {
  // Explicitly select passwordHash since it has select: false
  const user = await User.findOne({ email }).select('+passwordHash');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Google-only accounts don't have a password
  if (!user.passwordHash) {
    throw new ApiError(401, 'This account uses Google sign-in — please use Google login');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = generateJWT(user._id, user.role);
  return { user: user.toJSON(), token };
};

// ---------------------------------------------------------------------------
// STEP 1 — Forgot Password: generate OTP, hash it, store in DB, send email
// ---------------------------------------------------------------------------

/**
 * Generates a 6-digit OTP, hashes it with bcrypt, saves to MongoDB OTPRecord,
 * invalidates any previous unused OTPs for the same user, and sends the
 * branded password-reset email.
 */
export const sendForgotPasswordOTP = async (email) => {
  // Look up the user
  const user = await User.findOne({ email });
  if (!user) {
    // Don't reveal whether the email exists — just return silently
    // This prevents email enumeration attacks
    return;
  }

  // Invalidate all previous unused OTPs for this user
  await OTPRecord.updateMany(
    { userId: user._id, used: false },
    { $set: { used: true } }
  );

  // Generate cryptographically random 6-digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();

  // Hash the OTP before storing (bcrypt, saltRounds: 10)
  const salt = await bcrypt.genSalt(10);
  const hashedOTP = await bcrypt.hash(otp, salt);

  // Save hashed OTP to MongoDB with 10-minute expiry
  await OTPRecord.create({
    userId: user._id,
    hashedOTP,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
    used: false,
  });

  // Send OTP via branded email
  try {
    await sendPasswordResetOTP(email, otp, user.name);
  } catch (err) {
    console.error('Email send error:', err.message);
    throw new ApiError(503, 'Failed to send OTP email — please try again');
  }
};

// ---------------------------------------------------------------------------
// STEP 2 — Verify OTP: validate OTP, return short-lived reset JWT
// ---------------------------------------------------------------------------

/**
 * Finds the latest unused, non-expired OTP for the given user email,
 * verifies it via bcrypt.compare, marks it as used, and returns a
 * short-lived JWT reset token (15 min expiry).
 *
 * @returns {string} resetToken — JWT with { userId, purpose: 'password-reset' }
 */
export const verifyOTPAndGenerateResetToken = async (email, otp) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, 'Invalid email or OTP');
  }

  // Find the latest unused OTP record for this user
  const otpRecord = await OTPRecord.findOne({
    userId: user._id,
    used: false,
    expiresAt: { $gt: new Date() }, // not expired
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new ApiError(400, 'OTP has expired or was already used — please request a new one');
  }

  // Compare plain-text OTP with the stored bcrypt hash
  const isMatch = await bcrypt.compare(otp, otpRecord.hashedOTP);
  if (!isMatch) {
    throw new ApiError(400, 'Invalid OTP — please check and try again');
  }

  // Mark this OTP as used so it cannot be reused
  otpRecord.used = true;
  await otpRecord.save();

  // Generate a short-lived reset token (15 min)
  const resetToken = generateResetToken(user._id);

  return resetToken;
};

// ---------------------------------------------------------------------------
// STEP 3 — Reset Password: verify reset token, update password
// ---------------------------------------------------------------------------

/**
 * Resets the user's password. The reset token has already been verified
 * by the verifyResetToken middleware, which attaches req.resetUser.userId.
 *
 * @param {string} userId       — from the verified reset token
 * @param {string} newPassword  — plain-text, will be hashed by pre-save hook
 */
export const resetPasswordWithToken = async (userId, newPassword) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Set new password — pre-save hook will hash it (bcrypt, saltRounds: 12)
  user.passwordHash = newPassword;
  await user.save();

  // Invalidate any remaining unused OTPs for this user (cleanup)
  await OTPRecord.updateMany(
    { userId: user._id, used: false },
    { $set: { used: true } }
  );
};

// ---------------------------------------------------------------------------
// Google OAuth helpers
// ---------------------------------------------------------------------------

/**
 * Finds or creates a user from Google profile data.
 * @returns {{ user: Object, token: string }}
 */
export const findOrCreateGoogleUser = async ({ googleId, email, name }) => {
  // Check if user already exists by googleId or email
  let user = await User.findOne({
    $or: [{ googleId }, { email }],
  });

  if (user) {
    // Link Google account if user registered via email first
    if (!user.googleId) {
      user.googleId = googleId;
      user.isEmailVerified = true;
      await user.save();
    }
  } else {
    // Create new user — no password needed for Google OAuth
    user = await User.create({
      name,
      email,
      googleId,
      isEmailVerified: true,
    });
  }

  const token = generateJWT(user._id, user.role);
  return { user: user.toJSON(), token };
};

/**
 * Returns the Google OAuth 2.0 consent URL.
 */
export const getGoogleAuthURL = async () => {
  const { google } = await import('googleapis');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const scopes = ['openid', 'profile', 'email'];

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
};

/**
 * Exchanges the authorization code for user profile info.
 * @returns {{ googleId, email, name }}
 */
export const getGoogleUserProfile = async (code) => {
  const { google } = await import('googleapis');

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
  const { data } = await oauth2.userinfo.get();

  return {
    googleId: data.id,
    email: data.email,
    name: data.name,
  };
};
