import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// Extend Express Request interface to include id
declare global {
  namespace Express {
    interface Request {
      id: string;
    }
  }
}

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Use provided request ID if it exists, otherwise generate a new one
  req.id = req.headers['x-request-id'] as string || uuidv4();
  
  // Attach it to the response headers
  res.setHeader('X-Request-ID', req.id);
  
  next();
};
