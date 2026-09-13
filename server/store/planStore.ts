import {
  AdaptationEvent,
  AgentDecision,
  AuditEntry,
  CalendarSlot,
  PlanConstraints,
  PlanState,
  RiskLevel,
  StudentProfile,
  StudySession,
  ToolCallRecord,
  VerificationEvent,
} from '../../shared/types';
import {
  CURATED_RESOURCES,
  generateSyntheticCalendar,
  getSyntheticPerformance,
} from '../simulation/curriculumGenerator';
import { calculateKnowledgeGaps } from '../tools/learningTools';

// In-memory store with seed data
class PlanStore {
  private plans: Map<string, PlanState> = new Map();

  constructor() {
    this.seedDemoPlan();
  }

  /**
   * Defensive sanitizer ensuring no undefined array can ever exist or leave the backend
   */
  public sanitizePlan(plan: PlanState): PlanState {
    return {
      ...plan,
      performance: Array.isArray(plan.performance) ? plan.performance : [],
      knowledgeGaps: Array.isArray(plan.knowledgeGaps) ? plan.knowledgeGaps : [],
      resources: Array.isArray(plan.resources) ? plan.resources : [],
      calendar: Array.isArray(plan.calendar) ? plan.calendar : [],
      schedule: Array.isArray(plan.schedule) ? plan.schedule : [],
      decisions: Array.isArray(plan.decisions) ? plan.decisions : [],
      toolCalls: Array.isArray(plan.toolCalls) ? plan.toolCalls : [],
      verificationEvents: Array.isArray(plan.verificationEvents) ? plan.verificationEvents : [],
      adaptationEvents: Array.isArray(plan.adaptationEvents) ? plan.adaptationEvents : [],
      auditLog: Array.isArray(plan.auditLog) ? plan.auditLog : [],
    };
  }

  public getPlan(planId: string): PlanState | undefined {
    const plan = this.plans.get(planId);
    return plan ? this.sanitizePlan(plan) : undefined;
  }

  public getAllPlans(): PlanState[] {
    return Array.from(this.plans.values()).map(p => this.sanitizePlan(p));
  }

  public setPlan(plan: PlanState): PlanState {
    const sanitized = this.sanitizePlan({
      ...plan,
      updatedAt: new Date().toISOString(),
    });
    this.plans.set(plan.planId, sanitized);
    return sanitized;
  }

  public updatePlan(planId: string, updater: (prev: PlanState) => Partial<PlanState>): PlanState | undefined {
    const prev = this.getPlan(planId);
    if (!prev) return undefined;

    const partial = updater(prev);
    const updated: PlanState = {
      ...prev,
      ...partial,
      updatedAt: new Date().toISOString(),
    };

    const sanitized = this.sanitizePlan(updated);
    this.plans.set(planId, sanitized);
    return sanitized;
  }

  public recordAudit(
    planId: string,
    actor: AuditEntry['actor'],
    action: string,
    target: string,
    result: AuditEntry['result'],
    reason: string,
    tool?: string
  ): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    const entry: AuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      tool,
      target,
      result,
      reason,
    };

    plan.auditLog.unshift(entry);
    this.setPlan(plan);
  }

  public recordDecision(planId: string, decision: Omit<AgentDecision, 'id' | 'timestamp'>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    const fullDecision: AgentDecision = {
      ...decision,
      id: `dec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    plan.decisions.unshift(fullDecision);
    plan.lastAgentAction = decision.reason;
    this.setPlan(plan);
  }

  public recordToolCall(planId: string, record: Omit<ToolCallRecord, 'id' | 'timestamp'>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    const fullRecord: ToolCallRecord = {
      ...record,
      id: `tc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    plan.toolCalls.unshift(fullRecord);
    this.setPlan(plan);
  }

  public recordAdaptation(planId: string, adaptation: Omit<AdaptationEvent, 'id' | 'timestamp'>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    const fullEvent: AdaptationEvent = {
      ...adaptation,
      id: `adapt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    plan.adaptationEvents.unshift(fullEvent);
    this.setPlan(plan);
  }

  public recordVerification(planId: string, verification: Omit<VerificationEvent, 'id' | 'timestamp'>): void {
    const plan = this.getPlan(planId);
    if (!plan) return;

    const fullEvent: VerificationEvent = {
      ...verification,
      id: `ver-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };

    plan.verificationEvents.unshift(fullEvent);
    plan.status = verification.result.status;
    plan.riskLevel = verification.result.status === 'AT_RISK' ? 'HIGH' : 'LOW';
    this.setPlan(plan);
  }

  /**
   * Seeds the primary demo scenario for Sneha
   */
  public seedDemoPlan(): PlanState {
    const planId = 'plan-sneha-dsa';
    const student: StudentProfile = {
      id: 'student-sneha',
      name: 'Sneha Sharma',
      email: 'sneha@studyforge.ai',
      targetGoal: 'Master Data Structures & Algorithms before campus placements.',
      currentLevel: 'Intermediate',
    };

    const constraints: PlanConstraints = {
      availableHoursPerWeek: 12,
      preferredDailyHours: 1.5,
      availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
      maxSessionsPerDay: 2,
      sessionDurationMinutes: 60,
    };

    const performance = getSyntheticPerformance(student.id);
    const knowledgeGaps = calculateKnowledgeGaps(performance);
    const calendar = generateSyntheticCalendar('2026-09-14', 4);

    const initialPlan: PlanState = {
      planId,
      student,
      subject: 'Data Structures & Algorithms',
      educationType: 'College / University',
      goalType: 'Prepare for an exam',
      currentLevel: 'Intermediate',
      targetDate: '2026-10-15',
      dailyStudyMinutes: 90,
      availableDays: constraints.availableDays,
      prioritization: 'Focus on my weakest areas',
      goal: 'Master Data Structures & Algorithms before campus placements.',
      deadline: '2026-10-15',
      constraints,
      performance,
      knowledgeGaps,
      resources: CURATED_RESOURCES,
      calendar,
      schedule: [],
      progress: {
        overallMastery: Math.round(performance.reduce((acc, p) => acc + p.score, 0) / performance.length),
        initialMastery: Math.round(performance.reduce((acc, p) => acc + p.score, 0) / performance.length),
        completedHours: 0,
        targetHours: 24,
        completedSessionsCount: 0,
        totalSessionsCount: 0,
        missedSessionsCount: 0,
        rescheduledSessionsCount: 0,
        streakDays: 0,
      },
      decisions: [],
      toolCalls: [],
      verificationEvents: [],
      adaptationEvents: [],
      auditLog: [
        {
          id: `audit-init`,
          timestamp: new Date('2026-09-12T10:00:00Z').toISOString(),
          actor: 'SYSTEM',
          action: 'INITIALIZE_STUDENT_PROFILE',
          target: student.name,
          result: 'SUCCESS',
          reason: 'Initial profile registered with target goal: Master DSA.',
        },
      ],
      status: 'DRAFT',
      riskLevel: 'LOW',
      activeProvider: process.env.GEMINI_API_KEY ? 'Gemini' : 'MockProvider',
      lastAgentAction: 'System initialized. Ready for autonomous plan generation.',
      createdAt: new Date('2026-09-12T10:00:00Z').toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.plans.set(planId, initialPlan);
    return initialPlan;
  }
}

export const planStore = new PlanStore();
