import Joi from 'joi';
import { logger } from '../utils/logger.js';

/**
 * Validate search query
 * - Required
 * - Length: 2-100 characters
 * - No special characters that could cause issues
 */
export function validateSearchQuery(req, res, next) {
  const schema = Joi.object({
    q: Joi.string()
      .min(2)
      .max(100)
      .required()
      .trim()
      .pattern(/^[a-zA-Z0-9\s\-\.\&\+\,]*$/) // Allow alphanumeric, spaces, common punctuation
      .messages({
        'string.empty': 'Search query cannot be empty',
        'string.min': 'Search query must be at least 2 characters',
        'string.max': 'Search query must not exceed 100 characters',
        'string.pattern.base': 'Search query contains invalid characters',
        'any.required': 'Search query is required',
      }),
  });

  const { error, value } = schema.validate({ q: req.query.q });

  if (error) {
    logger.warn(`Validation error for search: ${error.message}`, { query: req.query.q });
    return res.status(400).json({
      error: 'Invalid Search Query',
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
    });
  }

  req.query.q = value.q;
  next();
}

/**
 * Validate suggestion query
 * - Required
 * - Length: 1-50 characters (more lenient than search)
 */
export function validateSuggestionQuery(req, res, next) {
  const schema = Joi.object({
    q: Joi.string()
      .min(1)
      .max(50)
      .required()
      .trim()
      .pattern(/^[a-zA-Z0-9\s\-\.\&\+\,]*$/)
      .messages({
        'string.empty': 'Query cannot be empty',
        'string.min': 'Query must be at least 1 character',
        'string.max': 'Query must not exceed 50 characters',
        'string.pattern.base': 'Query contains invalid characters',
        'any.required': 'Query is required',
      }),
  });

  const { error, value } = schema.validate({ q: req.query.q });

  if (error) {
    logger.warn(`Validation error for suggestions: ${error.message}`);
    return res.status(400).json({
      error: 'Invalid Query',
      message: error.details[0].message,
      code: 'VALIDATION_ERROR',
    });
  }

  req.query.q = value.q;
  next();
}

/**
 * Validate product search results
 */
export function validateProduct(product) {
  const schema = Joi.object({
    id: Joi.string().required(),
    title: Joi.string().required(),
    price: Joi.number().min(0).required(),
    image: Joi.string().uri().allow(''),
    platform: Joi.string().required(),
    url: Joi.string().uri().required(),
    rating: Joi.number().min(0).max(5).optional(),
    description: Joi.string().optional(),
    availability: Joi.string().optional(),
    category: Joi.string().optional(),
  });

  const { error, value } = schema.validate(product);
  return { isValid: !error, product: value, error };
}
