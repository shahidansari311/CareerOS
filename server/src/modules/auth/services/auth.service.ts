import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { authRepository } from '../repositories/auth.repository';
import { passwordService } from './password.service';
import { sessionService } from './session.service';
import { AuthTokens, SafeUser } from '../types/auth.types';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/config/logger';
import { sendEmail } from '@/config/mail';

export class AuthService {
  async register(data: any): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const existingUser = await authRepository.findUserByEmail(data.email);
    if (existingUser) {
      throw new AppError(409, ErrorCodes.CONFLICT, 'Email is already registered');
    }

    const passwordHash = await passwordService.hash(data.password);

    const user = await authRepository.createUserWithProfile(
      {
        email: data.email,
        passwordHash,
        isVerified: false,
      },
      {
        firstName: data.firstName,
        lastName: data.lastName,
      }
    );

    // Mock Email Verification
    const verificationToken = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await authRepository.createEmailVerificationToken(user.email, verificationToken, expiresAt);
    
    logger.info(`[MOCK EMAIL] Verification link for ${user.email}: http://localhost:5173/verify-email?token=${verificationToken}`);

    const tokens = await sessionService.createSession(user.id, user.role);
    
    // Send Welcome Email
    sendEmail(
      data.email,
      'Welcome to CareerOS!',
      `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Welcome to CareerOS, ${data.firstName}! 🚀</h2>
        <p>We are thrilled to have you on board. CareerOS is designed to take you from your first year to your first tech job.</p>
        <p>Your next step is to log in, complete your profile, and meet your AI Career Mentor.</p>
        <br/>
        <a href="http://localhost:5173/auth/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Log In Now</a>
        <br/><br/>
        <p>Best regards,</p>
        <p><strong>The CareerOS Team</strong><br/><a href="mailto:careerOS.work@gmail.com">careerOS.work@gmail.com</a></p>
      </div>
      `
    );

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async login(data: any): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    const user = await authRepository.findUserByEmail(data.email);
    if (!user || !user.passwordHash) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    const isValid = await passwordService.verify(user.passwordHash, data.password);
    if (!isValid) {
      throw new AppError(401, ErrorCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    const tokens = await sessionService.createSession(user.id, user.role);

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async logout(sessionId: string): Promise<void> {
    await sessionService.revokeSession(sessionId);
  }

  async verifyEmail(token: string): Promise<void> {
    const verificationToken = await authRepository.findEmailVerificationToken(token);
    
    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      if (verificationToken) await authRepository.deleteEmailVerificationToken(token);
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Invalid or expired verification token');
    }

    const user = await authRepository.findUserByEmail(verificationToken.email);
    if (!user) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'User not found');

    await authRepository.updateUser(user.id, { isVerified: true });
    await authRepository.deleteEmailVerificationToken(token);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) return; // Do not reveal if email exists or not

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    await authRepository.createPasswordResetToken(email, token, expiresAt);

    logger.info(`[MOCK EMAIL] Password reset link for ${email}: http://localhost:5173/reset-password?token=${token}`);
  }

  async resetPassword(data: any): Promise<void> {
    const resetToken = await authRepository.findPasswordResetToken(data.token);
    
    if (!resetToken || resetToken.expiresAt < new Date()) {
      if (resetToken) await authRepository.deletePasswordResetToken(data.token);
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Invalid or expired reset token');
    }

    const user = await authRepository.findUserByEmail(resetToken.email);
    if (!user) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'User not found');

    const passwordHash = await passwordService.hash(data.newPassword);
    
    await authRepository.updateUser(user.id, { passwordHash });
    await authRepository.deletePasswordResetToken(data.token);
    
    // Security: Revoke all existing sessions so old logins are invalidated
    await sessionService.revokeAllSessions(user.id);
  }
}

export const authService = new AuthService();
