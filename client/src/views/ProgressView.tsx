import React from 'react';
import { TrendingUp, Award, Flame, Clock, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { MetricCard } from '../components/common/MetricCard';

export const ProgressView: React.FC = () => {
  const { plan } = usePlan();

  const performance = plan?.performance || [];
  const progress = plan?.progress || {
    overallMastery: 58,
    initialMastery: 58,
    completedHours: 0,
    targetHours: 24,
    completedSessionsCount: 0,
    totalSessionsCount: 0,
    missedSessionsCount: 0,
    rescheduledSessionsCount: 0,
    streakDays: 0,
  };

  const masteryDelta = progress.overallMastery - progress.initialMastery;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
          Learning Velocity & Growth Analytics
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Tracking mastery improvement, study hours logged, and knowledge deficit reduction.
        </p>
      </div>

      {/* Highlights Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Mastery"
          value={`${progress.overallMastery}%`}
          trend={{ value: `+${masteryDelta}%`, positive: masteryDelta >= 0 }}
          color="emerald"
        />
        <MetricCard
          label="Hours Completed"
          value={`${progress.completedHours}h`}
          subValue={`Target: ${progress.targetHours}h`}
          color="emerald"
        />
        <MetricCard
          label="Sessions Completed"
          value={progress.completedSessionsCount}
          subValue={`Total: ${progress.totalSessionsCount}`}
        />
        <MetricCard
          label="Autonomous Shifts"
          value={progress.rescheduledSessionsCount}
          subValue="Zero manual effort"
          color="amber"
        />
      </div>

      {/* Before & After Comparison Table */}
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
          Knowledge Gap Shrinkage (Baseline vs Current)
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold uppercase">Topic</th>
                <th className="pb-3 font-semibold uppercase">Diagnostic Score</th>
                <th className="pb-3 font-semibold uppercase">Current Mastery</th>
                <th className="pb-3 font-semibold uppercase">Net Improvement</th>
                <th className="pb-3 font-semibold uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {performance.map(topic => {
                const initialScore = topic.previousScore !== undefined ? topic.previousScore : topic.score;
                const currentScore = topic.score;
                const delta = currentScore - initialScore;

                return (
                  <tr key={topic.topicId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 font-bold text-slate-900 dark:text-slate-100">
                      {topic.topicName}
                    </td>
                    <td className="py-3.5 font-mono text-slate-500">
                      {initialScore}%
                    </td>
                    <td className="py-3.5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {currentScore}%
                    </td>
                    <td className="py-3.5 font-mono font-bold">
                      {delta > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <ArrowUpRight className="w-3.5 h-3.5" /> +{delta}%
                        </span>
                      ) : (
                        <span className="text-slate-400">0%</span>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          currentScore >= 75
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            : currentScore >= 50
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                        }`}
                      >
                        {topic.mastery}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
