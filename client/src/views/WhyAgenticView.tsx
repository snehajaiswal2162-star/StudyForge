import React from 'react';
import { HelpCircle, CheckCircle2, XCircle, ArrowRight, Bot, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

export const WhyAgenticView: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <HelpCircle className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            Why Agentic? (The Paradigm Shift)
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Comparing single-turn static generators with an autonomous, closed-loop agentic workflow.
        </p>
      </div>

      {/* Side-by-Side Architectural Contrast */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Traditional Chatbot / Static Generator */}
        <div className="p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              The Old Way
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
              Static Chatbot / CRUD
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Single-Shot Static Generation
          </h2>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs font-mono text-slate-600 dark:text-slate-400 space-y-2">
            <p>1. User Prompt: &quot;Give me a 30-day DSA plan&quot;</p>
            <p>2. LLM outputs markdown text with 30 bullet points</p>
            <p className="text-rose-500 font-bold">3. Dead end. Zero persistent state.</p>
          </div>

          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Brittle:</strong> The moment a session is missed, the plan is obsolete.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>Hallucinations:</strong> Invents unavailable days, impossible schedules, or missing links.</span>
            </li>
            <li className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <span><strong>No Verification:</strong> Cannot mathematically verify whether hours cover the deadline.</span>
            </li>
          </ul>
        </div>

        {/* Right: StudyForge Autonomous Agent */}
        <div className="p-6 rounded-3xl border border-emerald-500/40 bg-gradient-to-br from-emerald-50/50 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30 shadow-md space-y-4 ring-1 ring-emerald-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              StudyForge Paradigm
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              Autonomous Agentic AI
            </span>
          </div>

          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Closed-Loop Multi-Step Agent
          </h2>

          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs font-mono text-emerald-900 dark:text-emerald-300 space-y-1">
            <p>Observe State → Choose Action → Execute Tool</p>
            <p>→ Mutate State → Detect Disruption → Autonomous Replan</p>
            <p className="text-emerald-500 font-bold">→ 9-Point Deterministic Verification</p>
          </div>

          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Stateful:</strong> Strongly typed PlanState authoritative on server.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Tool-Equipped:</strong> Uses verified tools for performance, resources, calendar, and scheduling.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Autonomous Adaptation:</strong> When sessions are missed, it relocates them automatically without asking the user.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <span><strong>Honest AT_RISK Flags:</strong> Detects capacity deficits rather than fabricating impossible plans.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* The 6 Pillars of StudyForge Agentic Architecture */}
      <div className="p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
          The 6 Pillars of the StudyForge Agent Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              1
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Inferred Gap Prioritization</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Student never has to guess their weaknesses. Deterministic scoring categorizes scores into Critical (&lt;50), High, Medium, and Low.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              2
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Real Calendar Constraints</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Never schedules sessions over personal commitments or university labs. Strictly adheres to available study windows.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              3
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Deterministic Tool Registry</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              LLM does not write schedule arrays directly. LLM outputs structured decisions invoking server-validated tools.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              4
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Autonomous Rescheduling</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              A missed session triggers reactive replanning immediately. The agent finds the next viable slot and relocates the session.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              5
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">9-Point Verifier Invariant</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Zero tolerance for hallucination. Verifier checks gap coverage, calendar bounds, no conflicts, deadline feasibility, and objective safety.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold font-mono">
              6
            </div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Zero-Dependency Mock Fallback</h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Functions with full agentic fidelity using Gemini API or offline with deterministic MockProvider if API quotas are exhausted.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
