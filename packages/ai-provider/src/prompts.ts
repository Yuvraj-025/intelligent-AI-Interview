import type {
  QuestionGenerationParams,
  AnswerEvaluationParams,
  ReportGenerationParams,
} from './types';

// ─── Question Generation Prompt ────────────────────

export const QUESTION_GENERATION_PROMPT = (params: QuestionGenerationParams): string => `
You are a professional technical interviewer conducting a ${params.interviewMode} interview for the role of ${params.role}.

Context:
- Difficulty level: ${params.difficulty}
- Topic focus: ${params.topic || 'general for the role'}
- Number of questions asked so far: ${params.previousQuestions.length}
${params.weakAreas.length > 0 ? `- Candidate's weak areas to probe: ${params.weakAreas.join(', ')}` : ''}
${params.previousScores.length > 0 ? `- Previous answer scores (1-10): ${params.previousScores.join(', ')}` : ''}
${params.previousQuestions.length > 0 ? `- Previous questions asked (avoid repetition):\n${params.previousQuestions.map((q, i) => `  ${i + 1}. ${q}`).join('\n')}` : ''}

Generate ONE interview question. The question should:
- Be appropriate for the ${params.difficulty} difficulty level
- Be relevant to the ${params.role} role
- ${params.weakAreas.length > 0 ? 'Target the candidate\'s weak areas' : 'Cover important topics for the role'}
- ${params.interviewMode === 'RAPID_FIRE' ? 'Be concise and direct, suitable for quick answering' : 'Be detailed enough for a thorough discussion'}
- NOT repeat any previously asked questions
- NOT reveal expected answers or hints

Respond ONLY with valid JSON in this exact format:
{
  "questionText": "The interview question here",
  "topic": "specific topic category",
  "difficulty": "${params.difficulty}",
  "questionType": "conceptual|practical|behavioral|scenario"
}
`;

// ─── Answer Evaluation Prompt ──────────────────────

export const ANSWER_EVALUATION_PROMPT = (params: AnswerEvaluationParams): string => `
You are a strict but fair technical interviewer evaluating a candidate's response.

Role: ${params.role}
Topic: ${params.topic}
Difficulty: ${params.difficulty}

Question asked: "${params.question}"

Candidate's answer (transcribed from voice): "${params.answer}"

Evaluate the answer on these dimensions (score each from 1 to 10):
1. semanticScore - correctness and relevance of the answer content
2. clarityScore - how clearly the answer was structured and communicated
3. confidenceScore - how confident the response sounds (based on language patterns)
4. hesitationScore - inverse of hesitation (10 = no hesitation, 1 = very hesitant). Look for "um", "uh", "like", long pauses indicated by "..."
5. fillerScore - inverse of filler word usage (10 = no fillers, 1 = excessive fillers)
6. finalScore - overall weighted score

Also provide:
- Brief constructive feedback (2-3 sentences, as an interviewer would note internally)
- List of weakness areas detected (e.g., "lacks depth in OOP", "poor communication structure")

IMPORTANT: Do NOT provide teaching, hints, or correct answers. You are evaluating, not tutoring.

Respond ONLY with valid JSON:
{
  "semanticScore": 7,
  "clarityScore": 6,
  "confidenceScore": 8,
  "hesitationScore": 5,
  "fillerScore": 6,
  "finalScore": 6.5,
  "feedback": "Brief evaluator feedback here",
  "weaknesses": ["weakness1", "weakness2"]
}
`;

// ─── Report Generation Prompt ──────────────────────

export const REPORT_GENERATION_PROMPT = (params: ReportGenerationParams): string => `
You are generating a professional interview performance report.

Interview Details:
- Role: ${params.role}
- Mode: ${params.mode}
- Total Questions: ${params.questions.length}

Question-by-Question Performance:
${params.questions.map((q, i) => `
Q${i + 1} [${q.topic}]: ${q.question}
Answer: ${q.answer}
Score: ${q.score}/10
`).join('\n')}

Detected Weaknesses Across Session: ${params.overallWeaknesses.join(', ') || 'None detected'}

Generate a comprehensive interview performance report. Include:
1. Overall score (1-10, weighted average considering all dimensions)
2. Top strengths (3-5 specific strengths observed)
3. Key weaknesses (3-5 specific areas needing improvement)
4. Actionable improvement suggestions (3-5 concrete suggestions)
5. Topic-wise score breakdown (map of topic name to average score)
6. Communication analysis (clarity, confidence, filler usage scored 1-10, pace as slow/moderate/fast)

Respond ONLY with valid JSON:
{
  "overallScore": 7.2,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "improvementSuggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "topicBreakdown": {"topic1": 8, "topic2": 5},
  "communicationAnalysis": {
    "clarity": 7,
    "confidence": 6,
    "fillerUsage": 4,
    "pace": "moderate"
  }
}
`;
