// ---------------------------------------------------------------------------
// Admin-only middleware — must be used AFTER the protect middleware
// ---------------------------------------------------------------------------
import ApiError from '../utils/ApiError.js';

/**
 * Restricts access to admin users only.
 * Must be placed after `protect` middleware so req.user is available.
 */
const adminOnly = (req, _res, next) => {
  if (req.user?.role !== 'admin') {
    throw new ApiError(403, 'Access denied — admin privileges required');
  }
  next();
};

export default adminOnly;
