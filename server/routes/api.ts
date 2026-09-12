import { Router, Request, Response } from 'express';
import { agentOrchestrator } from '../agent/agentOrchestrator';
import { CURATED_RESOURCES, generateSyntheticCalendar, getSyntheticPerformance } from '../simulation/curriculumGenerator';
import { ASSESSMENT_QUESTIONS, gradeQuizSubmission } from '../simulation/assessmentData';
import { planStore } from '../store/planStore';
import { toolRegistry } from '../tools/toolRegistry';
import { calculateKnowledgeGaps, runDeterministicVerification } from '../tools/learningTools';
import { PlanConstraints, PlanState, StudentProfile } from '../../shared/types';

export const apiRouter = Router();

// GET /api/health
apiRouter.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StudyForge Autonomous Agent Core',
    version: '1.0.0',
  });
});

// GET /api/status
apiRouter.get('/status', (req: Request, res: Response) => {
  const plans = planStore.getAllPlans();
  res.json({
    activePlansCount: plans.length,
    activeProvider: process.env.GEMINI_API_KEY ? 'Gemini' : 'MockProvider',
    registeredTools: toolRegistry.getToolSummaries().map(t => t.name),
  });
});

// GET /api/plan/:id
apiRouter.get('/plan/:id', (req: Request, res: Response) => {
  const plan = planStore.getPlan(req.params.id);
  if (!plan) {
    return res.status(404).json({ error: `Plan '${req.params.id}' not found.` });
  }
  return res.json(plan);
});

