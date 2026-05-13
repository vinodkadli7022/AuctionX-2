import { ApiError } from '../utils/ApiError.js';

/**
 * Validate middleware factory — wraps Joi schemas for body/query/params.
 * @param {import('joi').ObjectSchema} schema - Joi schema to validate against
 * @param {'body'|'query'|'params'} source - Where to read request data from
 */
export const validate = (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], { abortEarly: false, stripUnknown: true });
  if (error) {
    const errors = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(ApiError.unprocessable('Validation failed', errors));
  }
  req[source] = value;
  next();
};
