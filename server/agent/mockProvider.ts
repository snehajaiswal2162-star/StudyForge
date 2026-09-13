import { LLMDecision, LLMProvider } from './types';
import {
  AssessmentQuestion,
  LessonAssessment,
  PlanState,
  StudySession,
} from '../../shared/types';
import { CURATED_RESOURCES } from '../simulation/curriculumGenerator';

export class MockProvider implements LLMProvider {
  public readonly name = 'MockProvider';

  public async generateLessonAssessment(
  plan: PlanState,
  session: StudySession,
  attempt: number = 1,
  previousQuestions: AssessmentQuestion[] = []
): Promise<LessonAssessment> {
  const subject = plan.subject || plan.goal;
  const topic = session.topicName;

  const questionSets = [
    [
      `What is the main purpose of ${topic} in ${subject}?`,
      `Which statement best explains the core idea of ${topic}?`,
      `Which situation demonstrates correct understanding of ${topic}?`,
      `Why is ${topic} relevant to the learning goal?`,
      `Which approach is most appropriate when applying ${topic}?`,
      `What is a useful way to practice ${topic}?`,
      `Which result would indicate good understanding of ${topic}?`,
      `How can knowledge of ${topic} be applied to a new problem?`,
    ],
    [
      `A learner has studied ${topic}. Which action best tests their understanding?`,
      `Which example would best demonstrate practical knowledge of ${topic}?`,
      `What should a learner focus on when reviewing ${topic}?`,
      `Which statement about ${topic} is most accurate?`,
      `How would you apply ${topic} in a practical situation?`,
      `Which mistake should a learner avoid when working with ${topic}?`,
      `What is the best next step after learning ${topic}?`,
      `Which activity would strengthen ${topic} mastery most effectively?`,
    ],
    [
      `Which scenario requires knowledge of ${topic}?`,
      `What would be the strongest evidence that ${topic} has been mastered?`,
      `Which strategy best helps solve a problem involving ${topic}?`,
      `What is the key concept a learner should remember about ${topic}?`,
      `Which approach would improve performance on ${topic}?`,
      `How can a learner verify their understanding of ${topic}?`,
      `Which situation shows successful application of ${topic}?`,
      `Why should ${topic} be connected with practical examples?`,
    ],
  ];

  const normalizedAttempt = Math.max(1, attempt);
  const setIndex = (normalizedAttempt - 1) % questionSets.length;
  const variant = Math.floor((normalizedAttempt - 1) / questionSets.length) + 1;
  const selectedQuestions = questionSets[setIndex];

  const questions: AssessmentQuestion[] = selectedQuestions.map(
    (question, index) => ({
      id: `lesson-${session.id}-attempt-${attempt}-q-${index + 1}`,
      topicId: session.topicId,
      topicName: topic,
      question: `${question} Assessment variant ${variant}.`,
      options: [
        `Correct application of ${topic}`,
        `An unrelated approach`,
        `Ignoring the core concept`,
        `Avoiding practical application`,
      ],
      correctOptionIndex: 0,
      explanation: `This question checks understanding of ${topic} within ${subject}.`,
      difficulty:
        index % 3 === 0
          ? 'Easy'
          : index % 3 === 1
            ? 'Medium'
            : 'Hard',
    })
  );

  return {
    id: `lesson-assessment-${session.id}-${Date.now()}`,
    sessionId: session.id,
    topicId: session.topicId,
    topicName: topic,
    questions,
    attempt,
    generatedAt: new Date().toISOString(),
  };
}

