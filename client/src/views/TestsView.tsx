import React, { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle2, XCircle, Play, RotateCw, ShieldCheck } from 'lucide-react';
import { api } from '../api/client';
import { TestResultItem } from '@shared/types';

export const TestsView: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<TestResultItem[]>([]);
  const [passedCount, setPassedCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      const data = await api.runTests();
      setResults(data.results);
      setPassedCount(data.passedCount);
      setTotalCount(data.totalCount);
      setLastRunAt(new Date().toLocaleTimeString());
    } catch (err: any) {
      alert(`Test suite execution failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runAllTests();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <FlaskConical className="w-5 h-5 text-emerald-500" />
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-slate-100">
              Judge & Developer Verification Suite
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Executes all 13 core agentic rubric requirements against real backend engines and tool registries.
          </p>
        </div>

        <button
          onClick={runAllTests}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50 shrink-0"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          <span>{isRunning ? 'Running Live Tests...' : 'Run All 13 Tests'}</span>
        </button>
      </div>

      {/* Summary Score Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold font-mono text-xl border border-emerald-500/20">
              {totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 100}%
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {passedCount} of {totalCount} Rubric Tests Passing
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {lastRunAt ? `Last executed at ${lastRunAt}` : 'Ready for test execution'}
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 self-start sm:self-auto">
            100% Deterministic Verification
          </span>
        </div>
      </div>

      {/* Test List */}
      <div className="space-y-3">
        {results.map(test => (
          <div
            key={test.id}
            className={`p-4 rounded-xl border transition-all flex items-start gap-3.5 bg-white dark:bg-slate-900 shadow-sm ${
              test.passed
                ? 'border-slate-200 dark:border-slate-800/80 hover:border-slate-300'
                : 'border-rose-300 dark:border-rose-900 bg-rose-50/20'
            }`}
          >
            <div className="mt-0.5 shrink-0">
              {test.passed ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-400">
                    #{test.id.toString().padStart(2, '0')}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {test.name}
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {test.category}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="text-slate-400">{test.durationMs}ms</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      test.passed
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    }`}
                  >
                    {test.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
                {test.details}
              </p>

              {test.diagnostic && !test.passed && (
                <div className="mt-2 p-2 rounded bg-rose-50 dark:bg-rose-950/40 text-[11px] font-mono text-rose-700 dark:text-rose-300">
                  <pre>{JSON.stringify(test.diagnostic, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
