import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';
import { corsOptions } from '@/config/cors';
import { httpLogger } from '@/config/logger';
import { requestIdMiddleware } from '@/common/middleware/requestId.middleware';
import { standardRateLimiter } from '@/common/middleware/rateLimit.middleware';
import { errorHandler } from '@/common/errors/errorHandler';
import { notFoundHandler } from '@/common/middleware/notFound.middleware';
import { v1Router } from './routes';

export const app = express();

// Security Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors(corsOptions));

// Request Tracking & Logging
app.use(requestIdMiddleware);
app.use(httpLogger);

// Body Parsing & Cookies
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
app.use(cookieParser());

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Global Rate Limiting
app.use('/api', standardRateLimiter);

// API Routes
app.use('/api/v1', v1Router);

// 404 Handler
app.use(notFoundHandler);

// Centralized Error Handling
app.use(errorHandler);

