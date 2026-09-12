import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Lock, CheckCircle2, AlertTriangle, RefreshCw, X } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { Modal } from '../components/common/Modal';
import { StatusBadge } from '../components/common/StatusBadge';
import { CalendarSlot, StudySession } from '../../shared/types';

export const CalendarView: React.FC = () => {
  const { plan, markSessionMissed, completeSession, isAgentRunning } = usePlan();
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);

  const calendar = plan?.calendar || [];
  const schedule = plan?.schedule || [];

  // Group calendar slots by date
  const uniqueDates = Array.from(new Set(calendar.map(c => c.date))).sort().slice(0, 14); // show first 2 weeks

  return (
    <div className="sf-page space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            Study Calendar & Availability
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Visualizing student availability, scheduled sessions, and blocked personal windows.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" /> Planned
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-amber-500/20 border border-amber-500" /> Rescheduled
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500" /> Completed
          </span>
          <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
            <span className="w-3 h-3 rounded bg-slate-200 dark:bg-slate-800 border border-slate-400" /> Blocked
          </span>
        </div>
      </div>

      {/* Calendar Timeline Grid */}
      <div className="space-y-4">
        {uniqueDates.map(dateStr => {
          const daySlots = calendar.filter(c => c.date === dateStr);
          const daySessions = schedule.filter(s => s.date === dateStr);
          const dateObj = new Date(dateStr);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          return (
            <div
              key={dateStr}
              className="sf-panel sf-panel-hover p-5"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                    {formattedDate}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {dayName}
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">
                  {daySessions.length} sessions scheduled
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* Render Study Sessions for this day */}
                {daySessions.map(session => {
                  const isRescheduled = session.status === 'RESCHEDULED';
                  const isCompleted = session.status === 'COMPLETED';
                  const isMissed = session.status === 'MISSED';

                  let cardStyle = 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/40 dark:bg-emerald-950/20';
                  if (isRescheduled) cardStyle = 'border-amber-300 dark:border-amber-700/60 bg-amber-50/40 dark:bg-amber-950/20';
                  if (isCompleted) cardStyle = 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/30 dark:bg-emerald-950/20';
                  if (isMissed) cardStyle = 'border-rose-300 dark:border-rose-800/60 bg-rose-50/30 dark:bg-rose-950/20';

                  return (
                    <div
                      key={session.id}
                      onClick={() => setSelectedSession(session)}
                      className={`p-3.5 rounded-xl border cursor-pointer hover:shadow-md transition-all ${cardStyle}`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          {session.topicName}
                        </span>
                        <StatusBadge status={session.status} />
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1">
                        {session.resourceTitle}
                      </h4>

                      <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {session.startTime} - {session.endTime} ({session.durationMinutes}m)
                      </p>
                    </div>
                  );
                })}

                {/* Render Blocked or Available Slots without sessions */}
                {daySlots.map(slot => {
                  if (!slot.isAvailable) {
                    return (
                      <div
                        key={slot.id}
                        className="p-3.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/40 text-slate-400 text-xs flex flex-col justify-between"
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-400">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Blocked Period</span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-1">{slot.reason || 'Personal Commitment'}</p>
                        <p className="text-[10px] font-mono mt-1 text-slate-400">
                          {slot.startTime} - {slot.endTime}
                        </p>
                      </div>
                    );
                  }
                  return null;
                })}

                {daySessions.length === 0 && daySlots.every(s => s.isAvailable) && (
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs flex items-center justify-center">
                    <span>Open study window available</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Session Details Modal */}
      {selectedSession && (
        <Modal
          isOpen={Boolean(selectedSession)}
          onClose={() => setSelectedSession(null)}
          title={`Session Details: ${selectedSession.topicName}`}
        >
          <div className="space-y-4 text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">Resource / Module</p>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {selectedSession.resourceTitle}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-slate-400 text-[11px]">Scheduled Date</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedSession.date}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Time Window</p>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {selectedSession.startTime} - {selectedSession.endTime} ({selectedSession.durationMinutes} mins)
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Priority</p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedSession.priority}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-[11px]">Current Status</p>
                <div className="mt-0.5">
                  <StatusBadge status={selectedSession.status} />
                </div>
              </div>
            </div>

            {selectedSession.rescheduledFrom && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-bold">Autonomous Displacement Record</p>
                <p>
                  Originally planned on{' '}
                  <span className="font-mono font-bold">
                    {selectedSession.rescheduledFrom.date} at {selectedSession.rescheduledFrom.startTime}
                  </span>
                </p>
                <p className="text-[11px] italic">&quot;{selectedSession.rescheduledFrom.reason}&quot;</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              {selectedSession.status !== 'COMPLETED' && (
                <>
                  <button
                    onClick={() => {
                      markSessionMissed(selectedSession.id);
                      setSelectedSession(null);
                    }}
                    disabled={isAgentRunning}
                    className="px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60"
                  >
                    Mark as Missed
                  </button>
                  <button
                    onClick={() => {
                      completeSession(selectedSession.id);
                      setSelectedSession(null);
                    }}
                    disabled={isAgentRunning}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs"
                  >
                    Mark Complete
                  </button>
                </>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
