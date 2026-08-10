import { z } from 'zod';

export const sendConnectionSchema = z.object({
  body: z.object({
    recipientId: z.string().uuid(),
  }),
});

export const updateConnectionSchema = z.object({
  body: z.object({
    status: z.enum(['ACCEPTED', 'REJECTED']),
  }),
});

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});
