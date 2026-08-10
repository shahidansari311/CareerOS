import { z } from 'zod';

export const updateProfileSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).optional(),
    lastName: z.string().min(2).optional(),
    college: z.string().optional().nullable(),
    branch: z.string().optional().nullable(),
    graduationYear: z.number().int().min(2000).max(2100).optional().nullable(),
    currentYear: z.number().int().min(1).max(5).optional().nullable(),
    semester: z.number().int().min(1).max(10).optional().nullable(),
    cgpa: z.number().min(0).max(10).optional().nullable(),
    location: z.string().optional().nullable(),
    headline: z.string().optional().nullable(),
    bio: z.string().optional().nullable(),
    currentStatus: z.string().optional().nullable(),
    avatarUrl: z.string().optional().nullable(),
    resumeUrl: z.string().optional().nullable(),
  }),
});

export const addEducationSchema = z.object({
  body: z.object({
    institutionName: z.string().min(2),
    degree: z.string().min(2),
    fieldOfStudy: z.string().min(2),
    startDate: z.string().datetime(),
    endDate: z.string().datetime().optional(),
    current: z.boolean().default(false),
    grade: z.string().optional(),
  }),
});

export const updateCareerGoalsSchema = z.object({
  body: z.object({
    goals: z.array(
      z.object({
        title: z.string().min(2),
        targetDate: z.string().datetime().optional(),
        status: z.enum(['ACTIVE', 'ACHIEVED', 'ABANDONED']).default('ACTIVE'),
      })
    ),
  }),
});

export const updateCareerInterestsSchema = z.object({
  body: z.object({
    interests: z.array(
      z.object({
        industry: z.string().min(2),
        role: z.string().min(2),
      })
    ),
  }),
});
