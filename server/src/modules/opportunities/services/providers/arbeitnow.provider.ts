import { IJobProvider, NormalizedJob } from './types';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export class ArbeitnowProvider implements IJobProvider {
  name = 'Arbeitnow';

  async fetchJobs(): Promise<NormalizedJob[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), env.JOB_REQUEST_TIMEOUT);

      // We add page=1 to get the most recent jobs
      const url = `${env.ARBEITNOW_API_URL}?page=1`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Arbeitnow API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalize(data.data || []);
    } catch (error) {
      logger.error({ err: error }, 'Error fetching jobs from Arbeitnow');
      return [];
    }
  }

  private normalize(jobs: any[]): NormalizedJob[] {
    return jobs.map(job => {
      return {
        externalId: String(job.slug),
        title: job.title || 'Unknown Title',
        company: job.company_name || 'Unknown Company',
        location: job.location,
        type: 'FULL_TIME',
        remote: job.remote || false,
        description: job.description || '',
        url: job.url,
        publishedAt: job.created_at ? new Date(job.created_at * 1000) : new Date(), // Arbeitnow uses unix timestamps
        isActive: true,
        source: this.name
      };
    });
  }
}
