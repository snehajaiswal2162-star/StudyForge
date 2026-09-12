import React from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BrainCircuit,
  Play,
  RotateCw,
  Flame,
  Target,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { useAuth } from '../context/AuthContext';
import { MetricCard } from '../components/common/MetricCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActiveTab } from '../components/layout/Sidebar';

interface DashboardViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const {
    plan,
    isLoading,
    isAgentRunning,
    agentStatusMessage,
    runAgent,
    markSessionMissed,
    simulateCapacityDrop,
  } = usePlan();

  if (isLoading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Loading autonomous plan state...</p>
        </div>
      </div>
    );
  }

  const schedule = plan.schedule || [];
  const performance = plan.performance || [];
  const knowledgeGaps = plan.knowledgeGaps || [];
  const decisions = plan.decisions || [];

  // Next planned session
  const nextSession = schedule.find(s => s.status === 'PLANNED' || s.status === 'RESCHEDULED');
  const criticalGapsCount = knowledgeGaps.filter(g => g.severity === 'CRITICAL' || g.severity === 'HIGH').length;
  const isAtRisk = plan.status === 'AT_RISK';

  // Demo helper: find any active DP session to trigger the missed scenario
  const dpSessionToMiss = schedule.find(s => s.status === 'PLANNED');
  const latestDecision = decisions[decisions.length - 1];
  const agentStage = isAgentRunning
    ? 'UPDATING STATE'
    : latestDecision?.type === 'VERIFY_PLAN'
    ? 'VERIFYING'
    : latestDecision?.tool
    ? 'USING TOOL'
    : 'OBSERVING';

  return (
    <div className="sf-page space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="sf-kicker">Learning command center</p>
          <h1 className="sf-page-title">Good morning, {user?.name?.split(' ')[0] || 'there'}</h1>
          <p className="sf-page-subtitle">Here&apos;s what your autonomous learning agent is doing.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
          Plan synced just now
        </div>
      </div>

      {/* Live Agent Operational Status Banner */}
      {isAgentRunning && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">
                Autonomous Agent Operating
              </p>
              <p className="text-sm font-semibold">{agentStatusMessage || 'Evaluating environment & executing tools...'}</p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 font-bold">
            Live Loop
          </span>
        </div>
      )}

      {/* Hero Header */}
      <div className="relative overflow-hidden p-6 md:p-8 rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                Active Goal
              </span>
              <StatusBadge status={plan.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              {plan.goal}
            </h1>
            <p className="text-xs md:text-sm text-slate-300 flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-emerald-400" />
                Target Placement Deadline: <strong className="text-white">{plan.deadline}</strong>
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                Capacity: {plan.constraints?.availableHoursPerWeek || 12}h / week
              </span>
            </p>
          </div>

          {/* Autonomous Actions Quick Bar */}
          <div className="flex flex-wrap md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigate('plan')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-all shadow-md shadow-emerald-600/30"
            >
              <span>View Full Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('assessment')}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/10 transition-colors"
            >
              <span>Take Assessment</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
            label="Learning Health"
          value={`${plan.progress?.overallMastery || 58}%`}
          subValue={`Target: 85%`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-500" />}
          trend={{
            value: `+${(plan.progress?.overallMastery || 58) - (plan.progress?.initialMastery || 58)}%`,
            positive: true,
          }}
          color="emerald"
        />

        <MetricCard
          label="Knowledge Gaps"
          value={knowledgeGaps.length}
          subValue={`${criticalGapsCount} High Priority`}
          icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          color={criticalGapsCount > 0 ? 'amber' : 'emerald'}
        />

        <MetricCard
          label="Plan Health"
          value={isAtRisk ? 'AT RISK' : 'VERIFIED'}
          subValue={isAtRisk ? 'Capacity Deficit' : 'All 9 Checks Pass'}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          color={isAtRisk ? 'rose' : 'emerald'}
        />

        <MetricCard
          label="Sessions Completed"
          value={plan.progress?.completedSessionsCount || 0}
          subValue={`of ${plan.progress?.totalSessionsCount || schedule.length}`}
          icon={<Clock className="w-5 h-5 text-teal-500" />}
        />
      </div>

      {/* Interactive Hackathon Demo Scenarios Box */}
      <div className="sf-panel p-6 border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-r from-emerald-50/70 via-white to-teal-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                Demo controls
              </h2>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Test autonomous reactive replanning without manual user instructions. Click below to trigger real environment disruptions.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {/* Missed Session Adaptation Button */}
            <button
              onClick={() => {
                if (dpSessionToMiss) {
                  markSessionMissed(dpSessionToMiss.id);
                } else {
                  runAgent('MISSED_SESSION');
                }
              }}
              disabled={isAgentRunning}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Simulate Missed Session (Adaptation)</span>
            </button>

            {/* At-Risk Capacity Deficit Button */}
            <button
              onClick={() => simulateCapacityDrop()}
              disabled={isAgentRunning}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Simulate Capacity Deficit (AT_RISK)</span>
            </button>

            {/* Re-run Autonomous Loop */}
            <button
              onClick={() => runAgent('MANUAL_REEVALUATION')}
              disabled={isAgentRunning}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all disabled:opacity-50"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Trigger Agent Cycle</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Upcoming Study & Topic Mastery */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Next Session & Schedule Overview (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Next Immediate Study Session */}
          <div className="sf-panel sf-panel-hover p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Today&apos;s Focus
                </h2>
              </div>
              {nextSession && <StatusBadge status={nextSession.status} />}
            </div>

            {nextSession ? (
              <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                    {nextSession.topicName}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
                    {nextSession.resourceTitle}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {nextSession.date} • {nextSession.startTime} - {nextSession.endTime} ({nextSession.durationMinutes}m)
                    </span>
                    <span>• Priority: {nextSession.priority}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => markSessionMissed(nextSession.id)}
                    disabled={isAgentRunning}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors"
                  >
                    Mark Missed
                  </button>
                  <button
                    onClick={() => onNavigate('plan')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-sm"
                  >
                    Start Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs font-semibold">All planned sessions completed or none scheduled yet.</p>
                <button
                  onClick={() => runAgent('REPOPULATE_SCHEDULE')}
                  className="mt-3 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Generate new sessions
                </button>
              </div>
            )}
          </div>

          {/* Topic Performance & Knowledge Gap Overview */}
          <div className="sf-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Diagnostic Mastery & Gap Prioritization
              </h2>
              <button
                onClick={() => onNavigate('performance')}
                className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Full Performance Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {performance.map(item => {
                const gap = knowledgeGaps.find(g => g.topicId === item.topicId);
                return (
                  <div
                    key={item.topicId}
                    className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4"
                  >
                    <div className="w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {item.topicName}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Score: {item.score}%
                      </span>
                    </div>

                    {/* Visual Progress Bar */}
                    <div className="flex-1 max-w-xs">
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score < 50
                              ? 'bg-rose-500'
                              : item.score < 65
                              ? 'bg-amber-500'
                              : item.score < 75
                              ? 'bg-emerald-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="w-28 text-right">
                      {gap ? (
                        <StatusBadge status={gap.severity} />
                      ) : (
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          Mastered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Autonomous Agent Activity (1 col) */}
        <div className="space-y-6">
          <div className="sf-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="sf-kicker">Autonomous loop</p>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Agent Status</h2>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {agentStage}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div className={`h-full rounded-full bg-emerald-500 transition-all duration-700 ${isAgentRunning ? 'w-3/4 animate-pulse' : 'w-full'}`} />
              </div>
              <span className="font-mono text-[10px] text-slate-400">{decisions.length} events</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {isAgentRunning ? agentStatusMessage || 'Evaluating your current learning state.' : latestDecision?.reason || 'Monitoring your plan for the next useful action.'}
            </p>
          </div>

          <div className="sf-panel p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-500" />
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Agent Autonomous Feed
                </h2>
              </div>
              <button
                onClick={() => onNavigate('agent-activity')}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
              >
                View Console
              </button>
            </div>

            <div className="space-y-3">
              {decisions.slice(0, 4).map((dec, idx) => (
                <div
                  key={dec.id || idx}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                      {dec.type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(dec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium line-clamp-2">
                    {dec.reason}
                  </p>
                  {dec.tool && (
                    <p className="text-[11px] text-slate-500 font-mono">
                      Tool: <strong>{dec.tool}</strong>
                    </p>
                  )}
                </div>
              ))}

              {decisions.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No recent agent decisions logged.</p>
              )}
            </div>
          </div>

          {/* Deterministic Verification Check Summary */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Verification Health
              </h2>
              <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${isAtRisk ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'}`}>
                {plan.status}
              </span>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Deterministic verification executes 9 constraint checks to guarantee schedule viability.
            </p>

            <button
              onClick={() => onNavigate('verification')}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Inspect 9 Verification Checks
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