  public async generateDecision(context: {
    planState: PlanState;
    availableTools: Array<{ name: string; description: string; parameters: any[] }>;
    stepCount: number;
    history: Array<{ action: string; result: any }>;
    trigger?: string;
  }): Promise<LLMDecision> {
    const { planState, trigger, history } = context;

    // SCENARIO 1: Missed Session Adaptation Trigger
    const missedSession = (planState.schedule || []).find(s => s.status === 'MISSED');
    if (missedSession) {
      // Find an available calendar slot strictly after the missed session date that doesn't have an active session
      const availableSlot = (planState.calendar || []).find(c => {
        if (!c.isAvailable) return false;
        if (c.date < missedSession.date) return false;

        // Check if there is already a session scheduled in this slot
        const hasCollision = (planState.schedule || []).some(
          s => s.date === c.date && s.status !== 'CANCELLED' && s.status !== 'MISSED'
        );
        return !hasCollision;
      });

      if (availableSlot) {
        return {
          type: 'RESCHEDULE_SESSION',
          tool: 'rescheduleStudySession',
          parameters: {
            sessionId: missedSession.id,
            newDate: availableSlot.date,
            newStartTime: availableSlot.startTime,
            reason: `Autonomous replanning: Recovering lost study time for critical topic '${missedSession.topicName}'.`,
          },
          reason: `Detected missed session '${missedSession.topicName}' from ${missedSession.date}. Found viable open window on ${availableSlot.date} at ${availableSlot.startTime}.`,
          objective: 'recover_missed_study_time',
        };
      } else {
        return {
          type: 'FLAG_RISK',
          reason: `Cannot reschedule missed session '${missedSession.topicName}': No remaining calendar availability before deadline.`,
          objective: 'flag_unresolvable_missed_session',
        };
      }
    }

    // SCENARIO 2: Capacity Deficit / At-Risk Check
    if (trigger === 'CAPACITY_REDUCTION' || trigger === 'AT_RISK_SIMULATION') {
      const availableHours = (planState.calendar || [])
        .filter(c => c.isAvailable)
        .reduce((sum, c) => {
          const [sh, sm] = c.startTime.split(':').map(Number);
          const [eh, em] = c.endTime.split(':').map(Number);
          return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
        }, 0);

      const requiredHours = (planState.knowledgeGaps || []).reduce((sum, g) => sum + g.recommendedHours, 0);

      if (availableHours < requiredHours) {
        return {
          type: 'FLAG_RISK',
          reason: `Remaining required study time (${requiredHours}h) exceeds available calendar capacity (${availableHours}h) before the deadline.`,
          objective: 'prevent_impossible_schedule',
        };
      }
    }

    // SCENARIO 3: If schedule was recently updated and verification hasn't run
    const lastAction = history[history.length - 1];
    if (lastAction && (lastAction.action === 'rescheduleStudySession' || lastAction.action === 'createStudySession')) {
      return {
        type: 'VERIFY_PLAN',
        tool: 'verifyPlan',
        parameters: { planId: planState.planId },
        reason: 'Schedule state mutated. Re-verifying full plan constraints and objective feasibility.',
        objective: 'verify_schedule_integrity',
      };
    }

    // SCENARIO 4: Initial Plan Generation Sequence
    // Step A: Inspect performance & derive gaps
    if (planState.planId === 'plan-sneha-dsa' && (!planState.knowledgeGaps || planState.knowledgeGaps.length === 0)) {
      return {
        type: 'CALL_TOOL',
        tool: 'getPerformance',
        parameters: { studentId: planState.student.id },
        reason: 'Need diagnostic baseline performance data to identify student knowledge gaps.',
        objective: 'collect_performance',
      };
    }

    // Step B: Inspect calendar constraints
    if (!planState.calendar || planState.calendar.length === 0) {
      return {
        type: 'CALL_TOOL',
        tool: 'getCalendar',
        parameters: { studentId: planState.student.id },
        reason: 'Must determine student weekly study windows and blocked periods before proposing sessions.',
        objective: 'map_availability',
      };
    }

    // Generic plans use only the subject-aware topics and resources stored on their PlanState.
    if (planState.planId !== 'plan-sneha-dsa') {
      const priorityGap = (planState.knowledgeGaps || [])[0];
      if (priorityGap && !(planState.resources || []).some(r => r.topicId === priorityGap.topicId)) {
        return {
          type: 'CALL_TOOL',
          tool: 'getResources',
          parameters: { topicId: priorityGap.topicId },
          reason: `Retrieving learning resources for the student's highest-priority ${planState.subject || 'subject'} gap: ${priorityGap.topicName}.`,
          objective: 'fetch_subject_materials',
        };
      }

      const unscheduledGap = (planState.knowledgeGaps || []).find(g => !planState.schedule.some(s => s.topicId === g.topicId && s.status !== 'MISSED' && s.status !== 'CANCELLED'));
      const unscheduledResource = !unscheduledGap
        ? (planState.resources || []).find(resource => !planState.schedule.some(s => s.topicId === resource.topicId && s.status !== 'MISSED' && s.status !== 'CANCELLED'))
        : undefined;
      const availableSlot = (planState.calendar || []).find(slot => slot.isAvailable && (!planState.availableDays || planState.availableDays.includes(slot.dayOfWeek)) && !planState.schedule.some(s => s.date === slot.date && s.status !== 'MISSED' && s.status !== 'CANCELLED'));
      const topicId = unscheduledGap?.topicId || unscheduledResource?.topicId;
      const resource = topicId && (planState.resources || []).find(r => r.topicId === topicId);
      if (topicId && availableSlot && resource && planState.schedule.length < 5) {
        return {
          type: 'SCHEDULE_SESSION',
          tool: 'createStudySession',
          parameters: {
            topicId,
            resourceId: resource.id,
            date: availableSlot.date,
            startTime: availableSlot.startTime,
            duration: planState.constraints.sessionDurationMinutes,
          },
          reason: `Scheduling ${unscheduledGap?.topicName || resource.topicName || topicId} for the student's ${planState.subject || 'subject'} plan using available diagnostic and curriculum evidence.`,
          objective: 'schedule_subject_priority',
        };
      }

      const hasUnverifiedSessions = planState.schedule.length > 0 && (!planState.verificationEvents?.length || planState.status === 'DRAFT');
      if (hasUnverifiedSessions) {
        return {
          type: 'VERIFY_PLAN',
          tool: 'verifyPlan',
          parameters: { planId: planState.planId },
          reason: 'Subject-specific schedule changed. Re-verifying feasibility and constraints.',
          objective: 'verify_subject_schedule',
        };
      }

      return {
        type: 'COMPLETE',
        reason: `The ${planState.subject || 'subject'} plan is in active monitoring state with ${planState.schedule.length} sessions scheduled.`,
        objective: 'monitor_subject_plan',
      };
    }

    // Step C: If resources not yet retrieved for critical topic
    const hasDpResources = (planState.resources || []).some(r => r.topicId === 'dynamic-programming');
    if (!hasDpResources) {
      return {
        type: 'CALL_TOOL',
        tool: 'getResources',
        parameters: { topicId: 'dynamic-programming' },
        reason: 'Dynamic Programming is the highest deficit topic (score 38). Retrieving curated learning modules.',
        objective: 'fetch_priority_materials',
      };
    }

    // Step D: Propose study sessions for high priority gaps if schedule is empty
    const scheduleCount = (planState.schedule || []).filter(s => s.status !== 'CANCELLED').length;
    if (scheduleCount < 5) {
      // Slot 1: Dynamic Programming on first available Tuesday
      if (!planState.schedule.some(s => s.topicId === 'dynamic-programming')) {
        const slot = planState.calendar.find(c => c.isAvailable && c.dayOfWeek === 'Tuesday');
        const res = CURATED_RESOURCES.find(r => r.topicId === 'dynamic-programming');
        if (slot && res) {
          return {
            type: 'SCHEDULE_SESSION',
            tool: 'createStudySession',
            parameters: {
              topicId: 'dynamic-programming',
              resourceId: res.id,
              date: slot.date,
              startTime: slot.startTime,
              duration: 60,
            },
            reason: 'Dynamic Programming (Score: 38, Critical) requires immediate foundational study.',
            objective: 'strengthen_highest_gap',
          };
        }
      }

      // Slot 2: Graphs on Wednesday
      if (!planState.schedule.some(s => s.topicId === 'graphs')) {
        const slot = planState.calendar.find(c => c.isAvailable && c.dayOfWeek === 'Wednesday');
        const res = CURATED_RESOURCES.find(r => r.topicId === 'graphs');
        if (slot && res) {
          return {
            type: 'SCHEDULE_SESSION',
            tool: 'createStudySession',
            parameters: {
              topicId: 'graphs',
              resourceId: res.id,
              date: slot.date,
              startTime: slot.startTime,
              duration: 60,
            },
            reason: 'Graphs (Score: 45, Critical) requires BFS/DFS traversal conceptual practice.',
            objective: 'strengthen_graph_gap',
          };
        }
      }

      // Slot 3: Recursion on Thursday
      if (!planState.schedule.some(s => s.topicId === 'recursion')) {
        const slot = planState.calendar.find(c => c.isAvailable && c.dayOfWeek === 'Thursday');
        const res = CURATED_RESOURCES.find(r => r.topicId === 'recursion');
        if (slot && res) {
          return {
            type: 'SCHEDULE_SESSION',
            tool: 'createStudySession',
            parameters: {
              topicId: 'recursion',
              resourceId: res.id,
              date: slot.date,
              startTime: slot.startTime,
              duration: 60,
            },
            reason: 'Recursion (Score: 52, High Priority) is essential for mastering tree and backtracking problems.',
            objective: 'strengthen_recursion_gap',
          };
        }
      }

      // Slot 4: Trees on Saturday
      if (!planState.schedule.some(s => s.topicId === 'trees')) {
        const slot = planState.calendar.find(c => c.isAvailable && c.dayOfWeek === 'Saturday');
        const res = CURATED_RESOURCES.find(r => r.topicId === 'trees');
        if (slot && res) {
          return {
            type: 'SCHEDULE_SESSION',
            tool: 'createStudySession',
            parameters: {
              topicId: 'trees',
              resourceId: res.id,
              date: slot.date,
              startTime: slot.startTime,
              duration: 60,
            },
            reason: 'Trees (Score: 61, High Priority) traversal and BST balance invariants.',
            objective: 'strengthen_trees_gap',
          };
        }
      }

      // Slot 5: DP Problem Set on Sunday
      const dpSessions = planState.schedule.filter(s => s.topicId === 'dynamic-programming');
      if (dpSessions.length === 1) {
        const slot = planState.calendar.find(c => c.isAvailable && c.dayOfWeek === 'Sunday');
        const res = CURATED_RESOURCES.find(r => r.topicId === 'dynamic-programming' && r.type === 'Problem Set') || CURATED_RESOURCES[2];
        if (slot && res) {
          return {
            type: 'SCHEDULE_SESSION',
            tool: 'createStudySession',
            parameters: {
              topicId: 'dynamic-programming',
              resourceId: res.id,
              date: slot.date,
              startTime: slot.startTime,
              duration: 60,
            },
            reason: 'Dynamic Programming second session: Transition from memoization to classic knapsack patterns.',
            objective: 'reinforce_dp_mastery',
          };
        }
      }
    }

    // Step E: Run Final Verification
    const hasUnverifiedSessions = planState.schedule.length > 0 && 
      (!planState.verificationEvents || planState.verificationEvents.length === 0 || planState.status === 'DRAFT');
    if (hasUnverifiedSessions) {
      return {
        type: 'VERIFY_PLAN',
        tool: 'verifyPlan',
        parameters: { planId: planState.planId },
        reason: 'Schedule generated for high priority gaps. Executing deterministic verification across all constraints.',
        objective: 'verify_new_schedule',
      };
    }

    // Otherwise, all steps complete!
    return {
      type: 'COMPLETE',
      reason: `Plan is in active monitoring state. All ${planState.schedule.length} sessions scheduled and verified.`,
      objective: 'monitor_plan_execution',
    };
  }
}

export const mockProvider = new MockProvider();
