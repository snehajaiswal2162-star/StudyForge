import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'plan' | 'session' | 'priority' | 'severity';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = status.toUpperCase();

  let colorClasses = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';

  if (s === 'VERIFIED' || s === 'COMPLETED' || s === 'PASS' || s === 'MASTERED') {
    colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  } else if (s === 'AT_RISK' || s === 'CRITICAL' || s === 'MISSED' || s === 'FAIL') {
    colorClasses = 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
  } else if (s === 'RESCHEDULED' || s === 'HIGH' || s === 'WARNING') {
    colorClasses = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
  } else if (s === 'PLANNING' || s === 'IN_PROGRESS' || s === 'MEDIUM') {
    colorClasses = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
  } else if (s === 'PLANNED' || s === 'LOW' || s === 'DRAFT') {
    colorClasses = 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30';
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${colorClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
      {status}
    </span>
  );
};
