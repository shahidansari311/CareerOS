import { roadmapRepository } from '../repositories/roadmap.repository';
import { skillsService } from '@/modules/skills/services/skills.service';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';
import { prisma } from '@/config/database';

export class RoadmapService {
  
  async createCustomCareerPath(
    userId: string, 
    data: { title: string; description?: string; industry: string; skills: { skillId: string; targetLevel: number }[] }
  ) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    // 1. Create or update the custom career path (guaranteeing uniqueness of the title)
    let careerPath = await prisma.careerPath.findUnique({
      where: { title: data.title }
    });

    if (!careerPath) {
      careerPath = await prisma.careerPath.create({
        data: {
          title: data.title,
          description: data.description || '',
          industry: data.industry,
        }
      });
    } else {
      careerPath = await prisma.careerPath.update({
        where: { id: careerPath.id },
        data: {
          description: data.description || '',
          industry: data.industry,
        }
      });
    }

    // 2. Clear old requirements and create the new set
    await prisma.skillRequirement.deleteMany({
      where: { careerPathId: careerPath.id }
    });

    if (data.skills && data.skills.length > 0) {
      await prisma.skillRequirement.createMany({
        data: data.skills.map(s => ({
          careerPathId: careerPath!.id,
          skillId: s.skillId,
          targetLevel: s.targetLevel,
          isCore: true,
        }))
      });
    }

    return careerPath;
  }

  async generateRoadmap(userId: string, careerPathId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });

    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    const careerPath = await prisma.careerPath.findUnique({ where: { id: careerPathId } });
    if (!careerPath) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Career Path not found');

    // 1. Calculate Skill Gaps
    const gaps = await skillsService.calculateSkillGaps(userId, careerPathId);
    
    // 2. Generate Steps deterministically based on gaps
    const stepsToCreate: any[] = [];
    let orderIndex = 1;

    for (const gap of gaps) {
      if (gap.needsImprovement) {
        stepsToCreate.push({
          title: `Learn ${gap.skill.name}`,
          description: `Improve your ${gap.skill.name} from level ${gap.currentLevel} to ${gap.targetLevel}.`,
          orderIndex,
          type: 'LEARN',
          status: 'PENDING',
        });
        orderIndex++;

        stepsToCreate.push({
          title: `Build a project using ${gap.skill.name}`,
          description: `Apply your newly learned ${gap.skill.name} skills in a real-world project.`,
          orderIndex,
          type: 'BUILD',
          status: 'PENDING',
        });
        orderIndex++;
      }
    }

    if (stepsToCreate.length === 0) {
      stepsToCreate.push({
        title: `Prepare for Interviews`,
        description: `You have met all the skill requirements for ${careerPath.title}! Start mock interviews.`,
        orderIndex: 1,
        type: 'APPLY',
        status: 'PENDING',
      });
    }

    // 3. Persist Roadmap
    const roadmap = await roadmapRepository.createRoadmap({
      title: `${careerPath.title} Roadmap`,
      profile: { connect: { id: profile.id } },
      careerPath: { connect: { id: careerPathId } },
      steps: {
        create: stepsToCreate,
      },
    });

    return roadmap;
  }

  async getUserRoadmaps(userId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    return roadmapRepository.getUserRoadmaps(profile.id);
  }

  async getRoadmapDetails(roadmapId: string) {
    const roadmap = await roadmapRepository.getRoadmap(roadmapId);
    if (!roadmap) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Roadmap not found');
    return roadmap;
  }

  async updateStep(roadmapId: string, stepId: string, status: string) {
    const roadmap = await roadmapRepository.getRoadmap(roadmapId);
    if (!roadmap) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Roadmap not found');

    const step = roadmap.steps.find(s => s.id === stepId);
    if (!step) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Step not found in this roadmap');

    await roadmapRepository.updateStepStatus(stepId, status);

    // Recalculate roadmap completion
    const updatedRoadmap = await roadmapRepository.getRoadmap(roadmapId);
    const totalSteps = updatedRoadmap!.steps.length;
    const completedSteps = updatedRoadmap!.steps.filter(s => s.status === 'COMPLETED').length;
    
    const completionPercentage = totalSteps === 0 ? 100 : (completedSteps / totalSteps) * 100;
    const roadmapStatus = completionPercentage === 100 ? 'COMPLETED' : 'ACTIVE';

    await roadmapRepository.updateRoadmapCompletion(roadmapId, completionPercentage, roadmapStatus);

    return roadmapRepository.getRoadmap(roadmapId);
  }

  async deleteRoadmap(userId: string, roadmapId: string) {
    const profile = await prisma.studentProfile.findUnique({ where: { userId } });
    if (!profile) throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');

    await prisma.roadmap.delete({
      where: { id: roadmapId, profileId: profile.id }
    });
    return true;
  }
}

export const roadmapService = new RoadmapService();
