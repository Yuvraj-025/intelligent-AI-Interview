import { Injectable } from '@nestjs/common';
import { GeminiProvider } from '@voxhire/ai-provider';
import { prisma } from '@voxhire/db';
import { getConfig } from '@voxhire/config';

@Injectable()
export class ReportGeneratorService {
  private aiProvider: GeminiProvider;

  constructor() {
    const config = getConfig();
    this.aiProvider = new GeminiProvider(config.GEMINI_API_KEY);
  }

  /** Generate and store a final report for a completed session */
  async generateReport(sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        responses: { include: { score: true } },
        weaknessTags: true,
      },
    });

    if (!session) throw new Error('Session not found');

    // Build question-answer pairs with scores
    const questionData = session.questions.map((q) => {
      const response = session.responses.find((r) => r.questionId === q.id);
      return {
        question: q.questionText,
        answer: response?.transcript || 'No answer provided',
        topic: q.topic,
        score: response?.score?.finalScore || 0,
      };
    });

    const weaknesses = session.weaknessTags.map((w) => `${w.topic}: ${w.weaknessType}`);

    // Generate report via AI
    const report = await this.aiProvider.generateReport({
      role: session.role,
      mode: session.mode,
      questions: questionData,
      overallWeaknesses: weaknesses,
    });

    // Save weakness tags
    const detectedWeaknesses = report.weaknesses || [];
    for (const weakness of detectedWeaknesses) {
      await prisma.weaknessTag.create({
        data: {
          sessionId,
          topic: weakness,
          weaknessType: 'ai_detected',
          severity: 'medium',
        },
      });
    }

    // Save final report
    const finalReport = await prisma.finalReport.upsert({
      where: { sessionId },
      create: {
        sessionId,
        strengthsSummary: report.strengths.join('\n'),
        weaknessSummary: report.weaknesses.join('\n'),
        improvementSuggestions: report.improvementSuggestions.join('\n'),
        reportJson: report as any,
      },
      update: {
        strengthsSummary: report.strengths.join('\n'),
        weaknessSummary: report.weaknesses.join('\n'),
        improvementSuggestions: report.improvementSuggestions.join('\n'),
        reportJson: report as any,
      },
    });

    // Update session overall score
    await prisma.interviewSession.update({
      where: { id: sessionId },
      data: { overallScore: report.overallScore },
    });

    return { report, finalReport };
  }
}
