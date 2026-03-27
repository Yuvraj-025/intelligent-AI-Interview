import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getConfig } from '@voxhire/config';

/**
 * Redis cache for generated TTS audio.
 * Avoids re-generating audio for repeated/similar questions.
 */
@Injectable()
export class VoiceCacheService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    const config = getConfig();
    this.client = new Redis(config.REDIS_URL);
  }

  /** Cache TTS audio as base64 string with 1-hour TTL */
  async cacheTtsAudio(textHash: string, audioBase64: string): Promise<void> {
    await this.client.set(`tts:${textHash}`, audioBase64, 'EX', 3600);
  }

  /** Get cached TTS audio */
  async getCachedTtsAudio(textHash: string): Promise<string | null> {
    return this.client.get(`tts:${textHash}`);
  }

  /** Simple hash function for cache keys */
  hashText(text: string): string {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return Math.abs(hash).toString(36);
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
