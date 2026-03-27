import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { getConfig } from '@voxhire/config';

/**
 * Redis service for Interview Orchestrator.
 * Stores live interview state for fast access during active sessions.
 */
@Injectable()
export class InterviewRedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    const config = getConfig();
    this.client = new Redis(config.REDIS_URL);
  }

  /** Store live interview state (current question, scores, timer) */
  async setInterviewState(sessionId: string, state: InterviewState): Promise<void> {
    await this.client.set(
      `interview:${sessionId}`,
      JSON.stringify(state),
      'EX',
      7200, // 2 hour TTL for active sessions
    );
  }

  /** Get live interview state */
  async getInterviewState(sessionId: string): Promise<InterviewState | null> {
    const data = await this.client.get(`interview:${sessionId}`);
    return data ? JSON.parse(data) : null;
  }

  /** Remove interview state when session ends */
  async clearInterviewState(sessionId: string): Promise<void> {
    await this.client.del(`interview:${sessionId}`);
  }

  /** Publish interview event (question delivered, answer received, etc.) */
  async publishEvent(sessionId: string, event: string, data: unknown): Promise<void> {
    await this.client.publish(`interview:events:${sessionId}`, JSON.stringify({ event, data }));
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}

export interface InterviewState {
  sessionId: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  scores: number[];
  weakAreas: string[];
  previousQuestions: string[];
  mode: string;
  role: string;
  difficulty: string;
  startedAt: string;
  timerEndAt?: string; // For rapid fire mode
}
