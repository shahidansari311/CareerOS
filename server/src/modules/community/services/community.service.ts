import { communityRepo } from '../repositories/community.repository';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';

export class CommunityService {
  
  /**
   * Smart Peer Matchmaking:
   * Finds users in the same college, branch, or who share the same career goals.
   */
  async getPeerRecommendations(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { careerGoals: true }
    });
    
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const goalIds = profile.careerGoals.map(g => g.id);

    // Find profiles that match college, branch, OR have similar goals
    const peers = await prisma.studentProfile.findMany({
      where: {
        id: { not: profile.id },
        OR: [
          { college: profile.college },
          { branch: profile.branch },
          { careerGoals: { some: { id: { in: goalIds } } } }
        ]
      },
      include: { careerGoals: true },
      take: 20
    });

    // Score them to sort highest matches first
    const scoredPeers = peers.map(peer => {
      let score = 0;
      if (peer.college === profile.college) score += 30;
      if (peer.branch === profile.branch) score += 20;
      
      const sharedGoals = peer.careerGoals.filter(g => goalIds.includes(g.id)).length;
      score += (sharedGoals * 25);
      
      return {
        id: peer.id,
        firstName: peer.firstName,
        lastName: peer.lastName,
        college: peer.college,
        branch: peer.branch,
        matchScore: Math.min(100, score)
      };
    });

    return scoredPeers.sort((a, b) => b.matchScore - a.matchScore);
  }

  async sendConnectionRequest(userId: string, recipientId: string) {
    const requester = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!requester) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    if (requester.id === recipientId) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Cannot connect with yourself');
    }

    const existing = await prisma.connection.findUnique({
      where: { requesterId_recipientId: { requesterId: requester.id, recipientId } }
    });

    if (existing) throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Connection already exists');

    return communityRepo.sendConnectionRequest(requester.id, recipientId);
  }

  async updateConnectionStatus(userId: string, connectionId: string, status: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const conn = await prisma.connection.findUnique({ where: { id: connectionId } });
    if (!conn) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Connection not found');
    
    if (conn.recipientId !== profile.id) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'Only the recipient can accept/reject');
    }

    return communityRepo.updateConnectionStatus(connectionId, status);
  }

  async getMyNetwork(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    return communityRepo.getAcceptedConnections(profile.id);
  }

  async createPost(userId: string, content: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    return communityRepo.createPost(profile.id, content);
  }

  async getFeed() {
    return communityRepo.getFeed();
  }
}

export const communityService = new CommunityService();
