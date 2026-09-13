import { LLMDecision, LLMProvider } from './types';

import {
  AssessmentQuestion,
  LessonAssessment,
  PlanState,
  StudySession,
} from '../../shared/types';

import { mockProvider } from './mockProvider';

import { generateSubjectCurriculum } from '../simulation/subjectCurriculum';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'Gemini';

  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  // ============================================================
  // INITIAL DIAGNOSTIC ASSESSMENT
  // ============================================================

  public async generateAssessment(
    plan: PlanState
  ): Promise<AssessmentQuestion[]> {
    const fallback = () =>
      generateSubjectCurriculum(
        plan.subject || plan.goal,
        plan.currentLevel || plan.student.currentLevel
      ).questions;

    if (!this.apiKey) return fallback();

    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Generate exactly 8 diagnostic multiple-choice questions as strict JSON for subject "${plan.subject || plan.goal}".

Consider:
- Goal: "${plan.goal}"
- Level: "${plan.currentLevel || plan.student.currentLevel}"
- Education type: "${plan.educationType || ''}"
- Priority: "${plan.prioritization || ''}"

Do not use unrelated subjects.

Return ONLY an array of objects with:
id,
topicId,
topicName,
question,
options (exactly four strings),
correctOptionIndex,
explanation,
difficulty (Easy, Medium, or Hard).

Do not include chain-of-thought.`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) return fallback();

      const data = (await response.json()) as any;

      const parsed = JSON.parse(
        data.candidates?.[0]?.content?.parts?.[0]?.text || '[]'
      );

      if (
        !Array.isArray(parsed) ||
        parsed.length !== 8 ||
        parsed.some(
          (item) =>
            !item ||
            typeof item.question !== 'string' ||
            !Array.isArray(item.options) ||
            item.options.length !== 4
        )
      ) {
        return fallback();
      }

      return parsed as AssessmentQuestion[];
    } catch (error) {
      console.warn(
        '[GeminiProvider] Assessment generation failed; using subject-aware fallback.',
        error
      );

      return fallback();
    }
  }

  // ============================================================
  // LESSON-SPECIFIC ASSESSMENT
  // ============================================================

  public async generateLessonAssessment(
    plan: PlanState,
    session: StudySession,
    attempt: number = 1,
    previousQuestions: AssessmentQuestion[] = []
  ): Promise<LessonAssessment> {
    const topic = session.topicName;

    const fallbackQuestions = this.generateLessonFallback(
      plan,
      session,
      attempt,
      previousQuestions
    );

    if (!this.apiKey) {
      return {
        id: `lesson-assessment-${session.id}-${Date.now()}`,
        sessionId: session.id,
        topicId: session.topicId,
        topicName: session.topicName,
        questions: fallbackQuestions,
        attempt,
        generatedAt: new Date().toISOString(),
      };
    }

    try {
      const previousQuestionText = previousQuestions
        .slice(0, 8)
        .map((q) => q.question)
        .join('\n- ');

      const prompt = `You are StudyForge, an adaptive learning assessment generator.

Generate exactly 8 NEW multiple-choice questions for the lesson the student just completed.

STUDENT CONTEXT:
- Subject: "${plan.subject || plan.goal}"
- Goal: "${plan.goal}"
- Level: "${plan.currentLevel || plan.student.currentLevel}"
- Education type: "${plan.educationType || 'not specified'}"

COMPLETED LESSON:
- Topic ID: "${session.topicId}"
- Topic: "${topic}"
- Resource: "${session.resourceTitle}"
- Duration: ${session.durationMinutes} minutes
- Assessment attempt: ${attempt}

IMPORTANT RULES:
1. Questions MUST be specifically about "${topic}".
2. Questions MUST match the student's level.
3. Questions MUST test understanding of the completed lesson, not unrelated topics.
4. Generate a completely NEW question set.
5. Do NOT repeat or closely paraphrase these previous questions:
${previousQuestionText || '- None'}

6. Mix conceptual, practical, application, and scenario-based questions where appropriate.
7. Avoid trick questions.
8. Exactly four options per question.
9. Only one option may be correct.
10. Do not include chain-of-thought.
11. Return ONLY valid JSON.
12. Use unique question IDs.

Return exactly this structure:

[
  {
    "id": "unique-id",
    "topicId": "${session.topicId}",
    "topicName": "${topic}",
    "question": "question text",
    "options": [
      "option 1",
      "option 2",
      "option 3",
      "option 4"
    ],
    "correctOptionIndex": 0,
    "explanation": "short explanation",
    "difficulty": "Easy"
  }
]

Difficulty must be exactly one of:
Easy, Medium, Hard.`;

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: prompt }],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.8,
              maxOutputTokens: 4096,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          `[GeminiProvider] Lesson assessment API error (${response.status}); using deterministic fallback.`
        );

        return {
          id: `lesson-assessment-${session.id}-${Date.now()}`,
          sessionId: session.id,
          topicId: session.topicId,
          topicName: session.topicName,
          questions: fallbackQuestions,
          attempt,
          generatedAt: new Date().toISOString(),
        };
      }

      const data = (await response.json()) as any;

      const rawText =
        data.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

      const parsed = JSON.parse(rawText);

      if (!this.validateLessonQuestions(parsed, session)) {
        console.warn(
          '[GeminiProvider] Lesson assessment failed validation; using deterministic fallback.'
        );

        return {
          id: `lesson-assessment-${session.id}-${Date.now()}`,
          sessionId: session.id,
          topicId: session.topicId,
          topicName: session.topicName,
          questions: fallbackQuestions,
          attempt,
          generatedAt: new Date().toISOString(),
        };
      }

      return {
        id: `lesson-assessment-${session.id}-${Date.now()}`,
        sessionId: session.id,
        topicId: session.topicId,
        topicName: session.topicName,
        questions: parsed as AssessmentQuestion[],
        attempt,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.warn(
        '[GeminiProvider] Lesson assessment generation failed; using deterministic fallback.',
        error
      );

      return {
        id: `lesson-assessment-${session.id}-${Date.now()}`,
        sessionId: session.id,
        topicId: session.topicId,
        topicName: session.topicName,
        questions: fallbackQuestions,
        attempt,
        generatedAt: new Date().toISOString(),
      };
    }
  }

  // ============================================================
  // LESSON QUESTION VALIDATION
  // ============================================================

  private validateLessonQuestions(
    questions: any,
    session: StudySession
  ): boolean {
    if (!Array.isArray(questions) || questions.length !== 8) {
      return false;
    }

    return questions.every((q) => {
      return (
        q &&
        typeof q.id === 'string' &&
        q.id.length > 0 &&
        q.topicId === session.topicId &&
        typeof q.topicName === 'string' &&
        typeof q.question === 'string' &&
        q.question.trim().length > 10 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((option: any) => typeof option === 'string') &&
        Number.isInteger(q.correctOptionIndex) &&
        q.correctOptionIndex >= 0 &&
        q.correctOptionIndex <= 3 &&
        typeof q.explanation === 'string' &&
        ['Easy', 'Medium', 'Hard'].includes(q.difficulty)
      );
    });
  }

  // ============================================================
  // DETERMINISTIC GENERAL-PURPOSE FALLBACK
  // ============================================================

  private generateLessonFallback(
    plan: PlanState,
    session: StudySession,
    attempt: number,
    previousQuestions: AssessmentQuestion[]
  ): AssessmentQuestion[] {
    const subject = plan.subject || plan.goal;
    const topic = session.topicName;

    /*
     * We deliberately create different question wording/options
     * for different attempts so the fallback does not keep returning
     * the same first 8 diagnostic questions.
     */

    const questionTemplates = [
      {
        question: `Which statement best describes the main purpose of ${topic} in ${subject}?`,
        options: [
          `Applying the core concepts of ${topic} to relevant problems`,
          `Ignoring the concepts and memorizing unrelated facts`,
          `Using only topics unrelated to ${topic}`,
          `Avoiding practical application of the topic`,
        ],
      },
      {
        question: `A student has completed a lesson on ${topic}. What should they demonstrate first?`,
        options: [
          `The ability to explain and apply the core idea`,
          `Only the ability to repeat the lesson title`,
          `Knowledge of an unrelated subject`,
          `The ability to skip the underlying concept`,
        ],
      },
      {
        question: `Which approach is most useful when applying ${topic} to a new problem?`,
        options: [
          `Identify the relevant concept and apply it step by step`,
          `Choose an answer without examining the problem`,
          `Ignore the constraints of the problem`,
          `Use an unrelated technique automatically`,
        ],
      },
      {
        question: `Why is understanding ${topic} important for the learning goal "${plan.goal}"?`,
        options: [
          `It builds knowledge needed for the broader learning objective`,
          `It replaces every other topic automatically`,
          `It removes the need for practice`,
          `It is unrelated to the learning objective`,
        ],
      },
      {
        question: `Which situation best indicates that a learner understands ${topic}?`,
        options: [
          `They can explain the concept and use it in a new situation`,
          `They can only recognize the topic name`,
          `They avoid solving problems involving the topic`,
          `They memorize one example without understanding it`,
        ],
      },
      {
        question: `What is a good way to strengthen understanding after studying ${topic}?`,
        options: [
          `Solve varied problems and review mistakes`,
          `Read the same sentence repeatedly without practice`,
          `Skip difficult examples`,
          `Study only unrelated topics`,
        ],
      },
      {
        question: `When should a learner revisit ${topic}?`,
        options: [
          `When practice reveals a persistent misunderstanding`,
          `Only when every other topic is mastered`,
          `Never after completing the lesson`,
          `Only before starting any learning`,
        ],
      },
      {
        question: `Which action best transfers knowledge of ${topic} into practical skill?`,
        options: [
          `Applying the concept to a fresh problem`,
          `Copying the lesson title`,
          `Ignoring feedback`,
          `Avoiding new examples`,
        ],
      },
    ];

    /*
     * Rotate the deterministic set on every attempt.
     * This prevents the exact same ordering from appearing.
     */
    const rotation =
      (Math.max(1, attempt) - 1) % questionTemplates.length;

    const rotated = [
      ...questionTemplates.slice(rotation),
      ...questionTemplates.slice(0, rotation),
    ];

    /*
     * If previous questions exist, alter the question IDs and
     * select a different ordering rather than reusing the old set.
     */
    return rotated.slice(0, 8).map((template, index) => ({
      id: `lesson-${session.id}-attempt-${attempt}-q-${index + 1}`,
      topicId: session.topicId,
      topicName: topic,
      question: template.question,
      options: template.options,
      correctOptionIndex: 0,
      explanation:
        `This checks practical understanding of ${topic} within the context of ${subject}.`,
      difficulty:
        index % 3 === 0
          ? 'Easy'
          : index % 3 === 1
            ? 'Medium'
            : 'Hard',
    }));
  }

  // ============================================================
  // AUTONOMOUS AGENT DECISION
  // ============================================================

  public async generateDecision(context: {
    planState: PlanState;
    availableTools: Array<{
      name: string;
      description: string;
      parameters: any[];
    }>;
    stepCount: number;
    history: Array<{ action: string; result: any }>;
    trigger?: string;
  }): Promise<LLMDecision> {
    if (!this.apiKey) {
      return mockProvider.generateDecision(context);
    }

    try {
      const prompt = this.buildPrompt(context);

      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': this.apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.1,
              maxOutputTokens: 1024,
            },
          }),
        }
      );

      if (!response.ok) {
        console.warn(
          `[GeminiProvider] API error (${response.status}): falling back to MockProvider.`
        );

        return mockProvider.generateDecision(context);
      }

      const data = (await response.json()) as any;

      const rawText =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        return mockProvider.generateDecision(context);
      }

      const parsed = JSON.parse(rawText);

      const validated = this.validateDecision(parsed);

      if (!validated) {
        console.warn(
          '[GeminiProvider] Output failed schema validation; falling back to MockProvider.'
        );

        return mockProvider.generateDecision(context);
      }

      return validated;
    } catch (err) {
      console.warn(
        '[GeminiProvider] Exception during Gemini call; falling back to MockProvider:',
        err
      );

      return mockProvider.generateDecision(context);
    }
  }

  // ============================================================
  // AGENT PROMPT
  // ============================================================

  private buildPrompt(context: {
    planState: PlanState;
    availableTools: any[];
    stepCount: number;
    history: any[];
    trigger?: string;
  }): string {
    const { planState, availableTools, trigger, history } = context;

    return `You are StudyForge, an autonomous learning planner agent.

Your objective is to guide student ${planState.student.name} to achieve their goal: "${planState.goal}" before deadline ${planState.deadline}.

CURRENT STATE SUMMARY:

- Subject: ${planState.subject || planState.goal}
- Education type: ${planState.educationType || 'not specified'}
- Goal type: ${planState.goalType || 'not specified'}
- Current level: ${planState.currentLevel || planState.student.currentLevel}
- Topic Performance: ${JSON.stringify(
      planState.performance.map((p) => ({
        topic: p.topicName,
        score: p.score,
        mastery: p.mastery,
      }))
    )}
- Knowledge Gaps: ${JSON.stringify(
      planState.knowledgeGaps.map((g) => ({
        topic: g.topicName,
        score: g.score,
        severity: g.severity,
        priority: g.priority,
      }))
    )}
- Scheduled Sessions Count: ${planState.schedule.length}
- Missed Sessions: ${JSON.stringify(
      planState.schedule
        .filter((s) => s.status === 'MISSED')
        .map((s) => ({
          id: s.id,
          topic: s.topicName,
          date: s.date,
          time: s.startTime,
        }))
    )}
- Current Status: ${planState.status} [Risk: ${planState.riskLevel}]
- Trigger: ${trigger || 'AUTONOMOUS_STEP'}

RECENT ACTION HISTORY:

${JSON.stringify(history.slice(-3))}

AVAILABLE TOOLS:

${JSON.stringify(
      availableTools.map((t) => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters,
      }))
    )}

