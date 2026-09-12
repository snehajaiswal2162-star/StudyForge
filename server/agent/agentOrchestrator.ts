import { AgentDecision, PlanState, ToolCallRecord } from '../../shared/types';
import { planStore } from '../store/planStore';
import { toolRegistry } from '../tools/toolRegistry';
import { geminiProvider } from './geminiProvider';
import { mockProvider } from './mockProvider';
import { LLMDecision, LLMProvider } from './types';

export interface OrchestratorRunResult {
  planId: string;
  stepsExecuted: number;
  toolCallsExecuted: number;
  decisions: AgentDecision[];
  finalStatus: PlanState['status'];
  riskLevel: PlanState['riskLevel'];
  summary: string;
}

export class AgentOrchestrator {
  private maxSteps = 20;
  private maxToolCalls = 25;

  private getProvider(): LLMProvider {
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
      return geminiProvider;
    }
    return mockProvider;
  }

  /**
   * Main Autonomous Execution Loop
   */
  public async runLoop(planId: string, triggerReason?: string): Promise<OrchestratorRunResult> {
    const plan = planStore.getPlan(planId);
    if (!plan) {
      throw new Error(`Cannot run agent loop: Plan '${planId}' does not exist.`);
    }

    const provider = this.getProvider();
    planStore.updatePlan(planId, p => ({
      activeProvider: provider.name,
      status: p.status === 'DRAFT' ? 'PLANNING' : p.status,
    }));

    planStore.recordAudit(
      planId,
      'AGENT',
      'START_ORCHESTRATION',
      plan.student.name,
      'SUCCESS',
      `Agent loop started by trigger: '${triggerReason || 'AUTONOMOUS_CYCLE'}'. Active provider: ${provider.name}.`
    );

    let stepCount = 0;
    let toolCallCount = 0;
    const history: Array<{ action: string; result: any }> = [];
    const executedActionHashes = new Set<string>();

    while (stepCount < this.maxSteps && toolCallCount < this.maxToolCalls) {
      stepCount++;
      const currentPlan = planStore.getPlan(planId)!;

      // 1. Observe State & Ask Provider for Decision
      const decision: LLMDecision = await provider.generateDecision({
        planState: currentPlan,
        availableTools: toolRegistry.getToolSummaries(),
        stepCount,
        history,
        trigger: triggerReason,
      });

      // Prevent duplicate identical actions within the same execution run
      const actionHash = `${decision.type}-${decision.tool}-${JSON.stringify(decision.parameters || {})}`;
      if (executedActionHashes.has(actionHash) && decision.type !== 'VERIFY_PLAN' && decision.type !== 'COMPLETE') {
        planStore.recordAudit(
          planId,
          'AGENT',
          'DUPLICATE_ACTION_BLOCKED',
          actionHash,
          'WARNING',
          `Agent attempted duplicate action ${actionHash}. Breaking cycle safely.`
        );
        break;
      }
      executedActionHashes.add(actionHash);

      // Record Decision in PlanState
      planStore.recordDecision(planId, {
        step: stepCount,
        type: decision.type,
        tool: decision.tool,
        parameters: decision.parameters,
        reason: decision.reason,
        objective: decision.objective,
      });

      // 2. Handle Decision Types
      if (decision.type === 'COMPLETE') {
        planStore.recordAudit(
          planId,
          'AGENT',
          'COMPLETE',
          'Autonomous Planning Goal',
          'SUCCESS',
          decision.reason
        );
        break;
      }

      if (decision.type === 'FLAG_RISK') {
        planStore.updatePlan(planId, p => ({
          status: 'AT_RISK',
          riskLevel: 'HIGH',
          lastAgentAction: decision.reason,
        }));

        planStore.recordAudit(
          planId,
          'AGENT',
          'FLAG_RISK',
          'Plan Feasibility Constraints',
          'WARNING',
          `Risk Flagged: ${decision.reason}`
        );
        break;
      }

      // 3. Execute Tool if decision calls a tool
      const toolName = decision.tool;
      if (toolName) {
        toolCallCount++;
        const tool = toolRegistry.get(toolName);

        if (!tool) {
          planStore.recordToolCall(planId, {
            toolName,
            input: decision.parameters || {},
            output: null,
            status: 'ERROR',
            error: `Tool '${toolName}' not found in registry.`,
          });
          continue;
        }

        try {
          const toolResult = await tool.execute(decision.parameters || {}, planId);

          planStore.recordToolCall(planId, {
            toolName,
            input: decision.parameters || {},
            output: toolResult.data,
            status: toolResult.success ? 'SUCCESS' : 'ERROR',
            error: toolResult.error,
          });

          history.push({
            action: toolName,
            result: toolResult,
          });

          // Small yield for realistic execution pacing
          await new Promise(r => setTimeout(r, 40));
        } catch (err: any) {
          planStore.recordToolCall(planId, {
            toolName,
            input: decision.parameters || {},
            output: null,
            status: 'ERROR',
            error: err.message || 'Execution error during tool call',
          });
        }
      }
    }

    const finalPlan = planStore.getPlan(planId)!;

    return {
      planId,
      stepsExecuted: stepCount,
      toolCallsExecuted: toolCallCount,
      decisions: finalPlan.decisions,
      finalStatus: finalPlan.status,
      riskLevel: finalPlan.riskLevel,
      summary: `Agent completed execution in ${stepCount} steps with ${toolCallCount} tool calls. Status: ${finalPlan.status}.`,
    };
  }
}

export const agentOrchestrator = new AgentOrchestrator();
