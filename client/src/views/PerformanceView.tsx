import React from 'react';
import { Award, AlertTriangle, ArrowRight, BarChart3, CheckCircle2 } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { StatusBadge } from '../components/common/StatusBadge';
import { ActiveTab } from '../components/layout/Sidebar';

interface PerformanceViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const PerformanceView: React.FC<PerformanceViewProps> = ({ onNavigate }) => {
  const { plan } = usePlan();

  const performance = plan?.performance || [];
  const knowledgeGaps = plan?.knowledgeGaps || [];

  return (
    <div className="sf-page space-y-8">
      <div>
        <h1 className="sf-page-title">
          Student Topic Performance & Knowledge Gap Matrix
        </h1>
        <p className="sf-page-subtitle">
          Inferred diagnostic scores and gap severity. Higher deficit topics are automatically prioritized by the agent.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Diagnostic Score</p>
          <p className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100 mt-2">
            {plan?.progress?.overallMastery || 61}%
          </p>
          <p className="text-xs text-slate-500 mt-1">Across 8 core Data Structures & Algorithms topics</p>
        </div>

        <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-sm">
          <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider">Critical Knowledge Gaps</p>
          <p className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400 mt-2">
            {knowledgeGaps.filter(g => g.severity === 'CRITICAL').length} Topics
          </p>
          <p className="text-xs text-slate-500 mt-1">Dynamic Programming & Graphs (Urgent placement risk)</p>
        </div>

        <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/30 dark:bg-emerald-950/20 shadow-sm">
          <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">High Mastery Topics</p>
          <p className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-2">
            {performance.filter(p => p.score >= 75).length} Topics
          </p>
          <p className="text-xs text-slate-500 mt-1">Python & Arrays (Foundational)</p>
        </div>
      </div>

      {/* Performance Matrix Table / Cards */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Topics Diagnostic Breakdown
        </h2>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {performance.map(topic => {
            const gap = knowledgeGaps.find(g => g.topicId === topic.topicId);

            return (
              <div
                key={topic.topicId}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1 w-full md:w-1/3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {topic.topicName}
                    </span>
                    <StatusBadge status={topic.mastery} />
                  </div>
                  {gap && (
                    <p className="text-[11px] text-slate-500 leading-relaxed line-clamp-1">
                      {gap.deficitDescription}
                    </p>
                  )}
                </div>

                {/* Progress bar */}
                <div className="w-full md:w-1/3 space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-500">
                    <span>Score</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{topic.score}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        topic.score < 50
                          ? 'bg-rose-500'
                          : topic.score < 65
                          ? 'bg-amber-500'
                          : topic.score < 75
                          ? 'bg-emerald-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${topic.score}%` }}
                    />
                  </div>
                </div>

                {/* Priority & Assessment CTA */}
                <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-1/4">
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Priority</p>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {gap?.priority || 'LOW'}
                    </p>
                  </div>

                  <button
                    onClick={() => onNavigate('assessment')}
                    className="px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950 transition-colors"
                  >
                    Test Topic
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
