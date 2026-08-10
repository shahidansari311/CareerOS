import { prisma } from '@/config/database';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { OnboardingStatus } from '@prisma/client';

export class OnboardingService {
  
  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { onboardingStatus: true, onboardingStep: true },
    });
    return user;
  }

  async processStep1(userId: string, data: any) {
    await this.enforceStep(userId, 1);
    
    await prisma.$transaction([
      prisma.studentProfile.update({
        where: { userId },
        data: {
          college: data.college,
          branch: data.branch,
          graduationYear: data.graduationYear,
          currentYear: data.currentYear,
          semester: data.semester,
          location: data.location,
        },
      }),
      this.advanceStep(userId, 1, 2)
    ]);
  }

  async processStep2(userId: string, data: any) {
    await this.enforceStep(userId, 2);
    
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    await prisma.$transaction([
      prisma.education.create({
        data: {
          profileId: profile.id,
          institutionName: data.institutionName,
          degree: data.degree,
          fieldOfStudy: data.fieldOfStudy,
          startDate: data.startDate,
          grade: data.cgpa?.toString(),
          current: true,
        },
      }),
      prisma.studentProfile.update({
        where: { userId },
        data: { cgpa: data.cgpa }
      }),
      this.advanceStep(userId, 2, 3)
    ]);
  }

  async processStep3(userId: string, data: any) {
    await this.enforceStep(userId, 3);
    
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });

    await prisma.$transaction([
      prisma.careerGoal.create({
        data: {
          profileId: profile!.id,
          title: data.goalTitle,
        },
      }),
      prisma.careerInterest.create({
        data: {
          profileId: profile!.id,
          industry: data.targetIndustry,
          role: data.targetRole,
        },
      }),
      this.advanceStep(userId, 3, 4)
    ]);
  }

  async processStep4(userId: string, data: any) {
    await this.enforceStep(userId, 4);
    // TODO: In Phase 5, save actual UserSkill relations
    console.log(`[ONBOARDING] Mock Saving Skills for User ${userId}:`, data.skills);
    await this.advanceStep(userId, 4, 5);
  }

  async processStep5(userId: string, data: any) {
    await this.enforceStep(userId, 5);
    // TODO: In Phase 6, trigger GitHub/Leetcode async sync workers
    console.log(`[ONBOARDING] Mock Saving Coding Platforms for User ${userId}:`, data);
    
    // Final Step!
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStep: 5,
        onboardingStatus: 'COMPLETED',
      },
    });
  }

  private async enforceStep(userId: string, expectedStep: number) {
    const status = await this.getStatus(userId);
    if (status?.onboardingStatus === 'COMPLETED') {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Onboarding is already completed');
    }
    if (status?.onboardingStep !== expectedStep) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, `You must complete step ${status?.onboardingStep} first`);
    }
  }

  private advanceStep(userId: string, currentStep: number, nextStep: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        onboardingStatus: 'IN_PROGRESS',
        onboardingStep: nextStep,
      },
    });
  }
}

export const onboardingService = new OnboardingService();
