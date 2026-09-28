import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '5001', 10),
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/annsarthi',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'annsarthi_dev_access_secret_super_secure_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'annsarthi_dev_refresh_secret_super_secure_key_2026',
  JWT_ACCESS_EXPIRY: process.env.JWT_ACCESS_EXPIRY || '15m',
  JWT_REFRESH_EXPIRY: process.env.JWT_REFRESH_EXPIRY || '7d',
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000',
  AI_SERVICE_TOKEN: process.env.AI_SERVICE_TOKEN || 'annsarthi_ai_internal_token_secure_2026',
  OSRM_BASE_URL: process.env.OSRM_BASE_URL || 'https://router.project-osrm.org',
  DEMO_MODE: process.env.DEMO_MODE === 'true' || true, // default demo mode enabled for instant evaluation
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'mock',
  LLM_API_KEY: process.env.LLM_API_KEY || '',
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.resolve(__dirname, '../../uploads'),
};
