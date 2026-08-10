export interface NormalizedJob {
  externalId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location?: string;
  type: string; // e.g. "FULL_TIME", "INTERNSHIP", "CONTRACT"
  remote: boolean;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  description: string;
  url?: string;
  publishedAt?: Date;
  isActive: boolean;
  source: string;
}

export interface IJobProvider {
  name: string;
  fetchJobs(): Promise<NormalizedJob[]>;
}
