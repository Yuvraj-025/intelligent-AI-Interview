// ─── Enums ─────────────────────────────────────────

export enum InterviewMode {
  NORMAL = 'NORMAL',
  RAPID_FIRE = 'RAPID_FIRE',
}

export enum Difficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD',
}

export enum SessionStatus {
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  ABANDONED = 'ABANDONED',
}

export enum InterviewRole {
  SOFTWARE_ENGINEER = 'SOFTWARE_ENGINEER',
  FRONTEND_DEVELOPER = 'FRONTEND_DEVELOPER',
  BACKEND_DEVELOPER = 'BACKEND_DEVELOPER',
  DATA_ANALYST = 'DATA_ANALYST',
  DATA_SCIENTIST = 'DATA_SCIENTIST',
  ML_ENGINEER = 'ML_ENGINEER',
  HR_BEHAVIORAL = 'HR_BEHAVIORAL',
  CLOUD_DEVOPS = 'CLOUD_DEVOPS',
}

// ─── User ──────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Interview Session ─────────────────────────────

export interface InterviewSession {
  id: string;
  userId: string;
  mode: InterviewMode;
  role: InterviewRole;
  difficulty: Difficulty;
  startedAt: Date;
  endedAt?: Date;
  overallScore?: number;
  status: SessionStatus;
}

// ─── Question ──────────────────────────────────────

export interface Question {
  id: string;
  sessionId: string;
  questionText: string;
  topic: string;
  difficulty: Difficulty;
  orderIndex: number;
  questionType?: string;
  generatedBy: string;
}

// ─── Response ──────────────────────────────────────

export interface UserResponse {
  id: string;
  questionId: string;
  sessionId: string;
  transcript: string;
  audioUrl?: string;
  durationSeconds?: number;
  submittedAt: Date;
}

// ─── Score ──────────────────────────────────────────

export interface Score {
  id: string;
  responseId: string;
  semanticScore: number;
  clarityScore: number;
  confidenceScore: number;
  hesitationScore: number;
  fillerScore: number;
  finalScore: number;
  aiFeedback?: string;
}

// ─── Weakness Tag ──────────────────────────────────

export interface WeaknessTag {
  id: string;
  sessionId: string;
  topic: string;
  weaknessType: string;
  severity: string;
}

// ─── Final Report ──────────────────────────────────

export interface FinalReport {
  id: string;
  sessionId: string;
  strengthsSummary: string;
  weaknessSummary: string;
  improvementSuggestions: string;
  reportJson?: Record<string, unknown>;
  createdAt: Date;
}

// ─── API DTOs ──────────────────────────────────────

export interface CreateSessionDto {
  role: InterviewRole;
  mode: InterviewMode;
  difficulty?: Difficulty;
}

export interface SubmitAnswerDto {
  sessionId: string;
  questionId: string;
  audioUrl?: string;
  transcript?: string;
  durationSeconds?: number;
}

export interface EvaluationResult {
  semanticScore: number;
  clarityScore: number;
  confidenceScore: number;
  hesitationScore: number;
  fillerScore: number;
  finalScore: number;
  feedback: string;
  weaknesses: string[];
}

export interface GeneratedQuestion {
  questionText: string;
  topic: string;
  difficulty: Difficulty;
  questionType: string;
}

export interface SessionReport {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: string[];
  topicBreakdown: Record<string, number>;
  communicationAnalysis: {
    clarity: number;
    confidence: number;
    fillerUsage: number;
    pace: string;
  };
}

// ─── API Response Wrapper ──────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
