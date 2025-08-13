import crypto from 'crypto';
import { logger } from '../lib/logger';
import { prisma } from '../lib/prisma';
import { CreateSessionRequest } from '../schemas/session';

export class SessionService {
  async createSession(data: CreateSessionRequest) {
    const { avatarId, userData } = data;

    const userInfo = {
      name: userData.name || 'User',
      city: userData.city || 'Unknown',
    };

    try {
      let user = await prisma.user.findFirst({ where: { name: userInfo.name } });
      if (!user) {
        user = await prisma.user.create({
          data: { id: crypto.randomUUID(), name: userInfo.name, city: userInfo.city },
        });
      }

      const conversation = await prisma.conversation.create({
        data: {
          avatarId,
          userId: user.id,
          messages: { create: [] },
        },
        select: { id: true },
      });

      logger.info('Successfully created conversation', { conversationId: conversation.id, userName: userInfo.name });
      return { sessionId: conversation.id, userData: userInfo };
    } catch (error: any) {
      logger.error('Database error creating session', error?.message || error);
      const tempSessionId = crypto.randomUUID();
      logger.info('Created temporary session ID', { sessionId: tempSessionId });
      return { sessionId: tempSessionId, userData: userInfo, temporary: true as const };
    }
  }
}

export const sessionService = new SessionService();


