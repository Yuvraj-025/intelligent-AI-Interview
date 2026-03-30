import { Injectable, NotFoundException } from '@nestjs/common';
import { prisma } from '@voxhire/db';
import { GeminiProvider } from '@voxhire/ai-provider';
import { getConfig } from '@voxhire/config';
import { InterviewRedisService, type InterviewState } from './interview-redis.service';
import type { CreateSessionDto, Difficulty } from '@voxhire/shared-types';

@Injectable()
export class InterviewService {
  private aiProvider: GeminiProvider;

  constructor(private readonly redis: InterviewRedisService) {
    const config = getConfig();
    this.aiProvider = new GeminiProvider(config.GEMINI_API_KEY);
  }

  /** Create a new interview session and generate the first question */
  async createSession(userId: string, dto: CreateSessionDto) {
    const session = await prisma.interviewSession.create({
      data: {
        userId,
        mode: dto.mode,
        role: dto.role,
        difficulty: dto.difficulty || 'MEDIUM',
      },
    });

    // Generate first question
    const question = await this.aiProvider.generateQuestion({
      role: dto.role,
      difficulty: (dto.difficulty || 'MEDIUM') as Difficulty,
      interviewMode: dto.mode,
      previousQuestions: [],
      previousScores: [],
      weakAreas: [],
    });

    const savedQuestion = await prisma.question.create({
      data: {
        sessionId: session.id,
        questionText: question.questionText,
        topic: question.topic,
        difficulty: (question.difficulty as any) || dto.difficulty || 'MEDIUM',
        orderIndex: 0,
        questionType: question.questionType,
      },
    });

    // Initialize interview state in Redis
    const state: InterviewState = {
      sessionId: session.id,
      currentQuestionIndex: 0,
      totalQuestions: dto.mode === 'RAPID_FIRE' ? 10 : 7,
      scores: [],
      weakAreas: [],
      previousQuestions: [question.questionText],
      mode: dto.mode,
      role: dto.role,
      difficulty: dto.difficulty || 'MEDIUM',
      startedAt: new Date().toISOString(),
    };
    await this.redis.setInterviewState(session.id, state);
    await this.redis.publishEvent(session.id, 'session_started', { sessionId: session.id });

    return {
      session,
      currentQuestion: {
        id: savedQuestion.id,
        questionText: question.questionText,
        topic: question.topic,
        difficulty: question.difficulty,
        orderIndex: 0,
      },
    };
  }

  /** Get session details with questions */
  async getSession(sessionId: string) {
    const session = await prisma.interviewSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: { orderBy: { orderIndex: 'asc' } },
        responses: { include: { score: true } },
      },
    });

    if (!session) throw new NotFoundException('Session not found');
    return session;
  }

  /** Process an answer and generate the next question */
  async processAnswer(sessionId: string, questionId: string, transcript: string, audioUrl?: string, durationSeconds?: number) {
    // Get current interview state from Redis — rebuild from DB if missing
    let state = await this.redis.getInterviewState(sessionId);
    if (!state) {
      // Redis state was lost (restart / eviction) — reconstruct from DB
      const dbSession = await prisma.interviewSession.findUnique({
        where: { id: sessionId },
        include: {
          questions: { orderBy: { orderIndex: 'asc' } },
          responses: { include: { score: true } },
        },
      });
      if (!dbSession) throw new NotFoundException('Session not found');

      const scores = dbSession.responses
        .map((r: any) => r.score?.finalScore)
        .filter((s: any) => s != null) as number[];

      const weakAreas: string[] = [];

      state = {
        sessionId,
        currentQuestionIndex: dbSession.responses.length,
        totalQuestions: dbSession.mode === 'RAPID_FIRE' ? 10 : 7,
        scores,
        weakAreas,
        previousQuestions: dbSession.questions.map((q: any) => q.questionText),
        mode: dbSession.mode,
        role: dbSession.role,
        difficulty: dbSession.difficulty,
        startedAt: dbSession.startedAt.toISOString(),
      };

      // Persist the rebuilt state
      await this.redis.setInterviewState(sessionId, state);
    }

    // Get the question
    const question = await prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Question not found');

    // Save response
    const response = await prisma.response.create({
      data: {
        questionId,
        sessionId,
        transcript,
        audioUrl,
        durationSeconds,
      },
    });

    // Evaluate answer via AI
    const evaluation = await this.aiProvider.evaluateAnswer({
      question: question.questionText,
      answer: transcript,
      role: state.role,
      topic: question.topic,
      difficulty: question.difficulty as Difficulty,
    });

    // Save score
    await prisma.score.create({
      data: {
        responseId: response.id,
        semanticScore: evaluation.semanticScore,
        clarityScore: evaluation.clarityScore,
        confidenceScore: evaluation.confidenceScore,
        hesitationScore: evaluation.hesitationScore,
        fillerScore: evaluation.fillerScore,
        finalScore: evaluation.finalScore,
        aiFeedback: evaluation.feedback,
      },
    });

    // Update Redis state
    state.scores.push(evaluation.finalScore);
    state.weakAreas = [...new Set([...state.weakAreas, ...evaluation.weaknesses])];
    state.currentQuestionIndex += 1;

    // Check if interview should end
    if (state.currentQuestionIndex >= state.totalQuestions) {
      await this.redis.clearInterviewState(sessionId);
      await this.redis.publishEvent(sessionId, 'session_completed', { sessionId });

      // Mark session as completed
      const avgScore = state.scores.reduce((a, b) => a + b, 0) / state.scores.length;
      await prisma.interviewSession.update({
        where: { id: sessionId },
        data: {
          status: 'COMPLETED',
          endedAt: new Date(),
          overallScore: Math.round(avgScore * 10) / 10,
        },
      });

      return {
        completed: true,
        evaluation,
        sessionId,
      };
    }

    // Small pause between sequential Gemini calls to avoid RPM rate limits
    await new Promise(res => setTimeout(res, 2000));

    // Generate adaptive next question based on weak areas from this answer
    const nextQuestion = await this.aiProvider.generateQuestion({
      role: state.role,
      difficulty: state.difficulty as Difficulty,
      interviewMode: state.mode,
      previousQuestions: state.previousQuestions,
      previousScores: state.scores,
      weakAreas: state.weakAreas,
    });

    const savedNextQuestion = await prisma.question.create({
      data: {
        sessionId,
        questionText: nextQuestion.questionText,
        topic: nextQuestion.topic,
        difficulty: (nextQuestion.difficulty as any) || state.difficulty,
        orderIndex: state.currentQuestionIndex,
        questionType: nextQuestion.questionType,
      },
    });

    // Update Redis
    state.previousQuestions.push(nextQuestion.questionText);
    await this.redis.setInterviewState(sessionId, state);
    await this.redis.publishEvent(sessionId, 'next_question', {
      questionIndex: state.currentQuestionIndex,
    });

    return {
      completed: false,
      evaluation,
      nextQuestion: {
        id: savedNextQuestion.id,
        questionText: nextQuestion.questionText,
        topic: nextQuestion.topic,
        difficulty: nextQuestion.difficulty,
        orderIndex: state.currentQuestionIndex,
      },
    };
  }

  /** Complete a session early */
  async completeSession(sessionId: string) {
    await this.redis.clearInterviewState(sessionId);

    const session = await prisma.interviewSession.update({
      where: { id: sessionId },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    return session;
  }
}
