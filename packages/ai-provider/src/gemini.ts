import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Difficulty, GeneratedQuestion, EvaluationResult, SessionReport } from '@voxhire/shared-types';
import type {
  AIProvider,
  QuestionGenerationParams,
  AnswerEvaluationParams,
  ReportGenerationParams,
} from './types';
import { QUESTION_GENERATION_PROMPT, ANSWER_EVALUATION_PROMPT, REPORT_GENERATION_PROMPT } from './prompts';

export class GeminiProvider implements AIProvider {
  private model;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateQuestion(params: QuestionGenerationParams): Promise<GeneratedQuestion> {
    const prompt = QUESTION_GENERATION_PROMPT(params);

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseQuestionResponse(text, params.difficulty);
    } catch (error) {
      console.error('Gemini question generation failed:', error);
      // Fallback question
      return {
        questionText: `Tell me about your experience with ${params.role} concepts.`,
        topic: params.topic || 'general',
        difficulty: params.difficulty,
        questionType: 'open-ended',
      };
    }
  }

  async evaluateAnswer(params: AnswerEvaluationParams): Promise<EvaluationResult> {
    const prompt = ANSWER_EVALUATION_PROMPT(params);

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseEvaluationResponse(text);
    } catch (error) {
      console.error('Gemini evaluation failed:', error);
      // Fallback neutral evaluation
      return {
        semanticScore: 5,
        clarityScore: 5,
        confidenceScore: 5,
        hesitationScore: 5,
        fillerScore: 5,
        finalScore: 5,
        feedback: 'Evaluation temporarily unavailable. Score is a placeholder.',
        weaknesses: [],
      };
    }
  }

  async generateReport(params: ReportGenerationParams): Promise<SessionReport> {
    const prompt = REPORT_GENERATION_PROMPT(params);

    try {
      const result = await this.model.generateContent(prompt);
      const text = result.response.text();
      return this.parseReportResponse(text);
    } catch (error) {
      console.error('Gemini report generation failed:', error);
      const avgScore = params.questions.reduce((sum, q) => sum + q.score, 0) / params.questions.length;
      return {
        overallScore: Math.round(avgScore * 10) / 10,
        strengths: ['Unable to generate detailed analysis'],
        weaknesses: params.overallWeaknesses,
        improvementSuggestions: ['Practice more and retry'],
        topicBreakdown: {},
        communicationAnalysis: {
          clarity: 5,
          confidence: 5,
          fillerUsage: 5,
          pace: 'moderate',
        },
      };
    }
  }

  private parseQuestionResponse(text: string, difficulty: Difficulty): GeneratedQuestion {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        questionText: parsed.questionText || parsed.question || text,
        topic: parsed.topic || 'general',
        difficulty: parsed.difficulty || difficulty,
        questionType: parsed.questionType || 'open-ended',
      };
    } catch {
      return {
        questionText: text.trim(),
        topic: 'general',
        difficulty,
        questionType: 'open-ended',
      };
    }
  }

  private parseEvaluationResponse(text: string): EvaluationResult {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        semanticScore: Number(parsed.semanticScore) || 5,
        clarityScore: Number(parsed.clarityScore) || 5,
        confidenceScore: Number(parsed.confidenceScore) || 5,
        hesitationScore: Number(parsed.hesitationScore) || 5,
        fillerScore: Number(parsed.fillerScore) || 5,
        finalScore: Number(parsed.finalScore) || 5,
        feedback: parsed.feedback || '',
        weaknesses: parsed.weaknesses || [],
      };
    } catch {
      return {
        semanticScore: 5, clarityScore: 5, confidenceScore: 5,
        hesitationScore: 5, fillerScore: 5, finalScore: 5,
        feedback: text, weaknesses: [],
      };
    }
  }

  private parseReportResponse(text: string): SessionReport {
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return {
        overallScore: Number(parsed.overallScore) || 0,
        strengths: parsed.strengths || [],
        weaknesses: parsed.weaknesses || [],
        improvementSuggestions: parsed.improvementSuggestions || [],
        topicBreakdown: parsed.topicBreakdown || {},
        communicationAnalysis: parsed.communicationAnalysis || {
          clarity: 5, confidence: 5, fillerUsage: 5, pace: 'moderate',
        },
      };
    } catch {
      return {
        overallScore: 0, strengths: [], weaknesses: [],
        improvementSuggestions: [], topicBreakdown: {},
        communicationAnalysis: { clarity: 5, confidence: 5, fillerUsage: 5, pace: 'moderate' },
      };
    }
  }
}
