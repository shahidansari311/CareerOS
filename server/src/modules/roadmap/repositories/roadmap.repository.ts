import { prisma } from '@/config/database';
import { Prisma } from '@prisma/client';

export class RoadmapRepository {
  
  async createRoadmap(data: Prisma.RoadmapCreateInput) {
    return prisma.roadmap.create({
      data,
      include: { steps: true },
    });
  }

  async getRoadmap(roadmapId: string) {
    return prisma.roadmap.findUnique({
      where: { id: roadmapId },
      include: {
        steps: {
          orderBy: { orderIndex: 'asc' },
        },
        careerPath: true,
        profile: true,
      },
    });
  }

  async getUserRoadmaps(profileId: string) {
    return prisma.roadmap.findMany({
      where: { profileId },
      include: { careerPath: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStepStatus(stepId: string, status: string) {
    return prisma.roadmapStep.update({
      where: { id: stepId },
      data: { status },
    });
  }

  async updateRoadmapCompletion(roadmapId: string, completion: number, status: string) {
    return prisma.roadmap.update({
      where: { id: roadmapId },
      data: { completion, status },
    });
  }
}

export const roadmapRepository = new RoadmapRepository();
