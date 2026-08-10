import { Request, Response, NextFunction } from 'express';
import { AppError } from './AppError';
import { ErrorCodes } from './ErrorCodes';
import { logger } from '@/config/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  if (err instanceof AppError) {
    // Log non-operational errors more aggressively
    if (!err.isOperational) {
      logger.error(err, 'Non-operational AppError occurred');
    } else {
      logger.warn({ err: err.message, code: err.code }, 'Operational error');
    }

    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    });
  }

  // Handle generic / unexpected errors
  logger.error(err, 'Unhandled error');

  return res.status(500).json({
    success: false,
    error: {
      code: ErrorCodes.INTERNAL_SERVER_ERROR,
      message: 'An unexpected error occurred. Please try again later.',
    },
  });
};
