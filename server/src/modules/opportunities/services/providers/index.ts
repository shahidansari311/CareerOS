import { IJobProvider, NormalizedJob } from './types';
import { AdzunaProvider } from './adzuna.provider';
import { RemotiveProvider } from './remotive.provider';
import { ArbeitnowProvider } from './arbeitnow.provider';
import { logger } from '@/config/logger';

export class JobAggregator {
  private providers: IJobProvider[] = [
    new AdzunaProvider(),
    new RemotiveProvider(),
    new ArbeitnowProvider()
  ];

  async fetchAllJobs(): Promise<NormalizedJob[]> {
    logger.info('Starting job aggregation from providers...');
    
    // Fetch from all providers concurrently
    const results = await Promise.allSettled(
      this.providers.map(provider => provider.fetchJobs())
    );

    const allJobs: NormalizedJob[] = [];
    
    results.forEach((result, index) => {
      const providerName = this.providers[index].name;
      if (result.status === 'fulfilled') {
        allJobs.push(...result.value);
        logger.info(`Fetched ${result.value.length} jobs from ${providerName}`);
      } else {
        logger.error({ err: result.reason }, `Provider ${providerName} failed`);
      }
    });

    logger.info(`Total jobs aggregated: ${allJobs.length}`);
    return allJobs;
  }
}

export const jobAggregator = new JobAggregator();
