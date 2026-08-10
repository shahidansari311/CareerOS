import { z } from 'zod';

export const createProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2, 'Title must be at least 2 characters'),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    tech: z.array(z.string()).min(1, 'At least one technology is required'),
    githubUrl: z.string().url('Invalid GitHub URL').optional().nullable().or(z.literal('')),
    liveUrl: z.string().url('Invalid Live Demo URL').optional().nullable().or(z.literal('')),
    matchScore: z.number().int().min(0).max(100).optional(),
  }),
});

export const updateProjectSchema = z.object({
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().min(5).optional(),
    tech: z.array(z.string()).optional(),
    githubUrl: z.string().url().optional().nullable().or(z.literal('')),
    liveUrl: z.string().url().optional().nullable().or(z.literal('')),
    matchScore: z.number().int().min(0).max(100).optional(),
  }),
});
