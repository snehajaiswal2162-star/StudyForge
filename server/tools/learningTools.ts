import {
  CalendarSlot,
  KnowledgeGap,
  PlanConstraints,
  PlanState,
  StudySession,
  TopicPerformance,
  VerificationCheckItem,
  VerificationResult,
} from '../../shared/types';
import { CURATED_RESOURCES } from '../simulation/curriculumGenerator';

/**
 * Deterministically computes knowledge gaps from performance scores
 */
export function calculateKnowledgeGaps(performance: TopicPerformance[]): KnowledgeGap[] {
  const gaps: KnowledgeGap[] = [];

  for (const item of performance) {
    let severity: KnowledgeGap['severity'] | null = null;
    let priority: KnowledgeGap['priority'] = 'LOW';
    let recommendedHours = 0;
    let deficitDescription = '';

    if (item.score < 50) {
      severity = 'CRITICAL';
      priority = 'HIGH';
      recommendedHours = 6;
      deficitDescription = `Severe conceptual and implementation deficiency in ${item.topicName}. Urgent prerequisite for interview placement.`;
    } else if (item.score < 65) {
      severity = 'HIGH';
      priority = 'HIGH';
      recommendedHours = 4.5;
      deficitDescription = `Significant gaps in intermediate patterns and edge cases in ${item.topicName}.`;
    } else if (item.score < 75) {
      severity = 'MEDIUM';
      priority = 'MEDIUM';
      recommendedHours = 3;
      deficitDescription = `Moderate understanding of ${item.topicName}; requires practice on non-standard variations.`;
    } else if (item.score < 85) {
      severity = 'LOW';
      priority = 'LOW';
      recommendedHours = 1.5;
      deficitDescription = `Minor gaps or occasional recall latency in ${item.topicName}; light revision recommended.`;
    }

    if (severity) {
      gaps.push({
        gapId: `gap-${item.topicId}`,
        topicId: item.topicId,
        topicName: item.topicName,
        score: item.score,
        severity,
        priority,
        recommendedHours,
        deficitDescription,
      });
    }
  }

  // Sort: High priority first, then lowest score
  return gaps.sort((a, b) => {
    const pWeight = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    if (pWeight[b.priority] !== pWeight[a.priority]) {
      return pWeight[b.priority] - pWeight[a.priority];
    }
    return a.score - b.score;
  });
}

/**
 * Helper to compute total planned hours for a given topic
 */
export function getPlannedHoursForTopic(schedule: StudySession[], topicId: string): number {
  return schedule
    .filter(s => s.topicId === topicId && s.status !== 'CANCELLED' && s.status !== 'MISSED')
    .reduce((sum, s) => sum + (s.durationMinutes / 60), 0);
}

/**
 * Deterministic Verification Engine checking all 9 required criteria
 */
