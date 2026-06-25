// ---------------------------------------------------------------------------
// Rate limiter middleware — per-route configurable, Redis-backed in production
// ---------------------------------------------------------------------------
import rateLimit from 'express-rate-limit';

/**
 * Creates a rate-limit middleware instance.
 *
 * @param {Object} opts
 * @param {number} opts.windowMs  — time window in milliseconds (default: 15 min)
 * @param {number} opts.max       — max requests per windowMs (default: 100)
 * @param {string} opts.message   — error message on limit breach
 * @returns Express middleware
 */
export const createRateLimiter = ({
  windowMs = 15 * 60 * 1000,
  max = 100,
  message = 'Too many requests, please try again later',
} = {}) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message },
  });
};

// Pre-built limiters for auth routes
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,                  // 15 attempts per window
  message: 'Too many auth attempts — try again after 15 minutes',
});

export const otpLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                   // 5 OTP requests per window
  message: 'Too many OTP requests — try again after 10 minutes',
});

// Stricter limiter specifically for forgot-password (max 3 per 15min per IP)
export const forgotPasswordLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3,                   // 3 attempts per window
  message: 'Too many password reset requests — try again after 15 minutes',
});
