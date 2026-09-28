import http from 'http';
import { app } from './app.js';
import { config } from './config/env.js';
import { connectDB } from './config/db.js';
import { initSocketIO } from './sockets/socket.js';
import { logger } from './utils/logger.js';
import { seedDemoDataIfEmpty } from './seed/seed.js';

async function bootstrap() {
  try {
    // 1. Connect to Database (with automated MongoMemoryServer fallback)
    await connectDB();

    // 2. In demo mode, seed database if empty
    if (config.DEMO_MODE) {
      await seedDemoDataIfEmpty();
    }

    // 3. Create HTTP Server
    const httpServer = http.createServer(app);

    // 4. Initialize Socket.IO with CORS
    initSocketIO(httpServer, [config.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173']);

    // 5. Start listening
    httpServer.listen(config.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(` AnnSarthi Server listening on port ${config.PORT}`);
      logger.info(` Health check: http://localhost:${config.PORT}/api/v1/health`);
      logger.info(` Demo Mode: ${config.DEMO_MODE ? 'ENABLED (instant evaluation)' : 'DISABLED'}`);
      logger.info(`=======================================================`);
    });

    const shutdown = async (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      httpServer.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    logger.fatal(`Failed to start server: ${err.message}`);
    process.exit(1);
  }
}

bootstrap();