// POST /api/plan/create (from Onboarding)
apiRouter.post('/plan/create', async (req: Request, res: Response) => {
  const { student, goal, deadline, constraints, autoRunAgent, onboardingProfile } = req.body;

  const planId = `plan-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const studentProfile: StudentProfile = {
    id: student?.id || `student-${Date.now()}`,
    name: student?.name || 'Sneha Sharma',
    email: student?.email || 'sneha@studyforge.ai',
    targetGoal: goal || 'Master Data Structures & Algorithms before campus placements.',
    currentLevel: student?.currentLevel || 'Intermediate',
  };

  const planConstraints: PlanConstraints = {
    availableHoursPerWeek: constraints?.availableHoursPerWeek || 12,
    preferredDailyHours: constraints?.preferredDailyHours || 1.5,
    availableDays: constraints?.availableDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Saturday', 'Sunday'],
    maxSessionsPerDay: constraints?.maxSessionsPerDay || 2,
    sessionDurationMinutes: constraints?.sessionDurationMinutes || 60,
  };

  const performance = getSyntheticPerformance(studentProfile.id);
  const knowledgeGaps = calculateKnowledgeGaps(performance);
  const calendar = generateSyntheticCalendar('2026-09-14', 4);

  const newPlan: PlanState = {
    planId,
    student: studentProfile,
    goal: studentProfile.targetGoal,
    deadline: deadline || '2026-10-15',
    constraints: planConstraints,
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
    auditLog: [],
    status: 'DRAFT',
    riskLevel: 'LOW',
    activeProvider: process.env.GEMINI_API_KEY ? 'Gemini' : 'MockProvider',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    onboardingProfile,
  };

  planStore.setPlan(newPlan);

  planStore.recordAudit(
    planId,
    'STUDENT',
    'CREATE_PLAN',
    newPlan.goal,
    'SUCCESS',
    `Created new autonomous study plan targeting deadline ${newPlan.deadline}.`
  );

  if (autoRunAgent) {
    try {
      await agentOrchestrator.runLoop(planId, 'INITIAL_ONBOARDING_PLAN_CREATION');
    } catch (err: any) {
      console.error('Agent error during initial plan run:', err);
    }
  }

  const finalizedPlan = planStore.getPlan(planId);
  return res.status(201).json(finalizedPlan);
});

// POST /api/plan/:id/run-agent
apiRouter.post('/plan/:id/run-agent', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { trigger } = req.body;

  try {
    const result = await agentOrchestrator.runLoop(id, trigger || 'MANUAL_USER_TRIGGER');
    const updatedPlan = planStore.getPlan(id);
    return res.json({ result, plan: updatedPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Agent orchestration failed.' });
  }
});

// POST /api/plan/:id/adapt
apiRouter.post('/plan/:id/adapt', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { trigger, reason } = req.body;

  try {
    const result = await agentOrchestrator.runLoop(id, trigger || 'ADAPTATION_TRIGGER');
    const updatedPlan = planStore.getPlan(id);
    return res.json({ result, plan: updatedPlan });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Plan adaptation failed.' });
  }
});

// POST /api/plan/:id/verify
apiRouter.post('/plan/:id/verify', (req: Request, res: Response) => {
  const plan = planStore.getPlan(req.params.id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  const verification = runDeterministicVerification(plan);
  planStore.recordVerification(plan.planId, {
    result: verification,
    triggeredBy: 'Manual Verification Request',
  });

  const updatedPlan = planStore.getPlan(req.params.id);
  return res.json({ verification, plan: updatedPlan });
});

// POST /api/plan/:id/simulate-capacity-drop (At-Risk Scenario)
apiRouter.post('/plan/:id/simulate-capacity-drop', async (req: Request, res: Response) => {
  const { id } = req.params;
  const plan = planStore.getPlan(id);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  // Simulate severe availability loss: only 7 hours available vs 14+ required
  const reducedCalendar = plan.calendar.map(slot => {
    // Block out weekdays, leave only 2 short weekend slots
    if (slot.dayOfWeek !== 'Saturday' && slot.dayOfWeek !== 'Sunday') {
      return { ...slot, isAvailable: false, reason: 'Sudden Academic Term Exams & Project Crunch' };
    }
    return { ...slot, endTime: '11:00' }; // reduce weekend slots to 1 hr each
  });

  planStore.updatePlan(id, p => ({
    calendar: reducedCalendar,
    constraints: {
      ...p.constraints,
      availableHoursPerWeek: 4,
    },
  }));

  planStore.recordAudit(
    id,
    'SYSTEM',
    'SIMULATE_CAPACITY_REDUCTION',
    'Calendar Constraints',
    'WARNING',
    'Simulated severe capacity drop: Weekday availability eliminated, weekend slots reduced.'
  );

  // Trigger autonomous agent under CAPACITY_REDUCTION
  const result = await agentOrchestrator.runLoop(id, 'CAPACITY_REDUCTION');
  const updatedPlan = planStore.getPlan(id);

  return res.json({ result, plan: updatedPlan });
});

// POST /api/plan/:id/reset-demo
apiRouter.post('/plan/:id/reset-demo', async (req: Request, res: Response) => {
  const freshPlan = planStore.seedDemoPlan();
  await agentOrchestrator.runLoop(freshPlan.planId, 'INITIAL_SEEDED_RUN');
  const plan = planStore.getPlan(freshPlan.planId);
  return res.json({ message: 'Demo plan reseeded and regenerated.', plan });
});

// GET /api/performance/:studentId
apiRouter.get('/performance/:studentId', (req: Request, res: Response) => {
  const plan = planStore.getAllPlans().find(p => p.student.id === req.params.studentId);
  const performance = plan?.performance || getSyntheticPerformance(req.params.studentId);
  res.json({ performance, gaps: calculateKnowledgeGaps(performance) });
});

// GET /api/resources/:topicId
apiRouter.get('/resources/:topicId', (req: Request, res: Response) => {
  const resources = CURATED_RESOURCES.filter(r => r.topicId === req.params.topicId);
  res.json(resources);
});

// GET /api/calendar/:studentId
apiRouter.get('/calendar/:studentId', (req: Request, res: Response) => {
  const plan = planStore.getAllPlans().find(p => p.student.id === req.params.studentId);
  const calendar = plan?.calendar || generateSyntheticCalendar('2026-09-14', 4);
  res.json(calendar);
});

// POST /api/study-session
apiRouter.post('/study-session', async (req: Request, res: Response) => {
  const { planId, topicId, resourceId, date, startTime, duration } = req.body;
  const tool = toolRegistry.get('createStudySession')!;
  const result = await tool.execute({ topicId, resourceId, date, startTime, duration }, planId);
  if (!result.success) return res.status(400).json({ error: result.error });

  const plan = planStore.getPlan(planId);
  return res.status(201).json({ result: result.data, plan });
});

// POST /api/study-session/:id/reschedule
apiRouter.post('/study-session/:id/reschedule', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { planId, newDate, newStartTime, reason } = req.body;
  const tool = toolRegistry.get('rescheduleStudySession')!;
  const result = await tool.execute({ sessionId: id, newDate, newStartTime, reason }, planId);
  if (!result.success) return res.status(400).json({ error: result.error });

  const plan = planStore.getPlan(planId);
  return res.json({ result: result.data, plan });
});

// POST /api/study-session/:id/complete
apiRouter.post('/study-session/:id/complete', (req: Request, res: Response) => {
  const { id } = req.params;
  const { planId } = req.body;

  const plan = planStore.getPlan(planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  const sessionIndex = plan.schedule.findIndex(s => s.id === id);
  if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found.' });

  const updatedSchedule = [...plan.schedule];
  const session = updatedSchedule[sessionIndex];
  session.status = 'COMPLETED';
  session.completedAt = new Date().toISOString();

  const completedCount = updatedSchedule.filter(s => s.status === 'COMPLETED').length;
  const completedHours = updatedSchedule
    .filter(s => s.status === 'COMPLETED')
    .reduce((sum, s) => sum + s.durationMinutes / 60, 0);

  planStore.updatePlan(planId, p => ({
    schedule: updatedSchedule,
    progress: {
      ...p.progress,
      completedSessionsCount: completedCount,
      completedHours: Math.round(completedHours * 10) / 10,
    },
  }));

  planStore.recordAudit(
    planId,
    'STUDENT',
    'COMPLETE_SESSION',
    session.topicName,
    'SUCCESS',
    `Marked study session for '${session.topicName}' as COMPLETED.`
  );

  const updatedPlan = planStore.getPlan(planId);
  return res.json({ session, plan: updatedPlan });
});

// POST /api/study-session/:id/missed (KEY DEMO TRIGGER!)
apiRouter.post('/study-session/:id/missed', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { planId } = req.body;

  const plan = planStore.getPlan(planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  const sessionIndex = plan.schedule.findIndex(s => s.id === id);
  if (sessionIndex === -1) return res.status(404).json({ error: 'Session not found.' });

  // 1. Mark session as MISSED
  const updatedSchedule = [...plan.schedule];
  const missedSession = updatedSchedule[sessionIndex];
  missedSession.status = 'MISSED';

  const missedCount = updatedSchedule.filter(s => s.status === 'MISSED').length;

  planStore.updatePlan(planId, p => ({
    schedule: updatedSchedule,
    progress: {
      ...p.progress,
      missedSessionsCount: missedCount,
    },
  }));

  planStore.recordAudit(
    planId,
    'STUDENT',
    'SESSION_MISSED',
    missedSession.topicName,
    'WARNING',
    `Study session for '${missedSession.topicName}' on ${missedSession.date} marked as MISSED. Triggering autonomous agent replanning.`
  );

  // 2. Autonomous Trigger: Agent takes over immediately!
  let orchestratorResult;
  try {
    orchestratorResult = await agentOrchestrator.runLoop(planId, 'MISSED_SESSION');
  } catch (err: any) {
    console.error('Agent error during missed session replan:', err);
  }

  const updatedPlan = planStore.getPlan(planId);
  return res.json({
    message: 'Session marked as MISSED. Autonomous agent executed replanning, rescheduling, and verification.',
    orchestratorResult,
    plan: updatedPlan,
  });
});

// GET /api/assessment/quiz
apiRouter.get('/assessment/quiz', (req: Request, res: Response) => {
  const topicId = req.query.topicId as string;
  const questions = topicId
    ? ASSESSMENT_QUESTIONS.filter(q => q.topicId === topicId)
    : ASSESSMENT_QUESTIONS;

  // Mask correctOptionIndex & explanation before student submission
  const safeQuestions = questions.map(q => ({
    id: q.id,
    topicId: q.topicId,
    topicName: q.topicName,
    question: q.question,
    codeSnippet: q.codeSnippet,
    options: q.options,
    difficulty: q.difficulty,
  }));

  return res.json(safeQuestions);
});

// POST /api/assessment/submit
apiRouter.post('/assessment/submit', async (req: Request, res: Response) => {
  const { planId, submission } = req.body;
  const plan = planStore.getPlan(planId);
  if (!plan) return res.status(404).json({ error: 'Plan not found.' });

  const currentTopicPerf = plan.performance.find(p => p.topicId === submission.topicId);
  const currentScore = currentTopicPerf ? currentTopicPerf.score : 50;

  // 1. Grade the quiz deterministically
  const quizResult = gradeQuizSubmission(submission, currentScore);

  // 2. Update Performance & Knowledge Gaps in PlanState
  const updatedPerformance = plan.performance.map(p => {
    if (p.topicId === submission.topicId) {
      return {
        ...p,
        previousScore: p.score,
        score: quizResult.newScore,
        mastery: quizResult.newMastery,
        isGap: quizResult.newScore < 75,
        lastEvaluatedAt: new Date().toISOString(),
      };
    }
    return p;
  });

  const updatedGaps = calculateKnowledgeGaps(updatedPerformance);
  const newOverallMastery = Math.round(
    updatedPerformance.reduce((acc, p) => acc + p.score, 0) / updatedPerformance.length
  );

  planStore.updatePlan(planId, p => ({
    performance: updatedPerformance,
    knowledgeGaps: updatedGaps,
    progress: {
      ...p.progress,
      overallMastery: newOverallMastery,
    },
  }));

  planStore.recordAudit(
    planId,
    'STUDENT',
    'SUBMIT_ASSESSMENT',
    quizResult.topicName,
    'SUCCESS',
    `Completed assessment for '${quizResult.topicName}'. Score: ${quizResult.score}%. Mastery updated: ${quizResult.previousScore}% -> ${quizResult.newScore}% (+${quizResult.delta}%).`
  );

  // 3. Autonomous agent evaluates changed mastery and re-verifies plan
  try {
    await agentOrchestrator.runLoop(planId, 'ASSESSMENT_UPDATE');
    quizResult.agentEvaluated = true;
  } catch (err: any) {
    console.error('Agent evaluation error post-quiz:', err);
  }

  const updatedPlan = planStore.getPlan(planId);
  return res.json({ quizResult, plan: updatedPlan });
});
