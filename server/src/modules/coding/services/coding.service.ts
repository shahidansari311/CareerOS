import { prisma } from '@/config/database';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';

export class CodingService {
  async getCodingProfiles(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: { codingProfiles: true }
    });
    
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }
    
    return profile.codingProfiles;
  }

  async connectCodingProfile(userId: string, data: { platform: string; username: string }) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    // Generate realistic problem-solving / activity mock statistics
    let solved = 0;
    let rating = 0;
    let rank = 0;
    let streak = 0;

    switch (data.platform) {
      case 'LEETCODE':
        try {
          const res = await fetch(`https://alfa-leetcode-api.onrender.com/${data.username}`);
          if (res.ok) {
            const ldata = await res.json();
            solved = ldata.solvedProblem || 0;
            rating = 0;
            rank = ldata.ranking || 0;
            streak = 0;
          }
        } catch (e) {
          console.error("Failed to fetch LeetCode data", e);
        }
        break;
      case 'HACKERRANK':
        break;
      case 'CODECHEF':
        break;
      case 'CODEFORCES':
        break;
      case 'GITHUB':
        try {
          const res = await fetch(`https://api.github.com/users/${data.username}`);
          if (res.ok) {
            const gdata = await res.json();
            solved = gdata.public_repos || 0;
            rating = 0;
            rank = 0;
            streak = 0;
          }
        } catch (e) {
          console.error("Failed to fetch GitHub data", e);
        }
        break;
      case 'GEEKSFORGEEKS':
        break;
    }

    const codingProfile = await prisma.codingProfile.upsert({
      where: {
        profileId_platform: {
          profileId: profile.id,
          platform: data.platform
        }
      },
      update: {
        username: data.username,
        solved,
        rating,
        rank,
        streak
      },
      create: {
        profileId: profile.id,
        platform: data.platform,
        username: data.username,
        solved,
        rating,
        rank,
        streak
      }
    });

    return codingProfile;
  }

  async disconnectCodingProfile(userId: string, id: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId }
    });
    
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    const existing = await prisma.codingProfile.findFirst({
      where: { id, profileId: profile.id }
    });

    if (!existing) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Coding profile not found');
    }

    await prisma.codingProfile.delete({
      where: { id }
    });

    return true;
  }
}

export const codingService = new CodingService();
