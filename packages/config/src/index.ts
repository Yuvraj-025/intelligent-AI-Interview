import { z } from 'zod';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// ─── Schema ────────────────────────────────────────

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Database
  DATABASE_URL: z.string().url().default('postgresql://voxhire:voxhire_secret@localhost:5432/voxhire_db'),

  // Redis
  REDIS_URL: z.string().default('redis://localhost:6379'),

  // Auth
  JWT_SECRET: z.string().min(8).default('dev-secret-change-in-production'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // AI
  GEMINI_API_KEY: z.string().default(''),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().default(''),
  GOOGLE_CLIENT_SECRET: z.string().default(''),

  // Service Ports
  API_GATEWAY_PORT: z.coerce.number().default(4000),
  AUTH_SERVICE_PORT: z.coerce.number().default(4001),
  INTERVIEW_SERVICE_PORT: z.coerce.number().default(4002),
  VOICE_SERVICE_PORT: z.coerce.number().default(4003),
  SCORING_SERVICE_PORT: z.coerce.number().default(4004),
  ANALYTICS_SERVICE_PORT: z.coerce.number().default(4005),
  STORAGE_SERVICE_PORT: z.coerce.number().default(4006),

  // Frontend
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:4000/api'),

  // Storage
  STORAGE_PATH: z.string().default('./storage'),
});

// ─── Parsed Config ─────────────────────────────────

export type EnvConfig = z.infer<typeof envSchema>;

let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!_config) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) {
      console.error('❌ Invalid environment variables:', result.error.format());
      throw new Error('Invalid environment configuration');
    }
    _config = result.data;
  }
  return _config;
}

export function getServiceUrl(serviceName: string): string {
  const config = getConfig();
  const portMap: Record<string, number> = {
    'api-gateway': config.API_GATEWAY_PORT,
    'auth-service': config.AUTH_SERVICE_PORT,
    'interview-service': config.INTERVIEW_SERVICE_PORT,
    'voice-service': config.VOICE_SERVICE_PORT,
    'scoring-service': config.SCORING_SERVICE_PORT,
    'analytics-service': config.ANALYTICS_SERVICE_PORT,
    'storage-service': config.STORAGE_SERVICE_PORT,
  };
  const port = portMap[serviceName];
  if (!port) throw new Error(`Unknown service: ${serviceName}`);
  return `http://localhost:${port}`;
}

export default getConfig;
