import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Format the Zod error into a more readable structure
        const formattedErrors = error.issues.map((err: any) => ({
          field: err.path.join('.'),
          message: err.message,
        }));

        next(
          new AppError(
            400,
            ErrorCodes.VALIDATION_ERROR,
            'Invalid request data',
            formattedErrors
          )
        );
      } else {
        next(error);
      }
    }
  };
};
