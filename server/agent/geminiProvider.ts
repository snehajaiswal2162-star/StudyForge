import { LLMDecision, LLMProvider } from './types';
import { PlanState } from '../../shared/types';
import { mockProvider } from './mockProvider';

export class GeminiProvider implements LLMProvider {
  public readonly name = 'Gemini';
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  public async generateDecision(context: {
    planState: PlanState;
    availableTools: Array<{ name: string; description: string; parameters: any[] }>;
    stepCount: number;
    history: Array<{ action: string; result: any }>;
    trigger?: string;
  }): Promise<LLMDecision> {
    if (!this.apiKey) {
      // Fallback cleanly to MockProvider
      return mockProvider.generateDecision(context);
    }

    try {
      const prompt = this.buildPrompt(context);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
        console.warn(`[GeminiProvider] API error (${response.status}): falling back to MockProvider.`);
        return mockProvider.generateDecision(context);
      }

      const data = (await response.json()) as any;
      const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) {
        return mockProvider.generateDecision(context);
      }

      const parsed = JSON.parse(rawText);
      const validated = this.validateDecision(parsed);
      if (!validated) {
        console.warn('[GeminiProvider] Output failed schema validation; falling back to MockProvider.');
        return mockProvider.generateDecision(context);
      }

      return validated;
    } catch (err) {
      console.warn('[GeminiProvider] Exception during Gemini call; falling back to MockProvider:', err);
      return mockProvider.generateDecision(context);
    }
  }

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
- Topic Performance: ${JSON.stringify(planState.performance.map(p => ({ topic: p.topicName, score: p.score, mastery: p.mastery })))}
- Knowledge Gaps: ${JSON.stringify(planState.knowledgeGaps.map(g => ({ topic: g.topicName, score: g.score, severity: g.severity, priority: g.priority })))}
- Scheduled Sessions Count: ${planState.schedule.length}
- Missed Sessions: ${JSON.stringify(planState.schedule.filter(s => s.status === 'MISSED').map(s => ({ id: s.id, topic: s.topicName, date: s.date, time: s.startTime })))}
- Current Status: ${planState.status} [Risk: ${planState.riskLevel}]
- Trigger: ${trigger || 'AUTONOMOUS_STEP'}

RECENT ACTION HISTORY:
${JSON.stringify(history.slice(-3))}

AVAILABLE TOOLS:
${JSON.stringify(availableTools.map(t => ({ name: t.name, description: t.description, parameters: t.parameters })))}

RULES:
1. Respond ONLY with a valid JSON object. Do not include markdown codeblocks or chain-of-thought.
2. Valid "type" values: "CALL_TOOL", "SCHEDULE_SESSION", "RESCHEDULE_SESSION", "VERIFY_PLAN", "ADAPT", "FLAG_RISK", "COMPLETE".
3. Prioritize critical knowledge gaps (Dynamic Programming, Graphs, Recursion).
4. If there is a MISSED session, autonomously reschedule it using tool "rescheduleStudySession".
5. After modifying schedules, always verify using "verifyPlan".
6. If all high-priority topics are scheduled and verified, output type "COMPLETE".

JSON SCHEMA:
{
  "type": "CALL_TOOL" | "SCHEDULE_SESSION" | "RESCHEDULE_SESSION" | "VERIFY_PLAN" | "ADAPT" | "FLAG_RISK" | "COMPLETE",
  "tool": string,
  "parameters": object,
  "reason": string (concise summary of why this action was selected),
  "objective": string
}`;
  }

  private validateDecision(obj: any): LLMDecision | null {
    if (!obj || typeof obj !== 'object') return null;
    const validTypes = ['CALL_TOOL', 'SCHEDULE_SESSION', 'RESCHEDULE_SESSION', 'VERIFY_PLAN', 'ADAPT', 'FLAG_RISK', 'COMPLETE'];
    if (!validTypes.includes(obj.type)) return null;
    if (typeof obj.reason !== 'string' || typeof obj.objective !== 'string') return null;

    return {
      type: obj.type,
      tool: typeof obj.tool === 'string' ? obj.tool : undefined,
      parameters: typeof obj.parameters === 'object' ? obj.parameters : {},
      reason: obj.reason,
      objective: obj.objective,
    };
  }
}

export const geminiProvider = new GeminiProvider();
