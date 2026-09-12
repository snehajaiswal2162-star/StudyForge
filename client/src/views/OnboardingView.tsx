import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, Sparkles, Target, XCircle } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { usePlan } from '../context/PlanContext';

interface OnboardingViewProps {
  onComplete: () => void;
}

type Level = 'Beginner' | 'Basic' | 'Intermediate' | 'Advanced';

const learnerTypes = ['School / Board studies', 'College / University', 'Competitive exam', 'Professional certification', 'Learning a new skill', 'Other'];
const learningGoals = ['Prepare for an exam', 'Improve my academic performance', 'Learn a new subject or skill', 'Complete a course', 'Prepare for an interview', 'Build strong fundamentals', 'Other'];
const levels: Level[] = ['Beginner', 'Basic', 'Intermediate', 'Advanced'];
const dailyTimes = ['30 minutes', '1 hour', '1.5 hours', '2 hours', '3+ hours'];
const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const priorities = ['Focus on my weakest areas', 'Balanced improvement', 'Follow my course/syllabus order', 'Focus on the most important topics first'];

const initialAnswers = {
  learnerType: '',
  learnerTypeOther: '',
  learningGoal: '',
  learningGoalOther: '',
  subject: '',
  level: '' as Level | '',
  targetDate: '',
  dailyTime: '',
  availableDays: [] as string[],
  priority: '',
};

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const { user, updateUserPlanId } = useAuth();
  const { fetchPlan } = usePlan();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStage, setSubmitStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const updateAnswer = <Key extends keyof typeof answers>(key: Key, value: (typeof answers)[Key]) => {
    setAnswers(previous => ({ ...previous, [key]: value }));
    setError(null);
  };

  const toggleDay = (day: string) => {
    updateAnswer('availableDays', answers.availableDays.includes(day)
      ? answers.availableDays.filter(item => item !== day)
      : [...answers.availableDays, day]);
  };

  const validateStep = () => {
    if (step === 0 && (!answers.learnerType || (answers.learnerType === 'Other' && !answers.learnerTypeOther.trim()))) return 'Please select an option.';
    if (step === 1 && (!answers.learningGoal || (answers.learningGoal === 'Other' && !answers.learningGoalOther.trim()))) return 'Please select an option.';
    if (step === 2 && !answers.subject.trim()) return 'Please enter the subject or skill you want to learn.';
    if (step === 3 && !answers.level) return 'Please select your current level.';
    if (step === 4 && !answers.targetDate) return 'Please select a target date.';
    if (step === 5 && !answers.dailyTime) return 'Please select your available study time.';
    if (step === 6 && answers.availableDays.length === 0) return 'Please select at least one available day.';
    if (step === 7 && !answers.priority) return 'Please select a planning preference.';
    return null;
  };

  const buildPlan = async () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setSubmitStage(0);
    setError(null);
    try {
      const dailyHours = answers.dailyTime === '30 minutes' ? 0.5 : answers.dailyTime === '1 hour' ? 1 : answers.dailyTime === '1.5 hours' ? 1.5 : answers.dailyTime === '2 hours' ? 2 : 3;
      const resolvedLearnerType = answers.learnerType === 'Other' ? answers.learnerTypeOther.trim() : answers.learnerType;
      const resolvedGoal = answers.learningGoal === 'Other' ? answers.learningGoalOther.trim() : answers.learningGoal;
      const levelForPlan = answers.level === 'Basic' ? 'Beginner' : answers.level === 'Advanced' ? 'Advanced' : answers.level === 'Intermediate' ? 'Intermediate' : 'Beginner';
      const planGoal = `${answers.subject.trim()} — ${resolvedGoal}.`;

      setSubmitStage(1);
      const newPlan = await api.createPlan({
        student: {
          id: user?.id,
          name: user?.name,
          email: user?.email,
          currentLevel: levelForPlan,
        },
        goal: planGoal,
        deadline: answers.targetDate,
        constraints: {
          availableHoursPerWeek: answers.availableDays.length * dailyHours,
          preferredDailyHours: dailyHours,
          availableDays: answers.availableDays,
          maxSessionsPerDay: 2,
          sessionDurationMinutes: 60,
        },
        onboardingProfile: {
          learnerType: resolvedLearnerType,
          learningGoal: resolvedGoal,
          subject: answers.subject.trim(),
          level: answers.level,
          targetDate: answers.targetDate,
          dailyStudyTime: answers.dailyTime,
          availableDays: answers.availableDays,
          priority: answers.priority,
        },
        autoRunAgent: true,
      });

      setSubmitStage(2);
      if (newPlan.planId) {
        updateUserPlanId(newPlan.planId);
        await fetchPlan(newPlan.planId);
      }
      setSubmitStage(3);
      onComplete();
    } catch (err: any) {
      setError("We couldn't build your plan right now.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    const validationError = validateStep();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    if (step === 7) buildPlan();
    else setStep(current => current + 1);
  };

  const optionClass = (selected: boolean) => `group flex w-full items-center justify-between rounded-2xl border p-4 text-left text-sm font-bold transition-all hover:-translate-y-0.5 hover:shadow-md ${selected ? 'border-emerald-500 bg-emerald-50 text-emerald-950 shadow-sm shadow-emerald-500/10 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-100' : 'border-slate-200 bg-slate-50/70 text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:hover:border-emerald-800 dark:hover:bg-emerald-950/20'}`;
  const questions = [
    { title: 'What are you currently studying?', helper: 'Tell us what kind of learning journey you are on.', icon: Target },
    { title: 'What is your main learning goal?', helper: 'We will use this outcome to shape your plan.', icon: Sparkles },
    { title: 'What subject or skill do you want to focus on?', helper: 'Enter any subject or skill, in your own words.', icon: Target },
    { title: 'How would you describe your current level?', helper: 'This sets a comfortable starting point.', icon: Sparkles },
    { title: 'When do you want to achieve your learning goal?', helper: 'Your agent will use this date to test feasibility.', icon: CalendarDays },
    { title: 'How much time can you study each day?', helper: 'Choose the time you can reliably protect.', icon: Clock3 },
    { title: 'Which days are you usually available to study?', helper: 'Select every day that works for you.', icon: CalendarDays },
    { title: 'How should StudyForge prioritize your learning?', helper: 'Choose how the agent should balance your plan.', icon: Sparkles },
  ];
  const CurrentIcon = questions[step].icon;

  const renderOptions = (options: string[], selected: string, onSelect: (value: string) => void) => (
    <div className="space-y-3">{options.map(option => <button key={option} type="button" onClick={() => onSelect(option)} className={optionClass(selected === option)}><span className="flex items-center gap-3"><span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected === option ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 dark:border-slate-600'}`}>{selected === option && <Check className="h-3.5 w-3.5" />}</span>{option}</span>{selected === option && <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}</button>)}</div>
  );

  const renderQuestion = () => {
    if (step === 0) return <>{renderOptions(learnerTypes, answers.learnerType, value => updateAnswer('learnerType', value))}{answers.learnerType === 'Other' && <input autoFocus value={answers.learnerTypeOther} onChange={event => updateAnswer('learnerTypeOther', event.target.value)} placeholder="Tell us what you are studying" className="sf-input w-full px-4 py-3" />}</>;
    if (step === 1) return <>{renderOptions(learningGoals, answers.learningGoal, value => updateAnswer('learningGoal', value))}{answers.learningGoal === 'Other' && <input autoFocus value={answers.learningGoalOther} onChange={event => updateAnswer('learningGoalOther', event.target.value)} placeholder="Describe your learning goal" className="sf-input w-full px-4 py-3" />}</>;
    if (step === 2) return <input autoFocus value={answers.subject} onChange={event => updateAnswer('subject', event.target.value)} placeholder="e.g. Mathematics, Biology, Python, Economics, English..." className="sf-input w-full px-4 py-4 text-base" />;
    if (step === 3) return renderOptions(levels, answers.level, value => updateAnswer('level', value as Level));
    if (step === 4) return <label className="block"><span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Target date</span><div className="relative"><CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" /><input type="date" min={new Date().toISOString().slice(0, 10)} value={answers.targetDate} onChange={event => updateAnswer('targetDate', event.target.value)} className="sf-input w-full py-4 pl-12 pr-4 text-base font-bold" /></div></label>;
    if (step === 5) return renderOptions(dailyTimes, answers.dailyTime, value => updateAnswer('dailyTime', value));
    if (step === 6) return <div className="grid gap-3 sm:grid-cols-2">{daysOfWeek.map(day => <button key={day} type="button" onClick={() => toggleDay(day)} className={optionClass(answers.availableDays.includes(day))}><span>{day}</span>{answers.availableDays.includes(day) && <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}</button>)}</div>;
    return renderOptions(priorities, answers.priority, value => updateAnswer('priority', value));
  };

  const progressStages = isSubmitting ? ['Understanding your goal', 'Analyzing your constraints', 'Finding learning resources', 'Building your schedule', 'Verifying your plan'] : [];

  return <div className="sf-page flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 sm:p-6"><div className="w-full max-w-2xl space-y-6"><div className="text-center"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-500/10"><Sparkles className="h-6 w-6" /></div><p className="sf-kicker">Build your learning system</p><h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">Let&apos;s make your plan personal.</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Eight quick questions. One autonomous plan built around your reality.</p></div>
    <div className="sf-panel p-5 sm:p-8">
      {!isSubmitting && <><div className="mb-7 flex items-center justify-between"><span className="text-sm font-bold text-slate-700 dark:text-slate-200">Question {step + 1} of 8</span><span className="text-xs font-semibold text-slate-400">{Math.round(((step + 1) / 8) * 100)}% complete</span></div><div className="mb-8 grid grid-cols-8 gap-1.5" aria-label={`Question ${step + 1} of 8`}>{questions.map((_, index) => <span key={index} className={`h-1.5 rounded-full transition-colors ${index <= step ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-800'}`} />)}</div><div className="mb-7 flex items-start gap-3"><div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"><CurrentIcon className="h-5 w-5" /></div><div><h2 className="text-xl font-black leading-snug text-slate-950 dark:text-white sm:text-2xl">{questions[step].title}</h2><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{questions[step].helper}</p></div></div><div className="space-y-3">{renderQuestion()}</div>{error && <div className="mt-5 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300"><XCircle className="h-4 w-4 shrink-0" />{error}</div>}<div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800"><button type="button" onClick={() => { setError(null); setStep(current => Math.max(0, current - 1)); }} disabled={step === 0} className="sf-button-secondary px-3 disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Back</button><button type="button" onClick={next} className="sf-button-primary">{step === 7 ? 'Build My Autonomous Plan' : 'Next'}<ArrowRight className="h-4 w-4" /></button></div></>}
      {isSubmitting && <div className="py-6"><div className="mb-6 text-center"><div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-emerald-200 border-t-emerald-600" /><h2 className="text-xl font-black text-slate-950 dark:text-white">Building your autonomous learning plan...</h2><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">StudyForge is preparing a plan around your answers.</p></div><div className="space-y-3">{progressStages.map((stage, index) => <div key={stage} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-800"><span className={`flex h-6 w-6 items-center justify-center rounded-full ${index <= submitStage ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>{index <= submitStage ? <Check className="h-4 w-4" /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span><span className={index <= submitStage ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400'}>{stage}</span></div>)}</div></div>}
      {!isSubmitting && error && error.includes("couldn't") && <div className="mt-5 text-center"><button type="button" onClick={buildPlan} className="sf-button-primary">Try Again <ArrowRight className="h-4 w-4" /></button></div>}
    </div></div></div>;
};