RULES:

1. Respond ONLY with a valid JSON object. Do not include markdown codeblocks or chain-of-thought.

2. Valid "type" values:
CALL_TOOL,
SCHEDULE_SESSION,
RESCHEDULE_SESSION,
VERIFY_PLAN,
ADAPT,
FLAG_RISK,
COMPLETE.

3. Prioritize the student's highest-severity knowledge gaps from planState.knowledgeGaps. Never assume a fixed subject or fixed topic list.

4. If there is a MISSED session, autonomously reschedule it using tool "rescheduleStudySession".

5. After modifying schedules, always verify using "verifyPlan".

6. If all high-priority topics are scheduled and verified, output type "COMPLETE".

JSON SCHEMA:

{
  "type": "CALL_TOOL" | "SCHEDULE_SESSION" | "RESCHEDULE_SESSION" | "VERIFY_PLAN" | "ADAPT" | "FLAG_RISK" | "COMPLETE",
  "tool": "string",
  "parameters": {},
  "reason": "concise summary of why this action was selected",
  "objective": "string"
}`;
  }

  // ============================================================
  // DECISION VALIDATION
  // ============================================================

  private validateDecision(obj: any): LLMDecision | null {
    if (!obj || typeof obj !== 'object') return null;

    const validTypes = [
      'CALL_TOOL',
      'SCHEDULE_SESSION',
      'RESCHEDULE_SESSION',
      'VERIFY_PLAN',
      'ADAPT',
      'FLAG_RISK',
      'COMPLETE',
    ];

    if (!validTypes.includes(obj.type)) return null;

    if (typeof obj.reason !== 'string' || typeof obj.objective !== 'string') {
      return null;
    }

    return {
      type: obj.type,
      tool: typeof obj.tool === 'string' ? obj.tool : undefined,
      parameters:
        typeof obj.parameters === 'object' ? obj.parameters : {},
      reason: obj.reason,
      objective: obj.objective,
    };
  }
}

export const geminiProvider = new GeminiProvider();