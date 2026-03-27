import {
  type GeneratedQuestion,
  type EvaluationResult,
  type SessionReport,
  type Difficulty,
} from '@voxhire/shared-types';

// ─── Abstract AI Provider Interface ────────────────
// This abstraction allows swapping Gemini for DeepSeek or any other provider.

export interface AIProvider {
  /** Generate an interview question based on context */
  generateQuestion(params: QuestionGenerationParams): Promise<GeneratedQuestion>;

  /** Evaluate a user's answer to a question */
  evaluateAnswer(params: AnswerEvaluationParams): Promise<EvaluationResult>;

  /** Generate a complete session report */
  generateReport(params: ReportGenerationParams): Promise<SessionReport>;
}

export interface QuestionGenerationParams {
  role: string;
  topic?: string;
  difficulty: Difficulty;
  interviewMode: string;
  previousQuestions: string[];
  previousScores: number[];
  weakAreas: string[];
}

export interface AnswerEvaluationParams {
  question: string;
  answer: string;
  role: string;
  topic: string;
  difficulty: Difficulty;
}

export interface ReportGenerationParams {
  role: string;
  mode: string;
  questions: Array<{
    question: string;
    answer: string;
    topic: string;
    score: number;
  }>;
  overallWeaknesses: string[];
}
