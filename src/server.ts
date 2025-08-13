import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { disconnectPrisma } from './lib/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`Backend running on http://localhost:${env.PORT}`);
});

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully`);
  server.close(async () => {
    logger.info('HTTP server closed');
    try {
      await disconnectPrisma();
      logger.info('Database connection closed');
    } catch (error) {
      logger.error('Error closing database connection', error);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Force shutdown due to timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, server };
