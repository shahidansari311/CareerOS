import { z } from 'zod';

export const syncGithubSchema = z.object({
  body: z.object({
    username: z.string().min(1, 'GitHub username is required'),
  }),
});
