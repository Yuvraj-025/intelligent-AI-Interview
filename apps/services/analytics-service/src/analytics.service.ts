import { Injectable } from '@nestjs/common';
import { prisma } from '@voxhire/db';

@Injectable()
export class AnalyticsService {
  /** Get user session history */
  async getUserSessions(userId: string) {
    return prisma.interviewSession.findMany({
      where: { userId },
      orderBy: { startedAt: 'desc' },
      select: {
        id: true,
        mode: true,
        role: true,
        difficulty: true,
        startedAt: true,
        endedAt: true,
        overallScore: true,
        status: true,
      },
    });
  }

  /** Get detailed session analytics */
  async getSessionAnalytics(sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        responses: { include: { score: true } },
        weaknessTags: true,
        finalReport: true,
      },
    });

    if (!session) return null;

    // Topic breakdown
    const topicScores: Record<string, { total: number; count: number }> = {};
    for (const response of session.responses) {
      const question = session.questions.find((q) => q.id === response.questionId);
      if (question && response.score) {
        const topic = question.topic;
        if (!topicScores[topic]) topicScores[topic] = { total: 0, count: 0 };
        topicScores[topic].total += response.score.finalScore;
        topicScores[topic].count += 1;
      }
    }

    const topicBreakdown = Object.entries(topicScores).map(([topic, data]) => ({
      topic,
      averageScore: Math.round((data.total / data.count) * 10) / 10,
      questionCount: data.count,
    }));

    return {
      session,
      topicBreakdown,
      totalQuestions: session.questions.length,
      totalAnswered: session.responses.length,
    };
  }
}
