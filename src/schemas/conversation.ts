import { z } from 'zod';

export const messageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1),
});

export const updateMessagesSchema = z.object({
  messages: z.array(messageSchema),
});

export type Message = z.infer<typeof messageSchema>;
export type UpdateMessagesRequest = z.infer<typeof updateMessagesSchema>;


