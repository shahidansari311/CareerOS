import { User, Role } from '@prisma/client';

// Omit sensitive data when sending user info to the client
export type SafeUser = Omit<User, 'passwordHash'>;

export interface TokenPayload {
  userId: string;
  role: Role;
  sessionId: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}
