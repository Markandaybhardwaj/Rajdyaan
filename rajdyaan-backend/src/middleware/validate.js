// ---------------------------------------------------------------------------
// Validation middleware — runs express-validator checks and returns 400 on failure
// ---------------------------------------------------------------------------
import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Express middleware that collects validation errors from express-validator
 * and throws a structured 400 ApiError if any exist.
 *
 * Usage: router.post('/register', [...rules], validate, controller);
 */
const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();

  const extractedErrors = errors.array().map((err) => ({
    field: err.path,
    message: err.msg,
  }));

  throw new ApiError(400, 'Validation failed', extractedErrors);
};

export default validate;
