import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import { TokenPayload, AuthTokens } from '../types/auth.types';
import { sessionRepository } from '../repositories/session.repository';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@prisma/client';

export class SessionService {
  private readonly accessExpiresIn = '15m'; // 15 minutes
  private readonly refreshExpiresIn = '7d'; // 7 days
  private readonly refreshExpiresDays = 7;

  /**
   * Generates a new Access Token
   */
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Creates a new session in DB and returns Access and Refresh tokens
   */
  async createSession(userId: string, role: Role): Promise<AuthTokens> {
    const sessionToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.refreshExpiresDays);

    // Save session in DB
    const session = await sessionRepository.createSession(userId, sessionToken, expiresAt);

    const payload: TokenPayload = {
      userId,
      role,
      sessionId: session.id,
    };

    const accessToken = this.generateAccessToken(payload);
    const refreshToken = jwt.sign({ sessionId: session.id }, env.JWT_REFRESH_SECRET, {
      expiresIn: this.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  /**
   * Verifies an access token
   */
  verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
  }

  /**
   * Verifies a refresh token and returns the sessionId
   */
  verifyRefreshToken(token: string): { sessionId: string } {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as { sessionId: string };
  }

  /**
   * Refreshes a session by providing a new Access Token
   */
  async refreshSession(refreshToken: string): Promise<AuthTokens> {
    const { sessionId } = this.verifyRefreshToken(refreshToken);

    const session = await sessionRepository.findSessionByToken(sessionId);
    if (!session || session.expiresAt < new Date()) {
      if (session) await sessionRepository.deleteSessionById(session.id);
      throw new Error('Invalid or expired session');
    }

    // Optionally rotate the refresh token here for higher security
    // For now, just issue a new access token
    const payload: TokenPayload = {
      userId: session.userId,
      role: 'STUDENT', // In a real app, query the user to get current role if it might change
      sessionId: session.id,
    };

    const accessToken = this.generateAccessToken(payload);
    
    return { accessToken, refreshToken };
  }

  /**
   * Revokes a specific session
   */
  async revokeSession(sessionId: string): Promise<void> {
    await sessionRepository.deleteSessionById(sessionId);
  }

  /**
   * Revokes all sessions for a user
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await sessionRepository.deleteAllSessionsForUser(userId);
  }
}

export const sessionService = new SessionService();
