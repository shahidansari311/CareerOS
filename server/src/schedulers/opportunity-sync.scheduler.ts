import { logger } from '@/config/logger';
import { prisma } from '@/config/database';
import { jobAggregator } from '@/modules/opportunities/services/providers';

// Run every 6 hours
const SYNC_INTERVAL = 6 * 60 * 60 * 1000;

async function extractSkills(description: string): Promise<string[]> {
  const allSkills = await prisma.skill.findMany();
  const descLower = description.toLowerCase();
  
  const foundSkillIds: string[] = [];
  for (const skill of allSkills) {
    const skillLower = skill.name.toLowerCase();
    // Simple whole-word matching
    const regex = new RegExp(`\\b${skillLower.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\b`, 'i');
    if (regex.test(descLower)) {
      foundSkillIds.push(skill.id);
    }
  }
  return foundSkillIds;
}

export async function runOpportunitySync() {
  logger.info('Starting opportunity sync job (In-Memory Scheduler)');
  
  try {
    const externalJobs = await jobAggregator.fetchAllJobs();
    
    for (const externalJob of externalJobs) {
      if (!externalJob.externalId) continue;

      const opp = await prisma.opportunity.upsert({
        where: {
          source_externalId: {
            source: externalJob.source,
            externalId: externalJob.externalId
          }
        },
        update: {
          title: externalJob.title,
          company: externalJob.company,
          location: externalJob.location,
          type: externalJob.type,
          remote: externalJob.remote,
          salaryMin: externalJob.salaryMin,
          salaryMax: externalJob.salaryMax,
          salaryCurrency: externalJob.salaryCurrency,
          description: externalJob.description,
          url: externalJob.url,
          publishedAt: externalJob.publishedAt,
          companyLogo: externalJob.companyLogo,
          isActive: externalJob.isActive
        },
        create: {
          title: externalJob.title,
          company: externalJob.company,
          location: externalJob.location,
          type: externalJob.type,
          remote: externalJob.remote,
          salaryMin: externalJob.salaryMin,
          salaryMax: externalJob.salaryMax,
          salaryCurrency: externalJob.salaryCurrency,
          description: externalJob.description,
          url: externalJob.url,
          publishedAt: externalJob.publishedAt,
          companyLogo: externalJob.companyLogo,
          source: externalJob.source,
          externalId: externalJob.externalId,
          isActive: externalJob.isActive
        }
      });

      const skillIds = await extractSkills(externalJob.description);
      
      for (const skillId of skillIds) {
        const existing = await prisma.opportunityRequirement.findUnique({
          where: {
            opportunityId_skillId: {
              opportunityId: opp.id,
              skillId: skillId
            }
          }
        });

        if (!existing) {
          await prisma.opportunityRequirement.create({
            data: {
              opportunityId: opp.id,
              skillId: skillId,
              targetLevel: 3
            }
          });
        }
      }
    }

    logger.info(`Opportunity sync completed. Processed ${externalJobs.length} jobs.`);
  } catch (error) {
    logger.error({ err: error }, `Opportunity sync job failed`);
  }
}

export function startOpportunitySyncScheduler() {
  // Run once immediately (non-blocking, wait 5 seconds for server to start up fully)
  setTimeout(() => {
    runOpportunitySync().catch(err => logger.error({ err }, 'Initial sync failed'));
  }, 5000);
  
  setInterval(() => {
    runOpportunitySync().catch(err => logger.error({ err }, 'Scheduled sync failed'));
  }, SYNC_INTERVAL);
}
