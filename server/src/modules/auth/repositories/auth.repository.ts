import { prisma } from '@/config/database';
import { Prisma, User } from '@prisma/client';

export class AuthRepository {
  async findUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async createUserWithProfile(
    data: Prisma.UserCreateInput,
    profileData: Omit<Prisma.StudentProfileCreateWithoutUserInput, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<User> {
    return prisma.user.create({
      data: {
        ...data,
        profile: {
          create: profileData,
        },
      },
    });
  }

  async updateUser(id: string, data: Prisma.UserUpdateInput): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // Email Verification Tokens
  async createEmailVerificationToken(email: string, token: string, expiresAt: Date) {
    return prisma.emailVerificationToken.create({
      data: { email, token, expiresAt },
    });
  }

  async findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
    });
  }

  async deleteEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.delete({
      where: { token },
    });
  }

  // Password Reset Tokens
  async createPasswordResetToken(email: string, token: string, expiresAt: Date) {
    // Upsert to ensure only one token per email is active
    const existingToken = await prisma.passwordResetToken.findFirst({
      where: { email }
    });

    if (existingToken) {
        return prisma.passwordResetToken.update({
            where: { id: existingToken.id },
            data: { token, expiresAt }
        })
    }

    return prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  }

  async deletePasswordResetToken(token: string) {
    return prisma.passwordResetToken.delete({
      where: { token },
    });
  }
}

export const authRepository = new AuthRepository();
