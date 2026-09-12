import React from 'react';
import { Clock, CheckCircle2, AlertTriangle, Sparkles, Bot, User, Settings } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export const TimelineView: React.FC = () => {
  const { plan } = usePlan();

  const auditLog = plan?.auditLog || [];

  return (
    <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
          State Evolution Timeline
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Chronological sequence of verified environment events, student interactions, and autonomous agent replans.
        </p>
      </div>

      {auditLog.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
          <p className="text-xs font-semibold">No historical state events recorded yet.</p>
        </div>
      ) : (
        <div className="relative pl-6 border-l-2 border-slate-200 dark:border-slate-800 space-y-6">
          {auditLog.map((event, idx) => {
            const isAgent = event.actor === 'AGENT';
            const isStudent = event.actor === 'STUDENT';
            const isWarning = event.result === 'WARNING';
            const isSuccess = event.result === 'SUCCESS';

            return (
              <div key={event.id || idx} className="relative group">
                {/* Timeline node dot */}
                <div
                  className={`absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-950 flex items-center justify-center ${
                    isWarning
                      ? 'bg-rose-500'
                      : isAgent
                      ? 'bg-emerald-600'
                      : isStudent
                      ? 'bg-emerald-500'
                      : 'bg-slate-400'
                  }`}
                />

                <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isAgent
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : isStudent
                            ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {event.actor}
                      </span>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {event.action}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {event.reason}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400">
                    <span>Target: <strong>{event.target}</strong></span>
                    {event.tool && <span>Tool: <strong>{event.tool}</strong></span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
