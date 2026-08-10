import { OAuth2Client } from 'google-auth-library';
import { env } from '@/config/env';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { authRepository } from '../repositories/auth.repository';
import { sessionService } from './session.service';
import { AuthTokens, SafeUser, GoogleUserInfo } from '../types/auth.types';
import { prisma } from '@/config/database';

export class OAuthService {
  private googleClient: OAuth2Client;

  constructor() {
    this.googleClient = new OAuth2Client(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_CALLBACK_URL
    );
  }

  getGoogleAuthUrl(): string {
    return this.googleClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      prompt: 'consent',
    });
  }

  async handleGoogleCallback(code: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    try {
      const { tokens } = await this.googleClient.getToken(code);
      this.googleClient.setCredentials(tokens);

      const ticket = await this.googleClient.verifyIdToken({
        idToken: tokens.id_token!,
        audience: env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Invalid Google Token Payload');
      }

      const googleUser: GoogleUserInfo = {
        id: payload.sub,
        email: payload.email.toLowerCase(),
        verified_email: payload.email_verified || false,
        name: payload.name || '',
        given_name: payload.given_name || '',
        family_name: payload.family_name || '',
        picture: payload.picture || '',
      };

      return await this.loginOrRegisterGoogleUser(googleUser, tokens.access_token, tokens.refresh_token);
    } catch (error) {
      if (error instanceof AppError) throw error;
      throw new AppError(500, ErrorCodes.INTERNAL_SERVER_ERROR, 'Failed to authenticate with Google');
    }
  }

  private async loginOrRegisterGoogleUser(
    googleUser: GoogleUserInfo,
    accessToken?: string | null,
    refreshToken?: string | null
  ): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    
    // Check if account already exists
    const existingAccount = await prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId: googleUser.id,
        },
      },
      include: { user: true },
    });

    if (existingAccount) {
      // Update tokens
      await prisma.account.update({
        where: { id: existingAccount.id },
        data: { accessToken, refreshToken: refreshToken || existingAccount.refreshToken },
      });
      
      // Update avatar if not already set
      if (googleUser.picture) {
        const profile = await prisma.studentProfile.findUnique({
          where: { userId: existingAccount.user.id },
        });
        if (profile && !profile.avatarUrl) {
          await prisma.studentProfile.update({
            where: { id: profile.id },
            data: { avatarUrl: googleUser.picture },
          });
        }
      }

      const tokens = await sessionService.createSession(existingAccount.user.id, existingAccount.user.role);
      const { passwordHash: _, ...safeUser } = existingAccount.user;
      return { user: safeUser, tokens };
    }

    // Check if user exists by email but hasn't linked Google
    const existingUser = await authRepository.findUserByEmail(googleUser.email);

    let userIdToLink = existingUser?.id;

    if (existingUser && googleUser.picture) {
      const profile = await prisma.studentProfile.findUnique({
        where: { userId: existingUser.id },
      });
      if (profile && !profile.avatarUrl) {
        await prisma.studentProfile.update({
          where: { id: profile.id },
          data: { avatarUrl: googleUser.picture },
        });
      }
    }

    if (!existingUser) {
      // Create new user & profile
      const newUser = await authRepository.createUserWithProfile(
        {
          email: googleUser.email,
          isVerified: googleUser.verified_email,
        },
        {
          firstName: googleUser.given_name,
          lastName: googleUser.family_name,
          avatarUrl: googleUser.picture || null,
        }
      );
      userIdToLink = newUser.id;
    }

    // Link account
    await prisma.account.create({
      data: {
        userId: userIdToLink!,
        provider: 'google',
        providerAccountId: googleUser.id,
        accessToken,
        refreshToken,
      },
    });

    const finalUser = await authRepository.findUserById(userIdToLink!);
    const tokens = await sessionService.createSession(finalUser!.id, finalUser!.role);
    const { passwordHash: _, ...safeUser } = finalUser!;
    
    return { user: safeUser, tokens };
  }
}

export const oauthService = new OAuthService();
