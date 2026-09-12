import { AgentActionType, PlanState } from '../../shared/types';

export interface LLMDecision {
  type: AgentActionType;
  tool?: string;
  parameters?: Record<string, any>;
  reason: string;
  objective: string;
}

export interface LLMProvider {
  name: 'Gemini' | 'MockProvider';
  generateDecision: (context: {
    planState: PlanState;
    availableTools: Array<{ name: string; description: string; parameters: any[] }>;
    stepCount: number;
    history: Array<{ action: string; result: any }>;
    trigger?: string;
  }) => Promise<LLMDecision>;
}
