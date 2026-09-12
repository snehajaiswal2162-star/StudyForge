import React, { useState } from 'react';
import {
  LayoutDashboard,
  CalendarDays,
  ListTodo,
  BookOpen,
  GraduationCap,
  TrendingUp,
  Bot,
  CheckCircle2,
  Clock,
  FileSpreadsheet,
  Network,
  HelpCircle,
  FlaskConical,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { usePlan } from '../../context/PlanContext';

export type ActiveTab =
  | 'dashboard'
  | 'plan'
  | 'calendar'
  | 'resources'
  | 'assessment'
  | 'progress'
  | 'agent-activity'
  | 'verification'
  | 'timeline'
  | 'audit-log'
  | 'why-agentic'
  | 'architecture'
  | 'tests'
  | 'performance';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen = false,
  onClose,
}) => {
  const { plan } = usePlan();
  const [showAdvanced, setShowAdvanced] = useState(true);

  const gapsCount = plan?.knowledgeGaps?.length || 0;
  const isAtRisk = plan?.status === 'AT_RISK';

  const mainNav = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'plan', label: 'Learning Plan', icon: ListTodo, badge: isAtRisk ? 'Risk' : undefined, badgeColor: 'rose' },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'resources', label: 'Resources', icon: BookOpen },
    { id: 'assessment', label: 'Assessment', icon: GraduationCap, badge: gapsCount > 0 ? `${gapsCount} gaps` : undefined, badgeColor: 'amber' },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
  ];

  const advancedNav = [
    { id: 'agent-activity', label: 'Agent Activity', icon: Bot },
    { id: 'verification', label: 'Verification', icon: CheckCircle2, badge: plan?.status || 'VERIFIED', badgeColor: isAtRisk ? 'rose' : 'emerald' },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'audit-log', label: 'Audit Log', icon: FileSpreadsheet },
    { id: 'why-agentic', label: 'Why Agentic?', icon: HelpCircle },
    { id: 'architecture', label: 'Architecture', icon: Network },
    { id: 'tests', label: 'Judge Tests Suite', icon: FlaskConical, badge: '13/13', badgeColor: 'emerald' },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-16 z-40 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200/80 bg-white/90 p-4 shadow-sm shadow-slate-950/[0.03] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Main Learning Navigation */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Learning Workspace
            </p>
            <nav className="mt-2 space-y-1">
              {mainNav.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id as ActiveTab)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor === 'rose'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Advanced / Hackathon Judging Section */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
            >
              <span>Agent & Hackathon</span>
              {showAdvanced ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>

            {showAdvanced && (
              <nav className="mt-2 space-y-1">
                {advancedNav.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor === 'emerald'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              : item.badgeColor === 'rose'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Active At-Risk Warning Box */}
          {isAtRisk && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs">
              <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-bold mb-1">
                <AlertTriangle className="w-4 h-4" />
                <span>Plan At Risk</span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                Study capacity deficit detected. Agent flagged plan for student review.
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
