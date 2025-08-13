import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger';
import { createSessionSchema } from '../schemas/session';
import { sessionService } from '../services/sessionService';

export class SessionController {
  async createSession(req: Request, res: Response, next: NextFunction) {
    try {
      logger.info('Session creation request', { body: req.body });
      const payload = createSessionSchema.parse(req.body);
      const result = await sessionService.createSession(payload);
      return res.json(result);
    } catch (error) {
      logger.error('Failed to create session', error);
      return next(error);
    }
  }
}

export const sessionController = new SessionController();


