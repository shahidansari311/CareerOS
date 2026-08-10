import { app } from './app';
import { env } from '@/config/env';
import { logger } from '@/config/logger';
import { setupGracefulShutdown } from './shutdown';
import { startOpportunitySyncScheduler } from '@/schedulers/opportunity-sync.scheduler';

const startServer = () => {
  const server = app.listen(env.PORT, () => {
    logger.info(`🚀 CareerOS Backend is running on http://localhost:${env.PORT}`);
    logger.info(`Environment: ${env.NODE_ENV}`);
    
    // Start background jobs
    startOpportunitySyncScheduler();
  });

  // Attach graceful shutdown handlers
  setupGracefulShutdown(server);
};

startServer();
