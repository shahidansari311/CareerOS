import { IJobProvider, NormalizedJob } from './types';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export class AdzunaProvider implements IJobProvider {
  name = 'Adzuna';

  async fetchJobs(): Promise<NormalizedJob[]> {
    if (!env.ADZUNA_APP_ID || !env.ADZUNA_APP_KEY) {
      logger.warn('Adzuna credentials missing, skipping provider');
      return [];
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), env.JOB_REQUEST_TIMEOUT);

      const url = `https://api.adzuna.com/v1/api/jobs/${env.ADZUNA_COUNTRY}/search/1?app_id=${env.ADZUNA_APP_ID}&app_key=${env.ADZUNA_APP_KEY}&results_per_page=50&category=it-jobs`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Adzuna API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalize(data.results || []);
    } catch (error) {
      logger.error({ err: error }, 'Error fetching jobs from Adzuna');
      return [];
    }
  }

  private normalize(jobs: any[]): NormalizedJob[] {
    return jobs.map(job => {
      const isRemote = job.title?.toLowerCase().includes('remote') || 
                       job.location?.display_name?.toLowerCase().includes('remote') || 
                       false;
      return {
        externalId: String(job.id),
        title: job.title || 'Unknown Title',
        company: job.company?.display_name || 'Unknown Company',
        location: job.location?.display_name,
        type: 'FULL_TIME',
        remote: isRemote,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: 'USD',
        description: job.description || '',
        url: job.redirect_url,
        publishedAt: job.created ? new Date(job.created) : new Date(),
        isActive: true,
        source: this.name
      };
    });
  }
}
