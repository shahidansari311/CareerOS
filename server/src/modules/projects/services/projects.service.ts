import { prisma } from '@/config/database';
import { AppError } from '@/common/errors/AppError';
import { ErrorCodes } from '@/common/errors/ErrorCodes';

export class ProjectsService {
  async getUserProjects(userId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    return prisma.project.findMany({
      where: { profileId: profile.id },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createProject(userId: string, data: any) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    // Dynamic ATS Match Score Calculation based on user's skills
    const userSkills = await prisma.userSkill.findMany({
      where: { profileId: profile.id },
      include: { skill: true },
    });
    const userSkillNames = new Set(userSkills.map(us => us.skill.name.toLowerCase()));
    
    let matches = 0;
    const techArray = data.tech || [];
    techArray.forEach((t: string) => {
      if (userSkillNames.has(t.toLowerCase().trim())) {
        matches++;
      }
    });

    const matchScore = techArray.length > 0 
      ? Math.min(100, Math.round(65 + (matches / techArray.length) * 30)) 
      : 60;

    return prisma.project.create({
      data: {
        profileId: profile.id,
        title: data.title,
        description: data.description,
        tech: techArray,
        githubUrl: data.githubUrl || null,
        liveUrl: data.liveUrl || null,
        matchScore: data.matchScore ?? matchScore,
      },
    });
  }

  async deleteProject(userId: string, projectId: string) {
    const profile = await prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (!profile) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Profile not found');
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      throw new AppError(404, ErrorCodes.RESOURCE_NOT_FOUND, 'Project not found');
    }

    if (project.profileId !== profile.id) {
      throw new AppError(403, ErrorCodes.FORBIDDEN, 'Not authorized to delete this project');
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    return { id: projectId };
  }
}

export const projectsService = new ProjectsService();
