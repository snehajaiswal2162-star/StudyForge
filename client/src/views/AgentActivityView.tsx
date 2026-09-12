import React from 'react';
import { Bot, Terminal, Wrench, CheckCircle2, AlertTriangle, ArrowRight, Clock, Cpu } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { StatusBadge } from '../components/common/StatusBadge';

export const AgentActivityView: React.FC = () => {
  const { plan } = usePlan();

  const decisions = plan?.decisions || [];
  const toolCalls = plan?.toolCalls || [];
  const stages = [
    ['OBSERVING', 'Analyzing performance'],
    ['DECIDING', 'Identifying knowledge gaps'],
    ['USING TOOL', 'Retrieving resources'],
    ['UPDATING STATE', 'Creating study sessions'],
    ['VERIFYING', 'Checking constraints'],
    ['COMPLETED', 'Plan verified'],
  ];

  return (
    <div className="sf-page mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bot className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
              Agent Activity Console
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time trace of autonomous decisions, tool executions, and state modifications.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-mono">
          <Cpu className="w-4 h-4 text-emerald-500" />
          <span className="text-slate-500">Provider:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {plan?.activeProvider || 'MockProvider'}
          </span>
        </div>
      </div>

      <div className="sf-panel p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="sf-kicker">Safe operational trace</p>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Agent operating model</h2>
          </div>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">STATEFUL</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stages.map(([stage, description], index) => (
            <div key={stage} className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] font-bold tracking-wider text-emerald-600 dark:text-emerald-400">{String(index + 1).padStart(2, '0')} / {stage}</span>
              <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-200">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Decision Stream */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Autonomous Reasoning & Action Stream ({decisions.length} Decisions)
        </h2>

        {decisions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500">
            <Terminal className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
            <p className="text-xs font-semibold">No autonomous decisions recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {decisions.map((dec, idx) => {
              const matchedToolCall = toolCalls.find(tc => tc.toolName === dec.tool);

              return (
                <div
                  key={dec.id || idx}
                  className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center border border-emerald-200 dark:border-emerald-800">
                        {dec.step || idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {dec.type}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(dec.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  {/* Objective & Reason (NO hidden chain-of-thought, clean action summary) */}
                  <div className="space-y-1">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      Objective: <span className="font-mono text-emerald-500">{dec.objective}</span>
                    </p>
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                      {dec.reason}
                    </p>
                  </div>

                  {/* Tool Execution Details */}
                  {dec.tool && (
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Tool Invoked: {dec.tool}</span>
                        </div>
                        {matchedToolCall && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              matchedToolCall.status === 'SUCCESS'
                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                                : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            }`}
                          >
                            {matchedToolCall.status}
                          </span>
                        )}
                      </div>

                      {/* Parameters */}
                      {dec.parameters && Object.keys(dec.parameters).length > 0 && (
                        <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-900 p-2 rounded-lg border border-slate-200 dark:border-slate-800 overflow-x-auto">
                          <pre>{JSON.stringify(dec.parameters, null, 2)}</pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
