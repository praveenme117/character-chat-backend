import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { openaiClient } from '../lib/openai';
import { chatStreamQuerySchema } from '../schemas/chat';
import { chatStream } from '../services/chatService';

export class ChatController {
  async streamChat(req: Request, res: Response, next: NextFunction) {
    try {
      const raw = req.query as Record<string, any>;
      // Backward-compatible alias if some clients use ?id=
      const input = { ...raw, conversationId: raw.conversationId ?? raw.id };
      const query = chatStreamQuerySchema.parse(input);

      logger.info('Starting chat stream', { conversationId: query.conversationId, lang: query.lang });

      const decodedMessage = decodeURIComponent(query.message);
      const decodedUserData = decodeURIComponent(query.userData);

      await chatStream(req, res, openaiClient, query.conversationId, decodedMessage, decodedUserData, query.lang);
    } catch (error) {
      logger.error('Failed to start chat stream', error);
      return next(error);
    }
  }
}

export const chatController = new ChatController();


