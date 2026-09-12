import React, { useState } from 'react';
import { BookOpen, ExternalLink, Filter, Clock, CheckCircle2 } from 'lucide-react';
import { usePlan } from '../context/PlanContext';
import { CURATED_RESOURCES } from '@shared/curriculum';

export const ResourcesView: React.FC = () => {
  const { plan } = usePlan();
  const [selectedTopic, setSelectedTopic] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  const scheduledResourceIds = new Set((plan?.schedule || []).map(s => s.resourceId));

  const filteredResources = CURATED_RESOURCES.filter(r => {
    if (selectedTopic !== 'all' && r.topicId !== selectedTopic) return false;
    if (selectedType !== 'all' && r.type !== selectedType) return false;
    if (selectedDifficulty !== 'all' && r.difficulty !== selectedDifficulty) return false;
    return true;
  });

  const topics = [
    { id: 'all', name: 'All Topics' },
    { id: 'dynamic-programming', name: 'Dynamic Programming' },
    { id: 'graphs', name: 'Graphs' },
    { id: 'recursion', name: 'Recursion' },
    { id: 'trees', name: 'Trees' },
    { id: 'linked-lists', name: 'Linked Lists' },
    { id: 'stacks-queues', name: 'Stacks & Queues' },
    { id: 'arrays', name: 'Arrays' },
    { id: 'python', name: 'Python' },
  ];

  return (
    <div className="sf-page space-y-8">
      {/* Header */}
      <div>
        <h1 className="sf-page-title">
          Curated Educational Resources
        </h1>
        <p className="sf-page-subtitle">
          High-yield MIT OCW lectures, algorithm guides, interactive sandboxes, and problem sets.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 mr-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Filters:</span>
        </div>

        {/* Topic Filter */}
        <select
          value={selectedTopic}
          onChange={e => setSelectedTopic(e.target.value)}
          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          {topics.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Types</option>
          <option value="Video">Video Lectures</option>
          <option value="Article">Interactive Guides</option>
          <option value="Problem Set">Problem Sets</option>
          <option value="Interactive">Interactive Simulators</option>
        </select>

        {/* Difficulty Filter */}
        <select
          value={selectedDifficulty}
          onChange={e => setSelectedDifficulty(e.target.value)}
          className="text-xs font-semibold py-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Difficulties</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <span className="ml-auto text-xs text-slate-400 font-mono">
          Showing {filteredResources.length} resources
        </span>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map(resource => {
          const inPlan = scheduledResourceIds.has(resource.id);

          return (
            <div
              key={resource.id}
              className={`sf-panel sf-panel-hover p-5 flex flex-col justify-between ${
                inPlan
                  ? 'border-emerald-400 dark:border-emerald-500/60 ring-1 ring-emerald-400/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {resource.topicName || resource.topicId}
                  </span>

                  {inPlan && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" /> In Active Plan
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                  {resource.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {resource.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-mono text-slate-500">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                    {resource.type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {resource.estimatedMinutes}m
                  </span>
                </div>

                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-sans text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
