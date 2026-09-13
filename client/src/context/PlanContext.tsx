import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../api/client';
import { PlanState, QuizResult, QuizSubmission } from '../../shared/types';
import { useAuth } from './AuthContext';

interface PlanContextType {
  plan: PlanState | null;
  isLoading: boolean;
  isAgentRunning: boolean;
  agentStatusMessage: string;
  error: string | null;
  fetchPlan: (planId?: string) => Promise<void>;
  runAgent: (trigger?: string) => Promise<void>;
  markSessionMissed: (sessionId: string) => Promise<void>;
  completeSession: (sessionId: string) => Promise<void>;
  rescheduleSession: (sessionId: string, newDate: string, newStartTime: string, reason?: string) => Promise<void>;
  verifyCurrentPlan: () => Promise<void>;
  simulateCapacityDrop: () => Promise<void>;
  resetDemoPlan: () => Promise<void>;
  submitQuiz: (submission: QuizSubmission) => Promise<QuizResult>;
  clearError: () => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

// Fallback safe state builder
function ensureSafePlan(p: PlanState): PlanState {
  return {
    ...p,
    performance: Array.isArray(p.performance) ? p.performance : [],
    knowledgeGaps: Array.isArray(p.knowledgeGaps) ? p.knowledgeGaps : [],
    resources: Array.isArray(p.resources) ? p.resources : [],
    calendar: Array.isArray(p.calendar) ? p.calendar : [],
    schedule: Array.isArray(p.schedule) ? p.schedule : [],
    decisions: Array.isArray(p.decisions) ? p.decisions : [],
    toolCalls: Array.isArray(p.toolCalls) ? p.toolCalls : [],
    verificationEvents: Array.isArray(p.verificationEvents) ? p.verificationEvents : [],
    adaptationEvents: Array.isArray(p.adaptationEvents) ? p.adaptationEvents : [],
    auditLog: Array.isArray(p.auditLog) ? p.auditLog : [],
    progress: p.progress || {
      overallMastery: 50,
      initialMastery: 50,
      completedHours: 0,
      targetHours: 24,
      completedSessionsCount: 0,
      totalSessionsCount: 0,
      missedSessionsCount: 0,
      rescheduledSessionsCount: 0,
      streakDays: 0,
    },
  };
}

export const PlanProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [plan, setPlan] = useState<PlanState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAgentRunning, setIsAgentRunning] = useState<boolean>(false);
  const [agentStatusMessage, setAgentStatusMessage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const targetPlanId = user?.planId || 'plan-sneha-dsa';

  const fetchPlan = useCallback(async (planId?: string) => {
    const idToFetch = planId || targetPlanId;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getPlan(idToFetch);
      setPlan(ensureSafePlan(data));
    } catch (err: any) {
      console.warn(`Failed to fetch plan '${idToFetch}':`, err);
      setError(err.message || 'Failed to load study plan.');
    } finally {
      setIsLoading(false);
    }
  }, [targetPlanId]);

  useEffect(() => {
    if (user?.planId) {
      fetchPlan(user.planId);
    } else {
      setPlan(null);
      setIsLoading(false);
    }
  }, [user?.planId, fetchPlan]);

  const runAgent = async (trigger?: string) => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Agent is analyzing performance & gap metrics...');
    setError(null);

    try {
      setTimeout(() => setAgentStatusMessage('Agent is querying calendar & scheduling optimal sessions...'), 400);
      setTimeout(() => setAgentStatusMessage('Agent is executing deterministic verification...'), 900);

      const res = await api.runAgent(plan.planId, trigger);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Agent orchestration error.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const markSessionMissed = async (sessionId: string) => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Autonomous replanning: Missed session detected...');
    setError(null);

    try {
      setTimeout(() => setAgentStatusMessage('Scanning calendar availability for alternative slots...'), 350);
      setTimeout(() => setAgentStatusMessage('Rescheduling session & re-verifying objective feasibility...'), 750);

      const res = await api.markSessionMissed(sessionId, plan.planId);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Failed to adapt plan after missed session.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const completeSession = async (sessionId: string) => {
    if (!plan) return;
    try {
      const res = await api.completeSession(sessionId, plan.planId);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Failed to complete session.');
    }
  };

  const rescheduleSession = async (sessionId: string, newDate: string, newStartTime: string, reason?: string) => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Rescheduling study session...');
    try {
      const res = await api.rescheduleSession(sessionId, { planId: plan.planId, newDate, newStartTime, reason });
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Failed to reschedule session.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const verifyCurrentPlan = async () => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Executing 9-point deterministic verification...');
    try {
      const res = await api.verifyPlan(plan.planId);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Verification failed.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const simulateCapacityDrop = async () => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Simulating severe calendar capacity reduction (AT_RISK scenario)...');
    try {
      setTimeout(() => setAgentStatusMessage('Agent evaluating study deficit vs remaining capacity...'), 400);
      const res = await api.simulateCapacityDrop(plan.planId);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Failed to simulate capacity reduction.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const resetDemoPlan = async () => {
    if (!plan) return;
    setIsAgentRunning(true);
    setAgentStatusMessage('Resetting demo state to baseline Sneha DSA scenario...');
    try {
      const res = await api.resetDemoPlan(plan.planId);
      setPlan(ensureSafePlan(res.plan));
    } catch (err: any) {
      setError(err.message || 'Failed to reset demo plan.');
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const submitQuiz = async (submission: QuizSubmission): Promise<QuizResult> => {
    if (!plan) throw new Error('No active plan loaded.');
    setIsAgentRunning(true);
    setAgentStatusMessage('Grading assessment and recalculating knowledge gaps...');
    try {
      const res = await api.submitQuiz(plan.planId, submission);
      setPlan(ensureSafePlan(res.plan));
      return res.quizResult;
    } finally {
      setIsAgentRunning(false);
      setAgentStatusMessage('');
    }
  };

  const clearError = () => setError(null);

  return (
    <PlanContext.Provider
      value={{
        plan,
        isLoading,
        isAgentRunning,
        agentStatusMessage,
        error,
        fetchPlan,
        runAgent,
        markSessionMissed,
        completeSession,
        rescheduleSession,
        verifyCurrentPlan,
        simulateCapacityDrop,
        resetDemoPlan,
        submitQuiz,
        clearError,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};
