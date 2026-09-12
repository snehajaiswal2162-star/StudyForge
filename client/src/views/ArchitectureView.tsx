import React from 'react';
import { Network, Database, Cpu, Wrench, ShieldCheck, UserCheck, Layers, ArrowRight, ArrowDown } from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const flow = [
    ['Student Goal', 'Define the target outcome'],
    ['Performance Analysis', 'Read observed mastery'],
    ['Knowledge Gap Detection', 'Prioritize the highest deficits'],
    ['Resource Retrieval', 'Select curated learning material'],
    ['Calendar Check', 'Respect real availability'],
    ['Plan Generation', 'Create feasible sessions'],
    ['Tool Actions', 'Mutate authoritative state'],
    ['Verification', 'Check nine invariants'],
    ['Changed Condition', 'Detect a missed session'],
    ['Autonomous Replanning', 'Find the next viable slot'],
    ['Re-verification', 'Confirm the new plan'],
  ];

  return (
    <div className="sf-page mx-auto max-w-5xl space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Network className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            System Architecture & Dataflow
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Component breakdown: Frontend shell, Server-Authoritative State, Agent Orchestrator, LLM Provider, Tool Registry, and Deterministic Verifier.
        </p>
      </div>

      <div className="sf-panel p-6 md:p-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <p className="sf-kicker">Closed-loop learning system</p>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">From goal to verified adaptation</h2>
          </div>
          <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 sm:inline-flex">SERVER AUTHORITATIVE</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {flow.map(([title, description], index) => (
            <div key={title} className={`rounded-2xl border p-4 ${index >= 8 ? 'border-amber-200 bg-amber-50/60 dark:border-amber-900/60 dark:bg-amber-950/20' : 'border-slate-200 bg-slate-50/70 dark:border-slate-800 dark:bg-slate-800/40'}`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">{String(index + 1).padStart(2, '0')}</span>
                {index < flow.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-slate-300 dark:text-slate-600" />}
              </div>
              <h3 className="mt-3 text-xs font-bold text-slate-900 dark:text-slate-100">{title}</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Visual System Architecture Diagram */}
      <div className="p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          Full-Stack Component Interconnect
        </h2>

        {/* Layer 1: Client Shell */}
        <div className="p-4 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              UI
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Client Layer (React 18 + Vite + Tailwind CSS)
              </h4>
              <p className="text-[11px] text-slate-500">
                ThemeContext (Zero-flash dark/light/system), AuthContext, PlanContext, Interactive Dashboard, Calendar & Quiz.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold">
            REST API / Proxy :3000
          </span>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Layer 2: Express Server & API Routes */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 dark:bg-slate-700 text-white flex items-center justify-center font-bold">
              API
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Backend Routing & Validation (/api/plan, /api/study-session, /api/assessment)
              </h4>
              <p className="text-[11px] text-slate-500">
                Strict request parameter validation, conflict checks, and autonomous trigger dispatchers.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold">
            Express TypeScript
          </span>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Layer 3: Agent Orchestrator & LLM Providers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Agent Orchestrator */}
          <div className="p-5 rounded-2xl border border-teal-200 dark:border-teal-900/60 bg-teal-50/30 dark:bg-teal-950/20 space-y-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                Agent Orchestrator Loop
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Enforces loop bounds (max 20 steps, 25 tool calls), prevents duplicate actions, manages state transitions, and halts safely.
            </p>
          </div>

          {/* LLM Provider Abstraction */}
          <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                LLM Provider Abstraction
              </h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              GeminiProvider (structured JSON generation, server-side only) with seamless auto-fallback to deterministic MockProvider.
            </p>
          </div>
        </div>

        <div className="flex justify-center text-slate-400">
          <ArrowDown className="w-5 h-5" />
        </div>

        {/* Layer 4: Tool Registry & Deterministic Verification */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <Wrench className="w-3.5 h-3.5" />
              <span>Tool Registry</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              getPerformance, getResources, getCalendar, createStudySession, rescheduleStudySession, verifyPlan.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Deterministic Verifier</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Calculates 9-point invariant checks, coverage percentages, conflict counts, and flags AT_RISK when capacity is deficient.
            </p>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-xs text-amber-600 dark:text-amber-400">
              <Database className="w-3.5 h-3.5" />
              <span>Server PlanState</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Authoritative central state store with non-null defensive array sanitization and comprehensive audit logging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
