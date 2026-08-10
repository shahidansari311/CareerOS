import { Server } from 'http';
import { logger } from '@/config/logger';

type CleanupFunction = () => Promise<void> | void;

const cleanupQueue: CleanupFunction[] = [];

/**
 * Register a cleanup function to be called on shutdown.
 */
export const registerCleanup = (fn: CleanupFunction) => {
  cleanupQueue.push(fn);
};

export const setupGracefulShutdown = (server: Server) => {
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    // 1. Stop accepting new HTTP connections
    server.close(() => {
      logger.info('HTTP server closed.');
    });

    try {
      // 2. Run all registered cleanup functions (DB, Redis, workers, etc.)
      logger.info(`Running ${cleanupQueue.length} cleanup tasks...`);
      await Promise.allSettled(cleanupQueue.map((fn) => fn()));
      
      logger.info('Graceful shutdown completed successfully.');
      process.exit(0);
    } catch (error) {
      logger.error({ err: error }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  // Handle termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught exceptions and rejections
  process.on('uncaughtException', (error) => {
    logger.fatal({ err: error }, 'Uncaught Exception');
    shutdown('uncaughtException');
  });

  process.on('unhandledRejection', (reason) => {
    logger.fatal({ err: reason }, 'Unhandled Rejection');
    shutdown('unhandledRejection');
  });
};
