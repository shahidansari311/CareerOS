import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export class SkillsRepository {
  async upsertUserSkill(profileId: string, skillId: string, data: { currentLevel: number; confidence: number; evidence?: string; source: string }) {
    return prisma.userSkill.upsert({
      where: {
        profileId_skillId: {
          profileId,
          skillId,
        },
      },
      update: {
        currentLevel: data.currentLevel,
        confidence: data.confidence,
        evidence: data.evidence,
        source: data.source,
        lastAssessedAt: new Date(),
      },
      create: {
        profileId,
        skillId,
        currentLevel: data.currentLevel,
        confidence: data.confidence,
        evidence: data.evidence,
        source: data.source,
      },
    });
  }

  async getUserSkills(profileId: string) {
    return prisma.userSkill.findMany({
      where: { profileId },
      include: { skill: true },
    });
  }

  async getCareerPathRequirements(careerPathId: string) {
    return prisma.skillRequirement.findMany({
      where: { careerPathId },
      include: { skill: true },
    });
  }
}

export const skillsRepository = new SkillsRepository();
