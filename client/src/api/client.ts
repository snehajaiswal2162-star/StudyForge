import {
  AssessmentQuestion,
  CalendarSlot,
  LearningResource,
  PlanState,
  QuizResult,
  QuizSubmission,
  TopicPerformance,
  TestResultItem,
} from '../../../shared/types';

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('studyforge_token');
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('studyforge_token', token);
  } else {
    localStorage.removeItem('studyforge_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      if (data.error) errorMsg = data.error;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Health & Status
  getHealth: () => request<{ status: string; service: string; version: string }>('/health'),
  getStatus: () => request<{ activePlansCount: number; activeProvider: string; registeredTools: string[] }>('/status'),

  // Auth
  login: (credentials: { email: string; password: string }) =>
    request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) =>
    request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getMe: () => request<{ user: any }>('/auth/me'),

  // Plan
  getPlan: (id: string) => request<PlanState>(`/plan/${id}`),
  createPlan: (data: any) => request<PlanState>('/plan/create', { method: 'POST', body: JSON.stringify(data) }),
  runAgent: (id: string, trigger?: string) =>
    request<{ result: any; plan: PlanState }>(`/plan/${id}/run-agent`, {
      method: 'POST',
      body: JSON.stringify({ trigger }),
    }),
  adaptPlan: (id: string, trigger: string, reason?: string) =>
    request<{ result: any; plan: PlanState }>(`/plan/${id}/adapt`, {
      method: 'POST',
      body: JSON.stringify({ trigger, reason }),
    }),
  verifyPlan: (id: string) =>
    request<{ verification: any; plan: PlanState }>(`/plan/${id}/verify`, {
      method: 'POST',
    }),
  simulateCapacityDrop: (id: string) =>
    request<{ result: any; plan: PlanState }>(`/plan/${id}/simulate-capacity-drop`, {
      method: 'POST',
    }),
  resetDemoPlan: (id: string) =>
    request<{ message: string; plan: PlanState }>(`/plan/${id}/reset-demo`, {
      method: 'POST',
    }),

  // Study Sessions
  createSession: (sessionData: any) =>
    request<{ result: any; plan: PlanState }>('/study-session', {
      method: 'POST',
      body: JSON.stringify(sessionData),
    }),
  rescheduleSession: (id: string, rescheduleData: any) =>
    request<{ result: any; plan: PlanState }>(`/study-session/${id}/reschedule`, {
      method: 'POST',
      body: JSON.stringify(rescheduleData),
    }),
  completeSession: (id: string, planId: string) =>
    request<{ session: any; plan: PlanState }>(`/study-session/${id}/complete`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),
  markSessionMissed: (id: string, planId: string) =>
    request<{ message: string; orchestratorResult: any; plan: PlanState }>(`/study-session/${id}/missed`, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }),

  // Curated Resources & Calendar & Performance
  getResources: (topicId: string) => request<LearningResource[]>(`/resources/${topicId}`),
  getCalendar: (studentId: string) => request<CalendarSlot[]>(`/calendar/${studentId}`),
  getPerformance: (studentId: string) => request<{ performance: TopicPerformance[]; gaps: any[] }>(`/performance/${studentId}`),

  // Assessments
  getQuiz: (topicId?: string) => request<AssessmentQuestion[]>(`/assessment/quiz${topicId ? `?topicId=${topicId}` : ''}`),
  submitQuiz: (planId: string, submission: QuizSubmission) =>
    request<{ quizResult: QuizResult; plan: PlanState }>('/assessment/submit', {
      method: 'POST',
      body: JSON.stringify({ planId, submission }),
    }),

  // Automated Tests Runner
  runTests: () => request<{ passedCount: number; totalCount: number; results: TestResultItem[] }>('/tests/run'),
};
