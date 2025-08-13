import express from 'express';
import corsMiddleware from './middleware/cors';

import errorHandler from './middleware/errorHandler';
import chatRouter from './routes/chat';
import conversationRouter from './routes/conversations';
import healthRouter from './routes/healthRouter';
import sessionRouter from './routes/session';

export const createApp = () => {
  const app = express();

  // Middleware (same behavior as before)
  app.use(corsMiddleware);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Routes (unchanged)
  app.use('/', healthRouter);
  app.use('/api/session', sessionRouter);
  app.use('/api/conversations', conversationRouter);
  app.use('/api/chat', chatRouter);

  // Global error handler (unchanged)
  app.use(errorHandler);

  return app;
};
