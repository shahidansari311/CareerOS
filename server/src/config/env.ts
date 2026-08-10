import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Define the schema for environment variables
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('3000').transform((val) => parseInt(val, 10)),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid PostgreSQL connection string"),
  JWT_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CALLBACK_URL: z.string().url().optional(),
  GEMINI_API_KEY: z.string().min(1, 'GEMINI_API_KEY is required for Phase 7'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  
  // Job Aggregator Providers
  ADZUNA_APP_ID: z.string().optional(),
  ADZUNA_APP_KEY: z.string().optional(),
  ADZUNA_COUNTRY: z.string().default('us'),
  REMOTIVE_API_URL: z.string().url().default('https://remotive.com/api/remote-jobs'),
  ARBEITNOW_API_URL: z.string().url().default('https://www.arbeitnow.com/api/job-board-api'),
  JOB_REQUEST_TIMEOUT: z.string().default('10000').transform((val) => parseInt(val, 10)),
});

// Validate the environment variables
const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:');
  console.error(_env.error.format());
  process.exit(1);
}

export const env = _env.data;
