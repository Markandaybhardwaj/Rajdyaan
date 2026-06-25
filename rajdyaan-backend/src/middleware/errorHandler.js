// ---------------------------------------------------------------------------
// Error handler middleware — catches all errors passed via next(err) and
// returns a consistent JSON error response.
// ---------------------------------------------------------------------------
import ApiError from '../utils/ApiError.js';

const errorHandler = (err, _req, res, _next) => {
  // If it's already our ApiError, use it directly
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
  }

  // Mongoose validation error → 400
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: messages,
    });
  }

  // Mongoose duplicate key → 409
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} already exists`,
      errors: [],
    });
  }

  // JWT errors → 401
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
      errors: [],
    });
  }

  // Fallback: unexpected errors → 500, don't leak internals in production
  console.error('Unhandled error:', err);

  return res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'development'
        ? err.message
        : 'Internal Server Error',
    errors: [],
  });
};

export default errorHandler;
