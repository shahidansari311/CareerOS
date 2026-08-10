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
        solved = Math.floor(150 + Math.random() * 400);
        rating = Math.floor(1400 + Math.random() * 800);
        rank = Math.floor(10000 + Math.random() * 150000);
        streak = Math.floor(3 + Math.random() * 25);
        break;
      case 'HACKERRANK':
        solved = Math.floor(80 + Math.random() * 200);
        rating = 0; // HackerRank focuses more on stars
        rank = Math.floor(5000 + Math.random() * 95000);
        streak = Math.floor(1 + Math.random() * 10);
        break;
      case 'CODECHEF':
        solved = Math.floor(50 + Math.random() * 300);
        rating = Math.floor(1300 + Math.random() * 900);
        rank = Math.floor(1000 + Math.random() * 50000);
        streak = Math.floor(2 + Math.random() * 15);
        break;
      case 'CODEFORCES':
        solved = Math.floor(40 + Math.random() * 250);
        rating = Math.floor(1000 + Math.random() * 1100);
        rank = Math.floor(500 + Math.random() * 35000);
        streak = Math.floor(1 + Math.random() * 12);
        break;
      case 'GITHUB':
        solved = Math.floor(10 + Math.random() * 50); // represents public repositories
        rating = Math.floor(5 + Math.random() * 100);  // represents total stars in this context
        rank = 0;
        streak = Math.floor(2 + Math.random() * 30);  // contribution streak
        break;
      case 'GEEKSFORGEEKS':
        solved = Math.floor(100 + Math.random() * 500);
        rating = 0;
        rank = Math.floor(5000 + Math.random() * 80000);
        streak = Math.floor(3 + Math.random() * 20);
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
