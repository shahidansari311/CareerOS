import { IJobProvider, NormalizedJob } from './types';
import { env } from '@/config/env';
import { logger } from '@/config/logger';

export class RemotiveProvider implements IJobProvider {
  name = 'Remotive';

  async fetchJobs(): Promise<NormalizedJob[]> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), env.JOB_REQUEST_TIMEOUT);

      const url = `${env.REMOTIVE_API_URL}?limit=50&category=software-dev`;
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Remotive API error: ${response.statusText}`);
      }

      const data = await response.json();
      return this.normalize(data.jobs || []);
    } catch (error) {
      logger.error({ err: error }, 'Error fetching jobs from Remotive');
      return [];
    }
  }

  private normalize(jobs: any[]): NormalizedJob[] {
    return jobs.map(job => {
      // Parse salary if possible (Remotive sends it as a string sometimes, we'll just ignore parsing for simplicity unless it's structured)
      return {
        externalId: String(job.id),
        title: job.title || 'Unknown Title',
        company: job.company_name || 'Unknown Company',
        companyLogo: job.company_logo,
        location: job.candidate_required_location,
        type: job.job_type === 'contract' ? 'CONTRACT' : 'FULL_TIME',
        remote: true, // Remotive is exclusively remote
        description: job.description || '',
        url: job.url,
        publishedAt: job.publication_date ? new Date(job.publication_date) : new Date(),
        isActive: true,
        source: this.name
      };
    });
  }
}