export function runDeterministicVerification(
  plan: Pick<PlanState, 'deadline' | 'constraints' | 'knowledgeGaps' | 'schedule' | 'calendar' | 'resources'>
): VerificationResult {
  const checks: VerificationCheckItem[] = [];
  const conflicts: string[] = [];
  const risks: string[] = [];

  const schedule = plan.schedule || [];
  const calendar = plan.calendar || [];
  const gaps = plan.knowledgeGaps || [];
  const deadline = new Date(plan.deadline);

  // 1. High-priority knowledge gap coverage
  const highPriorityGaps = gaps.filter(g => g.priority === 'HIGH');
  let highPriorityCovered = 0;
  let uncoveredHighGaps = 0;

  for (const gap of highPriorityGaps) {
    const plannedHours = getPlannedHoursForTopic(schedule, gap.topicId);
    if (plannedHours >= 1) {
      highPriorityCovered++;
    } else {
      uncoveredHighGaps++;
      risks.push(`High priority deficit topic '${gap.topicName}' has insufficient study allocation (${plannedHours.toFixed(1)}h).`);
    }
  }

  const coveragePercent = highPriorityGaps.length > 0
    ? Math.round((highPriorityCovered / highPriorityGaps.length) * 94)
    : 100;

  checks.push({
    id: 'check-gap-coverage',
    name: 'Knowledge Gap Allocation',
    passed: uncoveredHighGaps === 0,
    details: `${coveragePercent}% of high-priority knowledge gaps addressed. ${uncoveredHighGaps} high-priority topics under-allocated.`,
  });

  // 2. Calendar Slot Feasibility
  let calendarViolations = 0;
  for (const session of schedule) {
    if (session.status === 'CANCELLED' || session.status === 'MISSED') continue;

    const matchingSlot = calendar.find(c => c.date === session.date && c.isAvailable && session.startTime >= c.startTime && session.endTime <= c.endTime);
    if (!matchingSlot) {
      // Check if session falls on explicitly unavailable slot
      const unavailableSlot = calendar.find(c => c.date === session.date && !c.isAvailable && !(session.endTime <= c.startTime || session.startTime >= c.endTime));
      if (unavailableSlot) {
        calendarViolations++;
        conflicts.push(`Session on ${session.date} (${session.startTime}-${session.endTime}) conflicts with blocked slot: '${unavailableSlot.reason}'.`);
      }
    }
  }

  checks.push({
    id: 'check-calendar-feasibility',
    name: 'Calendar Feasibility',
    passed: calendarViolations === 0,
    details: calendarViolations === 0 ? 'All sessions fit designated available study windows.' : `${calendarViolations} sessions overlap with unavailable times.`,
  });

  // 3. No Overlapping Sessions
  let overlapCount = 0;
  for (let i = 0; i < schedule.length; i++) {
    for (let j = i + 1; j < schedule.length; j++) {
      const s1 = schedule[i];
      const s2 = schedule[j];
      if (s1.status === 'CANCELLED' || s1.status === 'MISSED' || s2.status === 'CANCELLED' || s2.status === 'MISSED') continue;

      if (s1.date === s2.date) {
        const s1Start = s1.startTime;
        const s1End = s1.endTime;
        const s2Start = s2.startTime;
        const s2End = s2.endTime;

        if (s1Start < s2End && s2Start < s1End) {
          overlapCount++;
          conflicts.push(`Scheduling overlap on ${s1.date} between '${s1.topicName}' (${s1Start}-${s1End}) and '${s2.topicName}' (${s2Start}-${s2End}).`);
        }
      }
    }
  }

  checks.push({
    id: 'check-no-conflicts',
    name: 'No Overlapping Sessions',
    passed: overlapCount === 0,
    details: overlapCount === 0 ? 'Zero concurrent or colliding study sessions.' : `${overlapCount} session collisions detected.`,
  });

  // 4. Sessions Occur Before Deadline
  let postDeadlineSessions = 0;
  for (const session of schedule) {
    if (session.status === 'CANCELLED') continue;
    const sessionDate = new Date(session.date);
    if (sessionDate > deadline) {
      postDeadlineSessions++;
      risks.push(`Session '${session.topicName}' on ${session.date} exceeds target deadline (${plan.deadline}).`);
    }
  }

  checks.push({
    id: 'check-deadline',
    name: 'Deadline Compliance',
    passed: postDeadlineSessions === 0,
    details: postDeadlineSessions === 0 ? `All sessions scheduled before target deadline (${plan.deadline}).` : `${postDeadlineSessions} sessions scheduled past deadline.`,
  });

  // 5. Learning Resources Exist
  const knownResourceIds = new Set(CURATED_RESOURCES.map(r => r.id));
  (plan.resources || []).forEach(r => knownResourceIds.add(r.id));
  let invalidResources = 0;

  for (const session of schedule) {
    if (!knownResourceIds.has(session.resourceId)) {
      invalidResources++;
      risks.push(`Session '${session.topicName}' references unknown resource ID '${session.resourceId}'.`);
    }
  }

  checks.push({
    id: 'check-resources',
    name: 'Curated Resource Integrity',
    passed: invalidResources === 0,
    details: invalidResources === 0 ? 'All sessions bound to verified educational resources.' : `${invalidResources} sessions link to missing resources.`,
  });

  // 6. Required study time fits remaining capacity
  const totalGapHoursNeeded = gaps.reduce((sum, g) => sum + g.recommendedHours, 0);
  const totalAvailableCalendarHours = calendar
    .filter(c => c.isAvailable && new Date(c.date) <= deadline)
    .reduce((sum, c) => {
      const [sh, sm] = c.startTime.split(':').map(Number);
      const [eh, em] = c.endTime.split(':').map(Number);
      return sum + ((eh * 60 + em) - (sh * 60 + sm)) / 60;
    }, 0);

  const capacityExceeded = totalGapHoursNeeded > totalAvailableCalendarHours;
  if (capacityExceeded) {
    risks.push(`Remaining required study time (${totalGapHoursNeeded.toFixed(1)}h) exceeds total available calendar capacity (${totalAvailableCalendarHours.toFixed(1)}h) before deadline.`);
  }

  checks.push({
    id: 'check-capacity',
    name: 'Study Capacity Feasibility',
    passed: !capacityExceeded,
    details: `Total available capacity is ${totalAvailableCalendarHours.toFixed(1)}h; gap requirement is ${totalGapHoursNeeded.toFixed(1)}h.`,
  });

  // 7. Missed Sessions Handled
  const unhandledMissed = schedule.filter(s => s.status === 'MISSED');
  const hasUnhandledMissed = unhandledMissed.length > 0;
  if (hasUnhandledMissed) {
    risks.push(`${unhandledMissed.length} session(s) marked as MISSED require autonomous rescheduling.`);
  }

  checks.push({
    id: 'check-missed-handled',
    name: 'Missed Session Resolution',
    passed: !hasUnhandledMissed,
    details: hasUnhandledMissed ? `${unhandledMissed.length} missed sessions pending rescheduling.` : 'All missed sessions successfully rescheduled or resolved.',
  });

  // 8. Original Learning Objective Achievable
  const deadlineSatisfied = postDeadlineSessions === 0 && !capacityExceeded;
  const isGoalAchievable = coveragePercent >= 70 && deadlineSatisfied && overlapCount === 0;

  checks.push({
    id: 'check-goal-achievability',
    name: 'Goal Achievability',
    passed: isGoalAchievable,
    details: isGoalAchievable ? 'Target objective is feasible under current pacing.' : 'Goal at risk due to capacity deficit or low gap coverage.',
  });

  // 9. No Impossible Scheduling State
  const impossibleState = calendarViolations > 0 || overlapCount > 0 || capacityExceeded;
  checks.push({
    id: 'check-state-consistency',
    name: 'State Consistency',
    passed: !impossibleState,
    details: impossibleState ? 'Inconsistent scheduling state detected.' : 'Plan state is internally consistent and verified.',
  });

  // Determine overall status & health score
  const passedChecksCount = checks.filter(c => c.passed).length;
  const verificationScore = Math.round((passedChecksCount / checks.length) * 100);

  const isVerified = verificationScore >= 80 && conflicts.length === 0 && !capacityExceeded && !hasUnhandledMissed;
  const status = isVerified ? 'VERIFIED' : 'AT_RISK';

  return {
    status,
    score: verificationScore,
    coverage: coveragePercent,
    deadlineSatisfied,
    conflicts,
    risks,
    checks,
    timestamp: new Date().toISOString(),
  };
}
