// ---------------------------------------------------------------------------
// Middleware: verifyResetToken — validates JWT reset tokens for password reset
// ---------------------------------------------------------------------------
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

/**
 * Extracts and verifies a password-reset JWT.
 *
 * Token is read from (in priority order):
 *   1. HttpOnly cookie `resetToken`
 *   2. Authorization header `Bearer <token>`
 *
 * On success, attaches `req.resetUser = { userId }` for downstream handlers.
 * On failure, throws a 401 ApiError.
 */
const verifyResetToken = (req, _res, next) => {
  // 1. Try cookie first
  let token = req.cookies?.resetToken;

  // 2. Fallback to Authorization header
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    throw new ApiError(401, 'Reset token missing — please verify your OTP first');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Ensure this is a password-reset token, not a regular auth token
    if (decoded.purpose !== 'password-reset') {
      throw new ApiError(401, 'Invalid token type — this is not a password-reset token');
    }

    req.resetUser = { userId: decoded.userId };
    next();
  } catch (err) {
    if (err instanceof ApiError) throw err;

    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Reset token expired — please request a new OTP');
    }
    throw new ApiError(401, 'Invalid reset token — please request a new OTP');
  }
};

export default verifyResetToken;
