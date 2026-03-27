import { Injectable } from '@nestjs/common';
import { GeminiProvider } from '@voxhire/ai-provider';
import { prisma } from '@voxhire/db';
import { getConfig } from '@voxhire/config';
import type { Difficulty } from '@voxhire/shared-types';

@Injectable()
export class ScoringService {
  private aiProvider: GeminiProvider;

  constructor() {
    const config = getConfig();
    this.aiProvider = new GeminiProvider(config.GEMINI_API_KEY);
  }

  /** Evaluate a single response */
  async evaluateResponse(params: {
    question: string;
    answer: string;
    role: string;
    topic: string;
    difficulty: Difficulty;
  }) {
    return this.aiProvider.evaluateAnswer(params);
  }

  /** Get all scores for a session */
  async getSessionScores(sessionId: string) {
    const responses = await prisma.response.findMany({
      where: { sessionId },
      include: { score: true, question: true },
      orderBy: { submittedAt: 'asc' },
    });

    return responses.map((r) => ({
      questionId: r.questionId,
      questionText: r.question.questionText,
      topic: r.question.topic,
      transcript: r.transcript,
      score: r.score,
    }));
  }

  /** Compute aggregate statistics for a session */
  async computeAggregates(sessionId: string) {
    const scores = await prisma.score.findMany({
      where: { response: { sessionId } },
    });

    if (scores.length === 0) return null;

    const avg = (field: keyof typeof scores[0]) =>
      scores.reduce((sum, s) => sum + (Number(s[field]) || 0), 0) / scores.length;

    return {
      totalResponses: scores.length,
      averageSemanticScore: Math.round(avg('semanticScore') * 10) / 10,
      averageClarityScore: Math.round(avg('clarityScore') * 10) / 10,
      averageConfidenceScore: Math.round(avg('confidenceScore') * 10) / 10,
      averageHesitationScore: Math.round(avg('hesitationScore') * 10) / 10,
      averageFillerScore: Math.round(avg('fillerScore') * 10) / 10,
      averageFinalScore: Math.round(avg('finalScore') * 10) / 10,
    };
  }
}
