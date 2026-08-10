import { z } from 'zod';

export const evaluateSkillSchema = z.object({
  body: z.object({
    skillId: z.string().uuid(),
    currentLevel: z.number().int().min(1).max(10),
    confidence: z.number().int().min(1).max(10).optional().default(5),
    evidence: z.string().url().optional(),
  }),
});

export const getSkillGapsSchema = z.object({
  query: z.object({
    careerPathId: z.string().uuid(),
  }),
});
