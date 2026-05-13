/**
 * Wraps async route handlers in try-catch and forwards errors to next().
 * Prevents unhandled promise rejection crashes.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
