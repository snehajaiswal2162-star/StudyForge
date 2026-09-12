import React, { useEffect, useState } from 'react';

import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar, ActiveTab } from './components/layout/Sidebar';

import { DashboardView } from './views/DashboardView';
import { PlanView } from './views/PlanView';
import { CalendarView } from './views/CalendarView';
import { ResourcesView } from './views/ResourcesView';
import { PerformanceView } from './views/PerformanceView';
import { ProgressView } from './views/ProgressView';
import { AssessmentView } from './views/AssessmentView';
import { AgentActivityView } from './views/AgentActivityView';
import { VerificationView } from './views/VerificationView';
import { TimelineView } from './views/TimelineView';
import { AuditLogView } from './views/AuditLogView';
import { WhyAgenticView } from './views/WhyAgenticView';
import { ArchitectureView } from './views/ArchitectureView';
import { TestsView } from './views/TestsView';

import { LoginView } from './views/LoginView';
import { RegisterView } from './views/RegisterView';
import { OnboardingView } from './views/OnboardingView';

export const App: React.FC = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);

  // When logged out, always return to login.
  useEffect(() => {
    if (!isAuthenticated) {
      setAuthMode('login');
      setShowOnboarding(false);
      setActiveTab('dashboard');
      setIsSidebarOpen(false);
    }
  }, [isAuthenticated]);

  // Loading authentication state
  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Loading StudyForge...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // AUTHENTICATION SCREENS
  // =========================

  if (!isAuthenticated) {
    if (authMode === 'register') {
      return (
        <RegisterView
          onGoToLogin={() => {
            setAuthMode('login');
          }}
          onSuccess={() => {
            setShowOnboarding(true);
            setActiveTab('dashboard');
          }}
        />
      );
    }

    return (
      <LoginView
        onGoToRegister={() => {
          setAuthMode('register');
        }}
        onSuccess={() => {
          setShowOnboarding(false);
          setActiveTab('dashboard');
        }}
      />
    );
  }

  // =========================
  // ONBOARDING
  // =========================

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <Navbar />

        <OnboardingView
          onComplete={() => {
            setShowOnboarding(false);
            setActiveTab('dashboard');
          }}
        />
      </div>
    );
  }

  // =========================
  // MAIN APPLICATION
  // =========================

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors duration-200">

      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(prev => !prev)}
        isSidebarOpen={isSidebarOpen}
      />

      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">

        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto max-w-full">

          {activeTab === 'dashboard' && (
            <DashboardView onNavigate={setActiveTab} />
          )}

          {activeTab === 'plan' && (
            <PlanView />
          )}

          {activeTab === 'calendar' && (
            <CalendarView />
          )}

          {activeTab === 'resources' && (
            <ResourcesView />
          )}

          {activeTab === 'performance' && (
            <PerformanceView onNavigate={setActiveTab} />
          )}

          {activeTab === 'progress' && (
            <ProgressView />
          )}

          {activeTab === 'assessment' && (
            <AssessmentView
              onContinue={() => setActiveTab('plan')}
            />
          )}

          {activeTab === 'agent-activity' && (
            <AgentActivityView />
          )}

          {activeTab === 'verification' && (
            <VerificationView />
          )}

          {activeTab === 'timeline' && (
            <TimelineView />
          )}

          {activeTab === 'audit-log' && (
            <AuditLogView />
          )}

          {activeTab === 'why-agentic' && (
            <WhyAgenticView />
          )}

          {activeTab === 'architecture' && (
            <ArchitectureView />
          )}

          {activeTab === 'tests' && (
            <TestsView />
          )}

        </main>
      </div>
    </div>
  );
};