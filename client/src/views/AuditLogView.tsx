import React, { useState } from 'react';
import { FileSpreadsheet, Search, Filter, Shield } from 'lucide-react';
import { usePlan } from '../context/PlanContext';

export const AuditLogView: React.FC = () => {
  const { plan } = usePlan();
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const auditLog = plan?.auditLog || [];

  const filteredLog = auditLog.filter(item => {
    if (actorFilter !== 'all' && item.actor !== actorFilter) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchAction = item.action.toLowerCase().includes(q);
      const matchTarget = item.target.toLowerCase().includes(q);
      const matchReason = item.reason.toLowerCase().includes(q);
      return matchAction || matchTarget || matchReason;
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-emerald-500" />
          <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
            System & Agent Audit Trail
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Immutable ledger of autonomous agent actions, student triggers, and state transformations.
        </p>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search action, target or reason..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={actorFilter}
          onChange={e => setActorFilter(e.target.value)}
          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Actors</option>
          <option value="AGENT">AGENT</option>
          <option value="STUDENT">STUDENT</option>
          <option value="SYSTEM">SYSTEM</option>
        </select>

        <span className="text-xs text-slate-400 font-mono ml-auto">
          {filteredLog.length} recorded entries
        </span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-400 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Tool</th>
                <th className="py-3 px-4">Target</th>
                <th className="py-3 px-4">Result</th>
                <th className="py-3 px-4">Reason / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
              {filteredLog.map((log, idx) => (
                <tr key={log.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        log.actor === 'AGENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : log.actor === 'STUDENT'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {log.actor}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>
                  <td className="py-3 px-4 text-emerald-500">
                    {log.tool || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {log.target}
                  </td>
                  <td className="py-3 px-4 font-bold">
                    <span
                      className={`px-1.5 py-0.5 rounded ${
                        log.result === 'SUCCESS'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : log.result === 'WARNING'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }`}
                    >
                      {log.result}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-sans text-xs text-slate-600 dark:text-slate-400 max-w-xs truncate">
                    {log.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
