import { prisma } from '@/config/database';

export class CommunityRepository {
  
  async sendConnectionRequest(requesterId: string, recipientId: string) {
    return prisma.connection.create({
      data: {
        requesterId,
        recipientId,
        status: 'PENDING',
      },
    });
  }

  async updateConnectionStatus(connectionId: string, status: string) {
    return prisma.connection.update({
      where: { id: connectionId },
      data: { status },
    });
  }

  async getAcceptedConnections(profileId: string) {
    return prisma.connection.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [
          { requesterId: profileId },
          { recipientId: profileId },
        ],
      },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, college: true, branch: true } },
        recipient: { select: { id: true, firstName: true, lastName: true, college: true, branch: true } },
      },
    });
  }

  async createPost(profileId: string, content: string) {
    return prisma.post.create({
      data: { profileId, content },
      include: { profile: { select: { firstName: true, lastName: true } } },
    });
  }

  async getFeed() {
    return prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: {
        profile: { select: { firstName: true, lastName: true, college: true, branch: true } },
      },
    });
  }
}

export const communityRepo = new CommunityRepository();
