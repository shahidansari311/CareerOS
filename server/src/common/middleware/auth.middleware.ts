import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';
import { ErrorCodes } from '../errors/ErrorCodes';
import { sessionService } from '@/modules/auth/services/session.service';
import { TokenPayload } from '@/modules/auth/types/auth.types';
import { Role } from '@prisma/client';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
  }

  try {
    const payload = sessionService.verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (error) {
    return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid or expired access token'));
  }
};

export const requireRole = (roles: Role[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user) {
      return next(new AppError(401, ErrorCodes.UNAUTHORIZED, 'Authentication required'));
    }

    if (!roles.includes(user.role)) {
      return next(new AppError(403, ErrorCodes.FORBIDDEN, 'You do not have permission to perform this action'));
    }

    next();
  };
};
