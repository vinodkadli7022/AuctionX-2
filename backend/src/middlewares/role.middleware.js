import { ApiError } from '../utils/ApiError.js';

/**
 * Role middleware factory — accepts an array of allowed roles.
 * Must be used AFTER authMiddleware so req.user is populated.
 *
 * @param {...string} roles - Allowed roles (e.g., 'auctioneer', 'franchise')
 */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized());
  }
  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Access denied. Required roles: ${roles.join(', ')}`));
  }
  next();
};
