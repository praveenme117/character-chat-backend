import { z } from 'zod';

export const createSessionSchema = z.object({
  avatarId: z.number().int().positive(),
  userData: z.object({
    name: z.string().min(1).max(100),
    city: z.string().max(100).optional(),
  }),
});

export type CreateSessionRequest = z.infer<typeof createSessionSchema>;


