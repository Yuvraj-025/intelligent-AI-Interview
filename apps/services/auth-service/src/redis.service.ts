import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getConfig } from '@voxhire/config';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    const config = getConfig();
    this.client = new Redis(config.REDIS_URL);
    this.client.on('error', (err) => console.error('Redis error:', err));
    this.client.on('connect', () => console.log('✅ Redis connected'));
  }

  /** Cache user session data after login to avoid DB lookups */
  async cacheUserSession(userId: string, data: Record<string, unknown>, ttlSeconds = 3600): Promise<void> {
    await this.client.set(`session:${userId}`, JSON.stringify(data), 'EX', ttlSeconds);
  }

  /** Get cached user session */
  async getCachedSession(userId: string): Promise<Record<string, unknown> | null> {
    const data = await this.client.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  /** Invalidate session on logout */
  async invalidateSession(userId: string): Promise<void> {
    await this.client.del(`session:${userId}`);
  }

  /** Store JWT blacklist (for token invalidation) */
  async blacklistToken(token: string, ttlSeconds = 604800): Promise<void> {
    await this.client.set(`blacklist:${token}`, '1', 'EX', ttlSeconds);
  }

  /** Check if token is blacklisted */
  async isTokenBlacklisted(token: string): Promise<boolean> {
    const result = await this.client.get(`blacklist:${token}`);
    return result !== null;
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
