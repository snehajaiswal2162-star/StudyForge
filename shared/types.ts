// ============================================================
// StudyForge — Shared Data Models & Core Types
// ============================================================

export type MasteryLevel = 'Critical' | 'High' | 'Medium' | 'Low' | 'Mastered';

export type SessionStatus = 
  | 'PLANNED' 
  | 'IN_PROGRESS' 
  | 'COMPLETED' 
  | 'MISSED' 
  | 'RESCHEDULED' 
  | 'CANCELLED';

export type PlanStatus = 
  | 'DRAFT' 
  | 'PLANNING' 
  | 'VERIFIED' 
  | 'AT_RISK' 
  | 'COMPLETED';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type AgentActionType = 
  | 'CALL_TOOL' 
  | 'SCHEDULE_SESSION' 
  | 'RESCHEDULE_SESSION' 
  | 'VERIFY_PLAN' 
  | 'ADAPT' 
  | 'FLAG_RISK' 
  | 'COMPLETE';

export interface StudentProfile {
  id: string;
  name: string;
  email: string;
  targetGoal: string;
  currentLevel: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface OnboardingProfile {
  learnerType: string;
  learningGoal: string;
  subject: string;
  level: 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced';
  targetDate: string;
  dailyStudyTime: string;
  availableDays: string[];
  priority: string;
}

export interface PlanConstraints {
  availableHoursPerWeek: number;
  preferredDailyHours: number;
  availableDays: string[];
  maxSessionsPerDay: number;
  sessionDurationMinutes: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  score: number; // 0 - 100
  mastery: MasteryLevel;
  previousScore?: number;
  isGap: boolean;
  lastEvaluatedAt: string;
}

export interface KnowledgeGap {
  gapId: string;
  topicId: string;
  topicName: string;
  score: number;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendedHours: number;
  deficitDescription: string;
}

export interface LearningResource {
  id: string;
  title: string;
  topicId: string;
  topicName?: string;
  type: 'Article' | 'Video' | 'Interactive' | 'Problem Set';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  url: string;
  description: string;
  inPlan?: boolean;
}

export interface CalendarSlot {
  id: string;
  dayOfWeek: string; // 'Monday', 'Tuesday', etc.
  date: string; // '2026-09-14'
  startTime: string; // '18:00'
  endTime: string; // '20:00'
  isAvailable: boolean;
  reason?: string;
}

export interface StudySession {
  id: string;
  topicId: string;
  topicName: string;
  resourceId: string;
  resourceTitle: string;
  date: string; // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string; // 'HH:mm'
  durationMinutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  status: SessionStatus;
  rescheduledFrom?: {
    date: string;
    startTime: string;
    reason: string;
    timestamp: string;
  };
  completedAt?: string;
  notes?: string;
}

export interface VerificationCheckItem {
  id: string;
  name: string;
  passed: boolean;
  details: string;
}

export interface VerificationResult {
  status: 'VERIFIED' | 'AT_RISK';
  score: number; // 0 - 100
  coverage: number; // 0 - 100
  deadlineSatisfied: boolean;
  conflicts: string[];
  risks: string[];
  checks: VerificationCheckItem[];
  timestamp: string;
}

export interface VerificationEvent {
  id: string;
  result: VerificationResult;
  triggeredBy: string;
  timestamp: string;
}

export interface AgentDecision {
  id: string;
  step: number;
  type: AgentActionType;
  tool?: string;
  parameters?: Record<string, any>;
  reason: string;
  objective: string;
  timestamp: string;
}

export interface ToolCallRecord {
  id: string;
  toolName: string;
  input: Record<string, any>;
  output: any;
  status: 'SUCCESS' | 'ERROR';
  error?: string;
  timestamp: string;
}

export interface AdaptationEvent {
  id: string;
  trigger: 'MISSED_SESSION' | 'ASSESSMENT_UPDATE' | 'CAPACITY_REDUCTION' | 'DEADLINE_CHANGE';
  description: string;
  actionsTaken: string[];
  previousStateSummary: string;
  newStateSummary: string;
  timestamp: string;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: 'STUDENT' | 'AGENT' | 'SYSTEM';
  action: string;
  tool?: string;
  target: string;
  result: 'SUCCESS' | 'WARNING' | 'FAILED';
  reason: string;
}

export interface OverallProgress {
  overallMastery: number; // 0 - 100
  initialMastery: number;
  completedHours: number;
  targetHours: number;
  completedSessionsCount: number;
  totalSessionsCount: number;
  missedSessionsCount: number;
  rescheduledSessionsCount: number;
  streakDays: number;
}

export interface PlanState {
  planId: string;
  student: StudentProfile;
  subject?: string;
  educationType?: string;
  goalType?: string;
  currentLevel?: 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced';
  targetDate?: string;
  dailyStudyMinutes?: number;
  availableDays?: string[];
  prioritization?: string;
  assessmentQuestions?: AssessmentQuestion[];
  goal: string;
  deadline: string; // e.g. '2026-10-15'
  constraints: PlanConstraints;
  performance: TopicPerformance[];
  knowledgeGaps: KnowledgeGap[];
  resources: LearningResource[];
  calendar: CalendarSlot[];
  schedule: StudySession[];
  progress: OverallProgress;
  decisions: AgentDecision[];
  toolCalls: ToolCallRecord[];
  verificationEvents: VerificationEvent[];
  adaptationEvents: AdaptationEvent[];
  auditLog: AuditEntry[];
  status: PlanStatus;
  riskLevel: RiskLevel;
  activeProvider: 'Gemini' | 'MockProvider';
  lastAgentAction?: string;
  createdAt: string;
  updatedAt: string;
  onboardingProfile?: OnboardingProfile;
}

export interface AssessmentQuestion {
  id: string;
  topicId: string;
  topicName: string;
  question: string;
  codeSnippet?: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export interface QuizSubmission {
  studentId: string;
  topicId: string;
  answers: {
    questionId: string;
    selectedOptionIndex: number;
  }[];
}

export interface QuizResult {
  topicId: string;
  topicName: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  previousScore: number;
  newScore: number;
  delta: number;
  newMastery: MasteryLevel;
  explanations: {
    questionId: string;
    question: string;
    userSelected: number;
    correctOptionIndex: number;
    isCorrect: boolean;
    explanation: string;
  }[];
  agentEvaluated: boolean;
  timestamp: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  planId?: string;
  createdAt: string;
}

export interface TestResultItem {
  id: number;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
  diagnostic?: any;
}
