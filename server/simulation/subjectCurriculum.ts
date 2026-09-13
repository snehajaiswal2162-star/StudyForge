import { AssessmentQuestion, LearningResource, TopicPerformance } from '../../shared/types';

export interface SubjectCurriculum {
  topics: { id: string; name: string }[];
  performance: TopicPerformance[];
  resources: LearningResource[];
  questions: AssessmentQuestion[];
}

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'subject';

export function generateSubjectCurriculum(subject: string, level = 'Beginner'): SubjectCurriculum {
  const cleanSubject = subject.trim() || 'your subject';
  const subjectId = slugify(cleanSubject);
  const topicLabels = [
    `${cleanSubject} Fundamentals`,
    `${cleanSubject} Core Concepts`,
    `${cleanSubject} Applied Practice`,
    `${cleanSubject} Problem Solving`,
    `${cleanSubject} Review & Integration`,
  ];
  const topics = topicLabels.map((name, index) => ({ id: `${subjectId}-topic-${index + 1}`, name }));
  const resources = topics.map((topic, index): LearningResource => ({
    id: `${subjectId}-resource-${index + 1}`,
    topicId: topic.id,
    topicName: topic.name,
    title: `${topic.name}: guided ${level.toLowerCase()} study module`,
    type: index % 3 === 0 ? 'Article' : index % 3 === 1 ? 'Video' : 'Problem Set',
    difficulty: level === 'Advanced' ? 'Advanced' : level === 'Intermediate' ? 'Intermediate' : 'Beginner',
    estimatedMinutes: 30 + index * 10,
    url: `https://www.google.com/search?q=${encodeURIComponent(`${cleanSubject} ${topic.name} study guide`)}`,
    description: `A subject-aware starting resource for ${topic.name}. Diagnostic detail will improve as the student completes assessments.`,
  }));
  // New subjects have no diagnostic evidence yet. Performance is added by assessment submission.
  const performance: TopicPerformance[] = [];
  const questions = topics.concat(topics.slice(0, 3)).map((topic, index): AssessmentQuestion => ({
    id: `${subjectId}-diagnostic-${index + 1}`,
    topicId: topic.id,
    topicName: topic.name,
    question: `Which approach best describes how you would begin learning ${topic.name.toLowerCase()}?`,
    options: [
      `Build a foundation in ${topic.name.toLowerCase()} before applying it`,
      `Skip the fundamentals and memorize isolated answers`,
      `Avoid practice and rely only on summaries`,
      `Study unrelated material first`,
    ],
    correctOptionIndex: 0,
    explanation: `A foundation followed by deliberate practice is a reliable starting point for ${topic.name.toLowerCase()}.`,
    difficulty: index % 3 === 0 ? 'Easy' : index % 3 === 1 ? 'Medium' : 'Hard',
  }));

  return { topics, performance, resources, questions };
}
