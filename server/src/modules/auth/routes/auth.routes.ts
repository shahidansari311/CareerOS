import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { asyncHandler } from '@/common/utils/asyncHandler';
import { validateRequest } from '@/common/middleware/validation.middleware';
import { requireAuth } from '@/common/middleware/auth.middleware';
import { authRateLimiter } from '@/common/middleware/rateLimit.middleware';
import * as schemas from '../schemas/auth.schema';

const router = Router();

// Rate limiting on sensitive endpoints
router.use('/register', authRateLimiter);
router.use('/login', authRateLimiter);
router.use('/forgot-password', authRateLimiter);
router.use('/reset-password', authRateLimiter);

// Standard Email/Password Auth
router.post('/register', validateRequest(schemas.registerSchema), asyncHandler(authController.register));
router.post('/login', validateRequest(schemas.loginSchema), asyncHandler(authController.login));
router.post('/logout', requireAuth, asyncHandler(authController.logout));
router.post('/refresh', asyncHandler(authController.refresh));

// Email Verification & Password Recovery
router.post('/verify-email', validateRequest(schemas.verifyEmailSchema), asyncHandler(authController.verifyEmail));
router.post('/forgot-password', validateRequest(schemas.forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validateRequest(schemas.resetPasswordSchema), asyncHandler(authController.resetPassword));

// Google OAuth
router.get('/google/url', asyncHandler(authController.getGoogleAuthUrl));
router.get('/google/callback', asyncHandler(authController.handleGoogleCallback));

// Protected Routes
router.get('/me', requireAuth, asyncHandler(authController.getMe));

export const authRoutes = router;
