import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { updateMessagesSchema } from '../schemas/conversation';
import { conversationService } from '../services/conversationService';

export class ConversationController {
  async getConversation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      logger.info('Fetching conversation', { conversationId: id });
      const result = await conversationService.getConversation(id);
      return res.json(result);
    } catch (error) {
      logger.error('Failed to fetch conversation', error);
      return next(error);
    }
  }

  async updateMessages(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payload = updateMessagesSchema.parse(req.body);
      await conversationService.updateMessages(id, payload.messages);
      return res.json({ success: true });
    } catch (error) {
      logger.error('Failed to update conversation messages', error);
      return next(error);
    }
  }
}

export const conversationController = new ConversationController();


