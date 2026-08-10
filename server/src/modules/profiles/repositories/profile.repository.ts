import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export class ProfileRepository {
  async findByUserId(userId: string) {
    return prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        education: true,
        careerGoals: true,
        careerInterests: true,
      },
    });
  }

  async updateProfile(userId: string, data: Prisma.StudentProfileUpdateInput) {
    return prisma.studentProfile.update({
      where: { userId },
      data,
    });
  }

  async addEducation(profileId: string, data: Prisma.EducationCreateWithoutProfileInput) {
    return prisma.education.create({
      data: {
        ...data,
        profileId,
      },
    });
  }

  async replaceCareerGoals(profileId: string, goals: Prisma.CareerGoalCreateWithoutProfileInput[]) {
    // Transaction to safely replace all goals
    return prisma.$transaction([
      prisma.careerGoal.deleteMany({ where: { profileId } }),
      prisma.careerGoal.createMany({
        data: goals.map(g => ({ ...g, profileId })),
      }),
    ]);
  }

  async replaceCareerInterests(profileId: string, interests: Prisma.CareerInterestCreateWithoutProfileInput[]) {
    return prisma.$transaction([
      prisma.careerInterest.deleteMany({ where: { profileId } }),
      prisma.careerInterest.createMany({
        data: interests.map(i => ({ ...i, profileId })),
      }),
    ]);
  }
}

export const profileRepository = new ProfileRepository();
