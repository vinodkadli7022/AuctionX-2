import { ApiError } from '../utils/ApiError.js';

/**
 * Global error handler — MUST be the last middleware registered.
 * Differentiates between operational ApiErrors and unexpected errors.
 */
export const errorMiddleware = (err, req, res, _next) => {
  // Operational errors — known, expected conditions
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors?.length ? err.errors : undefined,
    });
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ success: false, message: 'Unexpected file field.' });
  }

  // Unexpected errors — log full error, return generic message in production
  console.error(`❌ Unexpected error [${req.method} ${req.path}]:`, err);

  const message = process.env.NODE_ENV === 'production'
    ? 'An unexpected error occurred. Please try again later.'
    : err.message;

  return res.status(500).json({ success: false, message });
};
