import { roadmapService } from '@/modules/roadmap/services/roadmap.service';
import { skillsService } from '@/modules/skills/services/skills.service';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';

export class IntelligenceService {
  
  private async getActiveCareerPathId(userId: string): Promise<string | null> {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
      include: {
        roadmaps: {
          where: { status: 'ACTIVE' },
          take: 1,
        }
      }
    });
    if (profile?.roadmaps && profile.roadmaps.length > 0) {
      return profile.roadmaps[0].careerPathId;
    }
    return null;
  }

  async getDailyPlan(userId: string, activeRoadmapId: string) {
    const roadmap = await roadmapService.getRoadmapDetails(activeRoadmapId);
    if (roadmap.profile.userId !== userId) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'Not authorized for this roadmap');
    }

    // Heuristics: Find the first 3 pending or in-progress steps
    const pendingSteps = roadmap.steps
      .filter(s => s.status === 'PENDING' || s.status === 'IN_PROGRESS')
      .slice(0, 3);

    return {
      date: new Date().toISOString().split('T')[0],
      tasks: pendingSteps,
      motivationalQuote: "Consistency is what transforms average into excellence.",
    };
  }

  async getNextBestAction(userId: string, careerPathId?: string) {
    let activePathId = careerPathId;
    if (!activePathId) {
      activePathId = (await this.getActiveCareerPathId(userId)) || undefined;
    }

    if (!activePathId) {
      return {
        actionType: 'ONBOARD',
        title: 'Choose a Career Path',
        description: 'Complete your onboarding and generate a career roadmap to get personalized recommendations.',
        urgency: 'HIGH',
        context: 'Onboarding',
        rationale: 'Choose a target path to begin generating personalized skill recommendations.'
      };
    }

    // Determine the next best action deterministically
    const gaps = await skillsService.calculateSkillGaps(userId, activePathId);
    
    // Sort gaps by severity (largest gap first)
    const severeGaps = gaps
      .filter(g => g.needsImprovement)
      .sort((a, b) => b.gap - a.gap);

    if (severeGaps.length > 0) {
      const topGap = severeGaps[0];
      return {
        actionType: 'LEARN',
        title: `Master ${topGap.skill.name}`,
        description: `Your ${topGap.skill.name} level is ${topGap.currentLevel}, but the industry expects ${topGap.targetLevel}. Spend 1 hour today reviewing core concepts.`,
        urgency: 'HIGH',
        context: `Skill Gap: ${topGap.skill.name}`,
        rationale: `Your current level is ${topGap.currentLevel}, but the industry target is ${topGap.targetLevel}. Learning this will boost your career readiness.`
      };
    }

    return {
      actionType: 'APPLY',
      title: `Build Your Portfolio`,
      description: `You have met the base skill requirements! Start building projects to showcase your abilities.`,
      urgency: 'MEDIUM',
      context: 'Portfolio',
      rationale: 'You have met the target level for all core skills. Building projects is the next best step.'
    };
  }

  async getCareerReadinessScore(userId: string, careerPathId?: string) {
    let activePathId = careerPathId;
    if (!activePathId) {
      activePathId = (await this.getActiveCareerPathId(userId)) || undefined;
    }

    if (!activePathId) {
      return {
        score: 0,
        outOf: 100,
        message: 'No active roadmap found',
        readinessLevel: 'BEGINNER',
        analysis: 'Generate a career roadmap to start tracking your industry readiness score.'
      };
    }

    const gaps = await skillsService.calculateSkillGaps(userId, activePathId);
    
    if (gaps.length === 0) {
      return {
        score: 0,
        outOf: 100,
        message: 'No requirements found',
        readinessLevel: 'BEGINNER',
        analysis: 'No skill requirements defined for this career path.'
      };
    }

    let totalTarget = 0;
    let totalCurrent = 0;

    gaps.forEach(g => {
      totalTarget += g.targetLevel;
      totalCurrent += Math.min(g.currentLevel, g.targetLevel); // Cap at target
    });

    const score = Math.round((totalCurrent / totalTarget) * 100);
    
    let analysis = 'Start learning the core skills to increase your readiness.';
    if (score >= 90) {
      analysis = 'You are highly prepared for this career path! Start applying to jobs.';
    } else if (score >= 60) {
      analysis = 'You are making great progress. Master the remaining core skills to be job-ready.';
    }

    return {
      score,
      outOf: 100,
      readinessLevel: score >= 90 ? 'READY' : score >= 60 ? 'PREPARING' : 'BEGINNER',
      analysis
    };
  }
}

export const intelligenceService = new IntelligenceService();

