// ---------------------------------------------------------------------------
// Auth middleware — extracts JWT from HttpOnly cookie, verifies, attaches req.user
// ---------------------------------------------------------------------------
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError.js';

/**
 * Protects routes by verifying the JWT stored in `req.cookies.token`.
 * On success, attaches `req.user = { id, role }` for downstream handlers.
 * On failure, throws a 401 ApiError.
 */
const protect = (req, _res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    throw new ApiError(401, 'Not authenticated — please log in');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    req.token = token; // Store token on request for potential frontend synchronization
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Session expired — please log in again');
    }
    throw new ApiError(401, 'Invalid token — please log in');
  }
};

export default protect;
