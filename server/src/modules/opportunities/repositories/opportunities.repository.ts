import { prisma } from '@/config/database';

export class OpportunitiesRepository {
  
  async getActiveOpportunities() {
    return prisma.opportunity.findMany({
      where: { isActive: true },
      include: {
        requirements: {
          include: { skill: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOpportunity(id: string) {
    return prisma.opportunity.findUnique({
      where: { id },
      include: {
        requirements: {
          include: { skill: true }
        }
      }
    });
  }

  async createApplication(profileId: string, opportunityId: string, resumeUrl?: string) {
    return prisma.application.create({
      data: {
        profileId,
        opportunityId,
        resumeUrl,
        events: {
          create: {
            status: 'APPLIED',
            note: 'Initial application submitted',
          }
        }
      },
      include: { events: true }
    });
  }

  async getUserApplications(profileId: string) {
    return prisma.application.findMany({
      where: { profileId },
      include: {
        opportunity: true,
        events: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async updateApplicationStatus(applicationId: string, status: string, note?: string) {
    return prisma.application.update({
      where: { id: applicationId },
      data: {
        status,
        events: {
          create: {
            status,
            note
          }
        }
      },
      include: { events: { orderBy: { createdAt: 'desc' } } }
    });
  }
}

export const opportunitiesRepo = new OpportunitiesRepository();
