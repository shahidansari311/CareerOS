import { skillsRepository } from '../repositories/skills.repository';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';

export class SkillsService {
  
  async evaluateSkill(userId: string, data: any) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    // Ensure skill exists
    const skill = await prisma.skill.findUnique({ where: { id: data.skillId } });
    if (!skill) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Skill not found');

    return skillsRepository.upsertUserSkill(profile.id, skill.id, {
      currentLevel: data.currentLevel,
      confidence: data.confidence,
      evidence: data.evidence,
      source: 'MANUAL',
    });
  }

  async getUserSkills(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const userSkills = await skillsRepository.getUserSkills(profile.id);
    return userSkills.map(us => ({
      ...us,
      proficiencyLevel: us.currentLevel * 10
    }));
  }

  async calculateSkillGaps(userId: string, careerPathId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const requirements = await skillsRepository.getCareerPathRequirements(careerPathId);
    const userSkills = await skillsRepository.getUserSkills(profile.id);

    const userSkillMap = new Map(userSkills.map(us => [us.skillId, us]));

    const gaps = requirements.map(req => {
      const userSkill = userSkillMap.get(req.skillId);
      const currentLevel = userSkill ? userSkill.currentLevel : 0;
      const gap = req.targetLevel - currentLevel;

      return {
        skill: req.skill,
        targetLevel: req.targetLevel,
        currentLevel,
        gap: gap > 0 ? gap : 0,
        isCore: req.isCore,
        needsImprovement: gap > 0,
      };
    });

    return gaps;
  }
}

export const skillsService = new SkillsService();
