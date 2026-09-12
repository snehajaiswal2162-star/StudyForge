import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive?: boolean;
  };
  highlight?: boolean;
  color?: 'default' | 'emerald' | 'amber' | 'rose';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  highlight,
  color = 'default',
}) => {
  const colorBorders = {
    default: 'border-slate-200 dark:border-slate-800',
    emerald: 'border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20',
    amber: 'border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20',
    rose: 'border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20',
  };

  return (
    <div
      className={`relative overflow-hidden p-5 rounded-2xl border bg-white/95 dark:bg-slate-900/95 transition-all duration-200 shadow-sm hover:-translate-y-0.5 hover:shadow-lg ${
        colorBorders[color]
      } ${highlight ? 'ring-2 ring-emerald-500/50' : ''}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 font-mono">
              {value}
            </span>
            {subValue && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {subValue}
              </span>
            )}
          </div>
        </div>

        {icon && (
          <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
            {icon}
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span
            className={
              trend.positive !== false
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }
          >
            {trend.value}
          </span>
          <span className="text-slate-400">vs baseline</span>
        </div>
      )}
    </div>
  );
};
