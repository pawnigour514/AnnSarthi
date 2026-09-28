import mongoose from 'mongoose';
import { config } from './env.js';
import { logger } from '../utils/logger.js';

let mongodInstance = null;

export async function connectDB() {
  try {
    mongoose.set('strictQuery', true);
    
    // Attempt connecting to the configured MongoDB URI
    logger.info(`Connecting to MongoDB at: ${config.MONGODB_URI}`);
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    logger.info('Connected to MongoDB successfully');
  } catch (primaryErr) {
    logger.warn(`Could not connect to external MongoDB: ${primaryErr.message}`);
    
    if (config.NODE_ENV === 'development' || config.DEMO_MODE) {
      try {
        logger.info('Starting fallback MongoMemoryServer for development / evaluation...');
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        const memoryUri = mongodInstance.getUri();
        logger.info(`MongoMemoryServer running at: ${memoryUri}`);
        await mongoose.connect(memoryUri);
        logger.info('Connected to MongoMemoryServer successfully');
      } catch (memErr) {
        logger.error(`Failed to launch MongoMemoryServer: ${memErr.message}`);
        throw primaryErr;
      }
    } else {
      throw primaryErr;
    }
  }

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

export async function disconnectDB() {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
  }
}
