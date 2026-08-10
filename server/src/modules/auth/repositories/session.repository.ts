import { prisma } from '@/config/database';
import { Session } from '@prisma/client';

export class SessionRepository {
  async createSession(userId: string, sessionToken: string, expiresAt: Date): Promise<Session> {
    return prisma.session.create({
      data: {
        userId,
        sessionToken,
        expiresAt,
      },
    });
  }

  async findSessionByToken(sessionToken: string): Promise<Session | null> {
    return prisma.session.findUnique({
      where: { sessionToken },
    });
  }

  async deleteSession(sessionToken: string): Promise<void> {
    await prisma.session.delete({
      where: { sessionToken },
    });
  }

  async deleteSessionById(sessionId: string): Promise<void> {
    await prisma.session.delete({
      where: { id: sessionId },
    });
  }

  async deleteAllSessionsForUser(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });
  }

  async deleteExpiredSessions(): Promise<void> {
    await prisma.session.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
  }
}

export const sessionRepository = new SessionRepository();
