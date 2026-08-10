import { z } from 'zod';

export const generateRoadmapSchema = z.object({
  body: z.object({
    careerPathId: z.string().uuid(),
  }),
});

export const updateRoadmapStepSchema = z.object({
  body: z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  }),
});

export const createCustomCareerPathSchema = z.object({
  body: z.object({
    title: z.string().min(2).max(100),
    description: z.string().optional(),
    industry: z.string().min(2).max(100),
    skills: z.array(
      z.object({
        skillId: z.string().uuid(),
        targetLevel: z.number().int().min(1).max(10),
      })
    ).min(1, 'At least one skill requirement is required'),
  }),
});

