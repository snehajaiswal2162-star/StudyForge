import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  ExternalLink,
  Target,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const PlanView: React.FC = () => {
  const {
    plan,
    isLoading,
    isAgentRunning,
    agentStatusMessage,
    completeSession,
    markSessionMissed,
    runAgent,
  } = usePlan();

  if (isLoading || !plan) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const schedule = plan.schedule || [];
  const sessionsByDate = schedule.reduce<Record<string, typeof schedule>>((groups, session) => {
    (groups[session.date] ||= []).push(session);
    return groups;
  }, {});

  return (
    <div className="sf-page space-y-8">
      {/* Live Agent Banner */}
      {isAgentRunning && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <p className="text-xs font-semibold">{agentStatusMessage || 'Agent is optimizing schedule...'}</p>
          </div>
          <span className="text-xs font-mono font-bold">Autonomous Loop</span>
        </div>
      )}

      {/* Plan Header & Meta */}
      <div className="sf-panel p-6 md:p-8 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Personalized Learning Schedule
              </span>
              <StatusBadge status={plan.status} />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
              {plan.goal}
            </h1>
          </div>

          <button
            onClick={() => runAgent('MANUAL_RESCHEDULE_OPTIMIZATION')}
            disabled={isAgentRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50 shrink-0"
          >
            <RotateCw className="w-4 h-4" />
            <span>Re-Optimize Schedule</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <p className="text-slate-400">Target Deadline</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{plan.deadline}</p>
          </div>
          <div>
            <p className="text-slate-400">Total Planned Sessions</p>
            <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{schedule.length} sessions</p>
          </div>
          <div>
            <p className="text-slate-400">Completed Sessions</p>
            <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
              {plan.progress?.completedSessionsCount || 0} completed
            </p>
          </div>
          <div>
            <p className="text-slate-400">Rescheduled / Adapted</p>
            <p className="font-bold text-amber-600 dark:text-amber-400 mt-0.5">
              {plan.progress?.rescheduledSessionsCount || 0} autonomous shifts
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Sessions List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Study Sessions ({schedule.length})
          </h2>
          <span className="text-xs text-slate-500">
            Click &apos;Mark Missed&apos; on any session to watch the agent autonomously adapt.
          </span>
        </div>

        {schedule.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 space-y-3">
            <Calendar className="w-10 h-10 mx-auto opacity-40 text-emerald-500" />
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">No sessions scheduled yet</h3>
            <p className="text-xs max-w-sm mx-auto">
              The autonomous agent will evaluate your knowledge gaps and build your optimal schedule.
            </p>
            <button
              onClick={() => runAgent('BUILD_PLAN')}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
            >
              Build My Learning Plan
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(sessionsByDate).map(([date, sessions]) => (
              <section key={date} className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="sf-kicker">{new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}</span>
                  <span className="text-xs font-mono text-slate-400">{date}</span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{sessions.length} sessions</span>
                </div>
                {sessions.map((session, idx) => {
              const isMissed = session.status === 'MISSED';
              const isRescheduled = session.status === 'RESCHEDULED';
              const isCompleted = session.status === 'COMPLETED';

              return (
                <div
                  key={session.id || idx}
                  className={`p-5 rounded-2xl border transition-all duration-200 bg-white dark:bg-slate-900 shadow-sm ${
                    isRescheduled
                      ? 'border-amber-400/50 dark:border-amber-500/40 ring-1 ring-amber-400/20'
                      : isMissed
                      ? 'border-rose-400/50 dark:border-rose-500/40 bg-rose-50/20'
                      : isCompleted
                      ? 'border-emerald-300 dark:border-emerald-800 opacity-90'
                      : 'border-slate-200 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {session.topicName}
                        </span>
                        <StatusBadge status={session.status} />
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          Priority: {session.priority}
                        </span>
                      </div>

                      <h3 className="text-sm md:text-base font-bold text-slate-900 dark:text-slate-100">
                        {session.resourceTitle}
                      </h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-mono">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500" />
                          {session.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-500" />
                          {session.startTime} - {session.endTime} ({session.durationMinutes} mins)
                        </span>
                      </div>

                      {/* Rescheduled displacement details */}
                      {session.rescheduledFrom && (
                        <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Autonomous adaptation</p>
                          <div className="grid grid-cols-2 gap-2 text-[11px] text-amber-900 dark:text-amber-200 sm:grid-cols-4">
                            <span><strong className="block text-[10px] opacity-60">01</strong>Session missed</span>
                            <span><strong className="block text-[10px] opacity-60">02</strong>Slot found</span>
                            <span><strong className="block text-[10px] opacity-60">03</strong>Rescheduled</span>
                            <span><strong className="block text-[10px] opacity-60">04</strong>Plan verified</span>
                          </div>
                          <p className="mt-2 text-[11px] text-amber-800 dark:text-amber-300">
                            Moved from <span className="font-mono font-bold">{session.rescheduledFrom.date} at {session.rescheduledFrom.startTime}</span>.
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {!isCompleted && (
                        <>
                          <button
                            onClick={() => markSessionMissed(session.id)}
                            disabled={isAgentRunning || isMissed}
                            title="Simulate student missing this session"
                            className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors disabled:opacity-40"
                          >
                            Mark Missed
                          </button>

                          <button
                            onClick={() => completeSession(session.id)}
                            disabled={isAgentRunning}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
                          >
                            Complete
                          </button>
                        </>
                      )}

                      {isCompleted && (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="w-4 h-4" /> Finished
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
                })}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
