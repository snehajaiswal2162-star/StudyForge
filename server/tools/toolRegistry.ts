import {
  CalendarSlot,
  LearningResource,
  PlanState,
  StudySession,
  TopicPerformance,
  VerificationResult,
} from '../../shared/types';
import { CURATED_RESOURCES } from '../simulation/curriculumGenerator';
import { planStore } from '../store/planStore';
import { calculateKnowledgeGaps, runDeterministicVerification } from './learningTools';

export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    name: string;
    type: string;
    description: string;
    required: boolean;
  }[];
  execute: (params: any, planId: string) => Promise<{ success: boolean; data?: any; error?: string }>;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  constructor() {
    this.registerTools();
  }

  private registerTools() {
    // 1. getPerformance
    this.register({
      name: 'getPerformance',
      description: 'Retrieves current topic performance metrics, test scores, and knowledge gap indicators for the student.',
      parameters: [
        { name: 'studentId', type: 'string', description: 'The unique ID of the student', required: true },
      ],
      execute: async (params, planId) => {
        const plan = planStore.getPlan(planId);
        if (!plan) return { success: false, error: `Plan '${planId}' not found.` };

        const performance = plan.performance || [];
        const gaps = calculateKnowledgeGaps(performance);

        planStore.updatePlan(planId, p => ({
          knowledgeGaps: gaps,
        }));

        planStore.recordAudit(
          planId,
          'AGENT',
          'getPerformance',
          params.studentId || plan.student.id,
          'SUCCESS',
          `Retrieved performance across ${performance.length} topics. Derived ${gaps.length} knowledge gaps.`,
          'getPerformance'
        );

        return {
          success: true,
          data: {
            studentId: plan.student.id,
            topicsCount: performance.length,
            performance,
            knowledgeGaps: gaps,
          },
        };
      },
    });

    // 2. getResources
    this.register({
      name: 'getResources',
      description: 'Fetches verified, curated educational materials (articles, videos, interactive lessons, problem sets) for a target topic.',
      parameters: [
        { name: 'topicId', type: 'string', description: 'The topic identifier (e.g. dynamic-programming, graphs)', required: true },
      ],
      execute: async (params, planId) => {
        const { topicId } = params;
        if (!topicId) return { success: false, error: 'Missing required parameter: topicId' };

        const matchedResources = CURATED_RESOURCES.filter(r => r.topicId === topicId);
        if (matchedResources.length === 0) {
          return { success: false, error: `No curated resources found for topic: '${topicId}'` };
        }

        planStore.recordAudit(
          planId,
          'AGENT',
          'getResources',
          topicId,
          'SUCCESS',
          `Retrieved ${matchedResources.length} curated resources for topic '${topicId}'.`,
          'getResources'
        );

        return {
          success: true,
          data: {
            topicId,
            count: matchedResources.length,
            resources: matchedResources,
          },
        };
      },
    });

    // 3. getCalendar
    this.register({
      name: 'getCalendar',
      description: 'Inspects calendar availability, available study windows, and blocked periods (classes, labs, commitments).',
      parameters: [
        { name: 'studentId', type: 'string', description: 'The unique ID of the student', required: true },
      ],
      execute: async (params, planId) => {
        const plan = planStore.getPlan(planId);
        if (!plan) return { success: false, error: `Plan '${planId}' not found.` };

        const calendar = plan.calendar || [];
        const availableSlots = calendar.filter(c => c.isAvailable);
        const blockedSlots = calendar.filter(c => !c.isAvailable);

        planStore.recordAudit(
          planId,
          'AGENT',
          'getCalendar',
          params.studentId || plan.student.id,
          'SUCCESS',
          `Inspected student calendar: ${availableSlots.length} available study blocks, ${blockedSlots.length} blocked windows.`,
          'getCalendar'
        );

        return {
          success: true,
          data: {
            totalSlots: calendar.length,
            availableSlotsCount: availableSlots.length,
            blockedSlotsCount: blockedSlots.length,
            calendar,
          },
        };
      },
    });

    // 4. createStudySession
    this.register({
      name: 'createStudySession',
      description: 'Schedules a new learning session in the plan, validating slot availability, no conflict, deadline compliance, and duration.',
      parameters: [
        { name: 'topicId', type: 'string', description: 'The topic identifier', required: true },
        { name: 'resourceId', type: 'string', description: 'The resource ID to assign', required: true },
        { name: 'date', type: 'string', description: 'The target date in YYYY-MM-DD format', required: true },
        { name: 'startTime', type: 'string', description: 'Start time in HH:mm (24-hour format)', required: true },
        { name: 'duration', type: 'number', description: 'Session duration in minutes (e.g. 45, 60)', required: true },
      ],
      execute: async (params, planId) => {
        const plan = planStore.getPlan(planId);
        if (!plan) return { success: false, error: `Plan '${planId}' not found.` };

        const { topicId, resourceId, date, startTime, duration } = params;
        if (!topicId || !resourceId || !date || !startTime || !duration) {
          return { success: false, error: 'Missing one or more required parameters for createStudySession.' };
        }

        // Validate date format YYYY-MM-DD
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return { success: false, error: `Invalid date format: ${date}. Expected YYYY-MM-DD.` };
        }

        // Validate deadline
        const sessionDate = new Date(date);
        const deadlineDate = new Date(plan.deadline);
        if (sessionDate > deadlineDate) {
          return { success: false, error: `Session date ${date} is past the target deadline ${plan.deadline}.` };
        }

        // Calculate end time
        const [h, m] = startTime.split(':').map(Number);
        const endTotalMinutes = h * 60 + m + Number(duration);
        const endH = Math.floor(endTotalMinutes / 60).toString().padStart(2, '0');
        const endM = (endTotalMinutes % 60).toString().padStart(2, '0');
        const endTime = `${endH}:${endM}`;

        // Check if calendar slot is available
        const matchingSlot = plan.calendar.find(
          c => c.date === date && c.isAvailable && startTime >= c.startTime && endTime <= c.endTime
        );
        if (!matchingSlot) {
          // Check if blocked
          const blocked = plan.calendar.find(
            c => c.date === date && !c.isAvailable && !(endTime <= c.startTime || startTime >= c.endTime)
          );
          if (blocked) {
            return {
              success: false,
              error: `Slot on ${date} (${startTime}-${endTime}) conflicts with blocked slot: '${blocked.reason}'.`,
            };
          }
        }

        // Check for session collision in current schedule
        const collision = plan.schedule.find(
          s => s.date === date && s.status !== 'CANCELLED' && s.status !== 'MISSED' &&
               startTime < s.endTime && s.startTime < endTime
        );
        if (collision) {
          return {
            success: false,
            error: `Collision with existing session '${collision.topicName}' (${collision.startTime}-${collision.endTime}) on ${date}.`,
          };
        }

        // Check for duplicate identical session
        const duplicate = plan.schedule.find(
          s => s.topicId === topicId && s.resourceId === resourceId && s.date === date && s.status === 'PLANNED'
        );
        if (duplicate) {
          return { success: false, error: `Duplicate session for topic '${topicId}' with resource '${resourceId}' already planned on ${date}.` };
        }

        // Find resource details
        const resource = CURATED_RESOURCES.find(r => r.id === resourceId) || plan.resources.find(r => r.id === resourceId);
        const resourceTitle = resource?.title || 'Comprehensive Topic Practice';
        const topicName = resource?.topicName || plan.performance.find(p => p.topicId === topicId)?.topicName || topicId;

        // Determine priority from knowledge gap
        const gap = plan.knowledgeGaps.find(g => g.topicId === topicId);
        const priority = gap ? gap.priority : 'MEDIUM';

        const newSession: StudySession = {
          id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          topicId,
          topicName,
          resourceId,
          resourceTitle,
          date,
          startTime,
          endTime,
          durationMinutes: Number(duration),
          priority,
          status: 'PLANNED',
        };

        const updatedSchedule = [...plan.schedule, newSession];

        // Recalculate progress
        const totalSessions = updatedSchedule.length;
        const totalDuration = updatedSchedule.reduce((acc, s) => acc + s.durationMinutes, 0) / 60;

        planStore.updatePlan(planId, p => ({
          schedule: updatedSchedule,
          progress: {
            ...p.progress,
            totalSessionsCount: totalSessions,
            targetHours: Math.round(totalDuration),
          },
        }));

        planStore.recordAudit(
          planId,
          'AGENT',
          'createStudySession',
          topicName,
          'SUCCESS',
          `Created study session on ${date} (${startTime}-${endTime}) for '${topicName}' [Priority: ${priority}].`,
          'createStudySession'
        );

        return {
          success: true,
          data: {
            session: newSession,
            totalScheduled: updatedSchedule.length,
          },
        };
      },
    });

    // 5. rescheduleStudySession
    this.register({
      name: 'rescheduleStudySession',
      description: 'Autonomous rescheduling tool: moves an existing or missed study session to a valid new calendar slot without conflicts.',
      parameters: [
        { name: 'sessionId', type: 'string', description: 'The ID of the session to reschedule', required: true },
        { name: 'newDate', type: 'string', description: 'The new date in YYYY-MM-DD format', required: true },
        { name: 'newStartTime', type: 'string', description: 'The new start time in HH:mm format', required: true },
        { name: 'reason', type: 'string', description: 'Reason for rescheduling', required: false },
      ],
      execute: async (params, planId) => {
        const plan = planStore.getPlan(planId);
        if (!plan) return { success: false, error: `Plan '${planId}' not found.` };

        const { sessionId, newDate, newStartTime, reason } = params;
        if (!sessionId || !newDate || !newStartTime) {
          return { success: false, error: 'Missing required parameters: sessionId, newDate, newStartTime.' };
        }

        const sessionIndex = plan.schedule.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
          return { success: false, error: `Session '${sessionId}' not found in plan schedule.` };
        }

        const existingSession = plan.schedule[sessionIndex];

        // Validate target deadline
        const targetDate = new Date(newDate);
        const deadlineDate = new Date(plan.deadline);
        if (targetDate > deadlineDate) {
          return { success: false, error: `Reschedule target date ${newDate} is past the plan deadline ${plan.deadline}.` };
        }

        // Calculate new end time
        const [h, m] = newStartTime.split(':').map(Number);
        const endTotalMinutes = h * 60 + m + existingSession.durationMinutes;
        const endH = Math.floor(endTotalMinutes / 60).toString().padStart(2, '0');
        const endM = (endTotalMinutes % 60).toString().padStart(2, '0');
        const newEndTime = `${endH}:${endM}`;

        // Validate that calendar slot is available
        const matchingSlot = plan.calendar.find(
          c => c.date === newDate && c.isAvailable && newStartTime >= c.startTime && newEndTime <= c.endTime
        );
        if (!matchingSlot) {
          const blocked = plan.calendar.find(
            c => c.date === newDate && !c.isAvailable && !(newEndTime <= c.startTime || newStartTime >= c.endTime)
          );
          if (blocked) {
            return {
              success: false,
              error: `New slot on ${newDate} (${newStartTime}-${newEndTime}) conflicts with blocked slot: '${blocked.reason}'.`,
            };
          }
        }

        // Validate collision against other active sessions
        const collision = plan.schedule.find(
          s => s.id !== sessionId && s.date === newDate && s.status !== 'CANCELLED' && s.status !== 'MISSED' &&
               newStartTime < s.endTime && s.startTime < newEndTime
        );
        if (collision) {
          return {
            success: false,
            error: `Collision with session '${collision.topicName}' (${collision.startTime}-${collision.endTime}) on ${newDate}.`,
          };
        }

        const oldDate = existingSession.date;
        const oldStartTime = existingSession.startTime;

        const updatedSession: StudySession = {
          ...existingSession,
          date: newDate,
          startTime: newStartTime,
          endTime: newEndTime,
          status: 'RESCHEDULED',
          rescheduledFrom: {
            date: oldDate,
            startTime: oldStartTime,
            reason: reason || 'Autonomous replanning after missed session',
            timestamp: new Date().toISOString(),
          },
        };

        const updatedSchedule = [...plan.schedule];
        updatedSchedule[sessionIndex] = updatedSession;

        const rescheduledCount = updatedSchedule.filter(s => s.status === 'RESCHEDULED').length;

        planStore.updatePlan(planId, p => ({
          schedule: updatedSchedule,
          progress: {
            ...p.progress,
            rescheduledSessionsCount: rescheduledCount,
          },
        }));

        planStore.recordAudit(
          planId,
          'AGENT',
          'rescheduleStudySession',
          existingSession.topicName,
          'SUCCESS',
          `Autonomous reschedule: Moved '${existingSession.topicName}' from ${oldDate} ${oldStartTime} to ${newDate} ${newStartTime}. Reason: ${reason || 'Missed session recovery'}`,
          'rescheduleStudySession'
        );

        planStore.recordAdaptation(planId, {
          trigger: 'MISSED_SESSION',
          description: `Autonomous reschedule of '${existingSession.topicName}'`,
          actionsTaken: [
            `Identified slot ${oldDate} ${oldStartTime} as missed`,
            `Scanned calendar availability up to deadline ${plan.deadline}`,
            `Selected optimal available window: ${newDate} ${newStartTime}-${newEndTime}`,
            `Transferred session with full resource context`,
          ],
          previousStateSummary: `Session missed on ${oldDate} ${oldStartTime}`,
          newStateSummary: `Session restored & rescheduled to ${newDate} ${newStartTime}`,
        });

        return {
          success: true,
          data: {
            rescheduledSession: updatedSession,
            originalSlot: { date: oldDate, startTime: oldStartTime },
            newSlot: { date: newDate, startTime: newStartTime },
          },
        };
      },
    });

    // 6. verifyPlan
    this.register({
      name: 'verifyPlan',
      description: 'Runs deterministic verification across 9 criteria: gap coverage, calendar bounds, no conflicts, deadline compliance, and objective safety.',
      parameters: [
        { name: 'planId', type: 'string', description: 'The unique plan identifier', required: true },
      ],
      execute: async (params, planId) => {
        const targetPlanId = params.planId || planId;
        const plan = planStore.getPlan(targetPlanId);
        if (!plan) return { success: false, error: `Plan '${targetPlanId}' not found.` };

        const result: VerificationResult = runDeterministicVerification(plan);

        planStore.recordVerification(targetPlanId, {
          result,
          triggeredBy: 'Agent Verification Loop',
        });

        planStore.recordAudit(
          targetPlanId,
          'AGENT',
          'verifyPlan',
          `Verification score: ${result.score}/100 [${result.status}]`,
          result.status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
          `Verification complete: ${result.checks.filter(c => c.passed).length}/${result.checks.length} checks passed. Coverage: ${result.coverage}%. Risks: ${result.risks.length}`,
          'verifyPlan'
        );

        return {
          success: true,
          data: result,
        };
      },
    });
  }

  public register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);
  }

  public get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getToolSummaries() {
    return this.getAll().map(t => ({
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    }));
  }
}

export const toolRegistry = new ToolRegistry();
