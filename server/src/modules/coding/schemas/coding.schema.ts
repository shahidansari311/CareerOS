import { z } from 'zod';

export const connectCodingProfileSchema = z.object({
  body: z.object({
    platform: z.enum(['LEETCODE', 'HACKERRANK', 'CODECHEF', 'CODEFORCES', 'GITHUB', 'GEEKSFORGEEKS']),
    username: z.string().min(1, 'Username is required').max(100),
  }),
});
