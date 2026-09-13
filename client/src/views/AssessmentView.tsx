import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Circle,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from 'lucide-react';
import { api } from '../api/client';
import { usePlan } from '../context/PlanContext';
import { AssessmentQuestion, QuizResult } from '../../../shared/types';

interface AssessmentViewProps {
  onContinue?: () => void;
}

interface AssessmentSummary {
  correctAnswers: number;
  totalQuestions: number;
  topicScores: { topicName: string; correct: number; total: number }[];
  agentEvaluated: boolean;
}

export const AssessmentView: React.FC<AssessmentViewProps> = ({ onContinue }) => {
  const { plan, submitQuiz, isAgentRunning } = usePlan();
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [summary, setSummary] = useState<AssessmentSummary | null>(null);
  const [isLoadingQuestions, setIsLoadingQuestions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchQuestions = async () => {
      if (!plan) return;
      setIsLoadingQuestions(true);
      setError(null);
      try {
        const bank = await api.getQuiz(plan?.planId);
        const selected = bank.slice(0, 8);

        if (isMounted) setQuestions(selected.slice(0, 8));
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Unable to load the assessment.');
      } finally {
        if (isMounted) setIsLoadingQuestions(false);
      }
    };

    fetchQuestions();
    return () => {
      isMounted = false;
    };
  }, [plan?.planId]);

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isLastQuestion = currentIndex === questions.length - 1;

  const selectAnswer = (optionIndex: number) => {
    if (summary || !currentQuestion) return;
    setAnswers(previous => ({ ...previous, [currentQuestion.id]: optionIndex }));
    setError(null);
  };

  const resetAssessment = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSummary(null);
    setError(null);
  };

  const submitAssessment = async () => {
    if (!plan || questions.length !== 8) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const groupedAnswers = questions.reduce<Record<string, { questionId: string; selectedOptionIndex: number }[]>>(
        (groups, question) => {
          const topicAnswers = groups[question.topicId] || [];
          topicAnswers.push({ questionId: question.id, selectedOptionIndex: answers[question.id] });
          groups[question.topicId] = topicAnswers;
          return groups;
        },
        {}
      );

      const backendResults: QuizResult[] = [];
      for (const [topicId, topicAnswers] of Object.entries(groupedAnswers)) {
        const result = await submitQuiz({
          studentId: plan.student.id,
          topicId,
          answers: topicAnswers,
        });
        backendResults.push(result);
      }

      const topicScores = questions.map(question => {
        const result = backendResults.find(item => item.topicId === question.topicId);
        const explanation = result?.explanations.find(item => item.questionId === question.id);
        return {
          topicName: question.topicName,
          correct: explanation?.isCorrect ? 1 : 0,
          total: 1,
        };
      });

      setSummary({
        correctAnswers: topicScores.reduce((total, topic) => total + topic.correct, 0),
        totalQuestions: questions.length,
        topicScores,
        agentEvaluated: backendResults.every(result => result.agentEvaluated),
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit the assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const moveNext = () => {
    if (selectedAnswer === undefined) {
      setError('Select an answer before continuing.');
      return;
    }

    if (isLastQuestion) {
      submitAssessment();
    } else {
      setError(null);
      setCurrentIndex(index => index + 1);
    }
  };

  if (isLoadingQuestions) {
    return (
      <div className="sf-page mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" />
          <p className="text-sm font-semibold text-slate-500">Preparing your assessment...</p>
        </div>
      </div>
    );
  }

  if (summary) {
    const percentage = Math.round((summary.correctAnswers / summary.totalQuestions) * 100);
    const strongTopics = summary.topicScores.filter(topic => topic.correct === topic.total);
    const attentionTopics = summary.topicScores.filter(topic => topic.correct < topic.total);

    return (
      <div className="sf-page mx-auto max-w-4xl space-y-6">
        <div className="sf-panel overflow-hidden border-emerald-200/80 dark:border-emerald-900/60">
          <div className="bg-gradient-to-br from-emerald-700 to-teal-900 px-6 py-10 text-center text-white sm:px-10">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/20">
              <Award className="h-7 w-7 text-emerald-100" />
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">Assessment Complete</p>
            <p className="mt-4 text-5xl font-black tracking-tight">{summary.correctAnswers} <span className="text-2xl text-emerald-200">/ 8</span></p>
            <p className="mt-1 text-lg font-semibold text-emerald-100">{percentage}%</p>
            {summary.agentEvaluated && (
              <span className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-emerald-50">
                <Sparkles className="h-3.5 w-3.5" /> Agent re-evaluated your plan
              </span>
            )}
          </div>

          <div className="grid gap-4 p-6 sm:grid-cols-2 sm:p-8">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-emerald-700 dark:text-emerald-300">
                <CheckCircle2 className="h-4 w-4" /> Strong Topics
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {strongTopics.length ? strongTopics.map(topic => topic.topicName).join(', ') : 'Keep practicing and your strongest areas will emerge.'}
              </p>
            </div>
            <div className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5 dark:border-amber-900/60 dark:bg-amber-950/20">
              <div className="mb-3 flex items-center gap-2 text-sm font-bold text-amber-700 dark:text-amber-300">
                <Target className="h-4 w-4" /> Topics Needing Attention
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-200">
                {attentionTopics.length ? attentionTopics.map(topic => topic.topicName).join(', ') : 'No immediate gaps found.'}
              </p>
            </div>
          </div>

          <p className="px-6 pb-6 text-center text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:px-8">
            Your answers were sent through the existing assessment flow. Performance and knowledge gaps were updated, then the autonomous agent re-evaluated plan feasibility.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <button type="button" onClick={resetAssessment} className="sf-button-secondary">
            <RotateCcw className="h-4 w-4" /> Retake Assessment
          </button>
          <button type="button" onClick={onContinue} className="sf-button-primary">
            Continue to Learning Plan <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="sf-page mx-auto max-w-3xl space-y-6">
      <div>
        <p className="sf-kicker">Diagnostic check-in</p>
        <h1 className="sf-page-title">{plan?.subject || 'Learning'} Skills Assessment</h1>
        <p className="sf-page-subtitle">One question at a time. Your results help the agent prioritize the next best study session.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {questions.length === 8 && currentQuestion && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>Question {currentIndex + 1} of 8</span>
            <span>{Math.round(((currentIndex + 1) / 8) * 100)}% complete</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${((currentIndex + 1) / 8) * 100}%` }} />
          </div>

          <div className="sf-panel p-6 sm:p-9">
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                {currentQuestion.topicName}
              </span>
              <span className="text-xs font-semibold text-slate-400">{currentQuestion.difficulty} difficulty</span>
            </div>

            <h2 className="text-xl font-black leading-snug text-slate-950 dark:text-white sm:text-2xl">{currentQuestion.question}</h2>

            <div className="mt-8 space-y-3" role="radiogroup" aria-label="Answer options">
              {currentQuestion.options.map((option, optionIndex) => {
                const isSelected = selectedAnswer === optionIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => selectAnswer(optionIndex)}
                    className={`group flex w-full items-center gap-4 rounded-2xl border p-4 text-left text-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm shadow-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100'
                        : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20'
                    }`}
                  >
                    {isSelected ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" /> : <Circle className="h-5 w-5 shrink-0 text-slate-300 dark:text-slate-600" />}
                    <span className="font-semibold">{option}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setError(null); setCurrentIndex(index => Math.max(0, index - 1)); }}
                disabled={currentIndex === 0 || isSubmitting}
                className="sf-button-secondary px-3 disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" /> Previous
              </button>
              <button
                type="button"
                onClick={moveNext}
                disabled={selectedAnswer === undefined || isSubmitting || isAgentRunning}
                className="sf-button-primary"
              >
                {isSubmitting ? 'Submitting...' : isLastQuestion ? 'Submit Assessment' : 'Next Question'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
