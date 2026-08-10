import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
  next(new AppError(
    404,
    ErrorCodes.RESOURCE_NOT_FOUND,
    `Route ${req.method} ${req.originalUrl} not found`
  ));
};
