import { z } from 'zod';

export const chatStreamQuerySchema = z.object({
  conversationId: z.string().uuid(),
  message: z.string().min(1).max(2000),
  userData: z.string(), // URL-encoded JSON string from client; parse later where needed
  lang: z.enum(['en', 'ja']).optional().default('en'),
});

export type ChatStreamQuery = z.infer<typeof chatStreamQuerySchema>;


