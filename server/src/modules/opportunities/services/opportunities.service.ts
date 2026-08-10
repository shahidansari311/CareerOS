import { opportunitiesRepo } from '../repositories/opportunities.repository';
import { skillsService } from '@/modules/skills/services/skills.service';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';

export class OpportunitiesService {
  
  /**
   * Smart Recommendation Engine:
   * Compares the user's current skills against the requirements of all active jobs.
   * Sorts jobs by match percentage.
   */
  async getRecommendedOpportunities(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const activeOpps = await opportunitiesRepo.getActiveOpportunities();
    const userSkills = await skillsService.getUserSkills(userId);
    const userSkillMap = new Map(userSkills.map(us => [us.skillId, us.currentLevel]));

    const scoredOpps = activeOpps.map(opp => {
      if (opp.requirements.length === 0) return { ...opp, matchScore: 100 };

      let totalTarget = 0;
      let totalMet = 0;

      for (const req of opp.requirements) {
        totalTarget += req.targetLevel;
        const userLevel = userSkillMap.get(req.skillId) || 0;
        totalMet += Math.min(userLevel, req.targetLevel); // Cap at target
      }

      const matchScore = Math.round((totalMet / totalTarget) * 100);
      return { ...opp, matchScore };
    });

    // Sort by highest match score
    return scoredOpps.sort((a, b) => b.matchScore - a.matchScore);
  }

  async applyToOpportunity(userId: string, opportunityId: string, resumeUrl?: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const opp = await opportunitiesRepo.getOpportunity(opportunityId);
    if (!opp) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Opportunity not found');
    if (!opp.isActive) throw new AppError(400, ErrorCodes.BAD_REQUEST, 'Opportunity is no longer active');

    // Check if already applied
    const existingApp = await prisma.application.findUnique({
      where: {
        profileId_opportunityId: { profileId: profile.id, opportunityId }
      }
    });

    if (existingApp) {
      throw new AppError(400, ErrorCodes.BAD_REQUEST, 'You have already applied to this opportunity');
    }

    return opportunitiesRepo.createApplication(profile.id, opportunityId, resumeUrl);
  }

  async getUserApplications(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    return opportunitiesRepo.getUserApplications(profile.id);
  }

  async updateApplicationStatus(userId: string, applicationId: string, status: string, note?: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const application = await prisma.application.findUnique({ where: { id: applicationId } });
    if (!application) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Application not found');
    if (application.profileId !== profile.id) throw new AppError(403, ErrorCodes.FORBIDDEN, 'Not authorized');

    return opportunitiesRepo.updateApplicationStatus(applicationId, status, note);
  }
}

export const opportunitiesService = new OpportunitiesService();
