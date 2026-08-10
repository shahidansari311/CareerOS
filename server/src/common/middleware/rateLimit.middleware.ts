import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

// Standard API rate limit (e.g. 100 requests per 15 minutes)
export const standardRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(
      429, 
      ErrorCodes.TOO_MANY_REQUESTS, 
      'Too many requests, please try again later.'
    ));
  },
});

// Stricter rate limit for auth endpoints
export const authRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError(
      429, 
      ErrorCodes.TOO_MANY_REQUESTS, 
      'Too many authentication attempts, please try again later.'
    ));
  },
});
