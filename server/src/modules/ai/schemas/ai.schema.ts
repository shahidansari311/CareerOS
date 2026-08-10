import { z } from 'zod';

export const chatSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid().optional(),
    message: z.string().min(1).max(2000),
  }),
});

export const documentChatSchema = z.object({
  body: z.object({
    message: z.string().min(1).max(2000),
  }),
});
