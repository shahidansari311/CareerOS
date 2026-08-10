import { z } from 'zod';

export const applySchema = z.object({
  body: z.object({
    resumeUrl: z.string().url().optional(),
  }),
});

export const updateApplicationStatusSchema = z.object({
  body: z.object({
    status: z.enum(['APPLIED', 'INTERVIEWING', 'OFFER', 'REJECTED']),
    note: z.string().optional(),
  }),
});
