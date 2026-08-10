import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { oauthService } from '../services/oauth.service';
import { sessionService } from '../services/session.service';
import { successResponse } from '@/common/utils/response';
import { env } from '@/config/env';
import { AuthTokens } from '../types/auth.types';
import { prisma } from '@/config/database';


export class AuthController {
  private setTokenCookies(res: Response, tokens: AuthTokens) {
    const isProd = env.NODE_ENV === 'production';
    
    res.cookie('accessToken', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  private clearTokenCookies(res: Response) {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }

  register = async (req: Request, res: Response) => {
    const { user, tokens } = await authService.register(req.body);
    this.setTokenCookies(res, tokens);
    res.status(201).json(successResponse({ user }, 'Registration successful. Please verify your email.'));
  };

  login = async (req: Request, res: Response) => {
    const { user, tokens } = await authService.login(req.body);
    this.setTokenCookies(res, tokens);
    res.json(successResponse({ user }, 'Login successful'));
  };

  logout = async (req: Request, res: Response) => {
    const sessionId = req.user?.sessionId;
    if (sessionId) {
      await authService.logout(sessionId);
    }
    this.clearTokenCookies(res);
    res.json(successResponse(null, 'Logout successful'));
  };

  refresh = async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, error: { message: 'Refresh token missing' } });
    }

    const tokens = await sessionService.refreshSession(refreshToken);
    this.setTokenCookies(res, tokens);
    res.json(successResponse(null, 'Token refreshed successfully'));
  };

  getMe = async (req: Request, res: Response) => {
    const userId = req.user!.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            education: true,
            careerGoals: true,
            careerInterests: true,
          }
        }
      },
    });
    if (!user) {
      return res.status(404).json({ success: false, error: { message: 'User not found' } });
    }
    const { passwordHash: _, ...safeUser } = user;
    res.json(successResponse({ user: safeUser }));
  };

  verifyEmail = async (req: Request, res: Response) => {
    await authService.verifyEmail(req.body.token);
    res.json(successResponse(null, 'Email verified successfully'));
  };

  forgotPassword = async (req: Request, res: Response) => {
    await authService.requestPasswordReset(req.body.email);
    res.json(successResponse(null, 'If that email exists, a password reset link has been sent.'));
  };

  resetPassword = async (req: Request, res: Response) => {
    await authService.resetPassword(req.body);
    res.json(successResponse(null, 'Password has been successfully reset.'));
  };

  // Google OAuth
  getGoogleAuthUrl = async (req: Request, res: Response) => {
    const url = oauthService.getGoogleAuthUrl();
    res.json(successResponse({ url }));
  };

  handleGoogleCallback = async (req: Request, res: Response) => {
    const code = req.query.code as string;
    if (!code) {
      return res.status(400).json({ success: false, error: { message: 'Authorization code is missing' } });
    }

    const { user, tokens } = await oauthService.handleGoogleCallback(code);
    this.setTokenCookies(res, tokens);
    
    // Redirect to frontend dashboard
    res.redirect(`${env.CORS_ORIGIN}/app/dashboard`);
  };
}

export const authController = new AuthController();
