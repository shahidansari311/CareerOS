import { z } from 'zod';

// Step 1: Personal Info
export const personalInfoSchema = z.object({
  body: z.object({
    college: z.string().min(2),
    branch: z.string().min(2),
    graduationYear: z.number().int().min(2000).max(2100),
    currentYear: z.number().int().min(1).max(5),
    semester: z.number().int().min(1).max(10),
    location: z.string().min(2),
  }),
});

// Step 2: Education
export const educationSchema = z.object({
  body: z.object({
    institutionName: z.string().min(2),
    degree: z.string().min(2),
    fieldOfStudy: z.string().min(2),
    startDate: z.string().datetime(),
    cgpa: z.number().min(0).max(10).optional(),
  }),
});

// Step 3: Career Goals & Interests
export const careerSchema = z.object({
  body: z.object({
    goalTitle: z.string().min(2), // e.g., "Become a Backend Engineer"
    targetIndustry: z.string().min(2),
    targetRole: z.string().min(2),
  }),
});

// Step 4: Skills (Mock for now until Phase 5)
export const skillsSchema = z.object({
  body: z.object({
    skills: z.array(z.string()).min(1),
  }),
});

// Step 5: Coding Platforms & GitHub (Mock for now until Phase 6)
export const codingSchema = z.object({
  body: z.object({
    githubUsername: z.string().optional(),
    leetcodeUsername: z.string().optional(),
  }),
});
