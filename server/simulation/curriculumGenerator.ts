import { CalendarSlot, LearningResource, TopicPerformance } from '../../shared/types';

export interface TopicDefinition {
  id: string;
  name: string;
  defaultScore: number;
  category: 'core' | 'advanced' | 'foundational';
}

export const TOPIC_DEFINITIONS: TopicDefinition[] = [
  { id: 'python', name: 'Python', defaultScore: 84, category: 'foundational' },
  { id: 'arrays', name: 'Arrays', defaultScore: 72, category: 'core' },
  { id: 'linked-lists', name: 'Linked Lists', defaultScore: 68, category: 'core' },
  { id: 'stacks-queues', name: 'Stacks & Queues', defaultScore: 70, category: 'core' },
  { id: 'trees', name: 'Trees', defaultScore: 61, category: 'core' },
  { id: 'graphs', name: 'Graphs', defaultScore: 45, category: 'advanced' },
  { id: 'dynamic-programming', name: 'Dynamic Programming', defaultScore: 38, category: 'advanced' },
  { id: 'recursion', name: 'Recursion', defaultScore: 52, category: 'core' },
];

export const CURATED_RESOURCES: LearningResource[] = [
  // Dynamic Programming (Critical gap: 38)
  {
    id: 'res-dp-1',
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    title: 'Dynamic Programming Fundamentals: Overlapping Subproblems & Optimal Substructure',
    type: 'Video',
    difficulty: 'Intermediate',
    estimatedMinutes: 60,
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-19-dynamic-programming-i-fibonacci-shortest-paths/',
    description: 'Detailed MIT OCW lecture breaking down state formulation and recursive trees.',
  },
  {
    id: 'res-dp-2',
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    title: 'Memoization vs Tabulation: Converting Top-Down Recursion to Iterative DP',
    type: 'Article',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://cp-algorithms.com/dynamic_programming/intro-to-dp.html',
    description: 'Comprehensive guide with memory footprint comparisons and state transition diagrams.',
  },
  {
    id: 'res-dp-3',
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    title: 'Classic DP Patterns: 0/1 Knapsack, Coin Change & Longest Common Subsequence',
    type: 'Problem Set',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    url: 'https://leetcode.com/discuss/general-discussion/458695/dynamic-programming-patterns',
    description: 'Interactive problem walkthrough with state space optimization.',
  },
  {
    id: 'res-dp-4',
    topicId: 'dynamic-programming',
    topicName: 'Dynamic Programming',
    title: 'Multi-Dimensional Dynamic Programming on Grids & Strings',
    type: 'Interactive',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    url: 'https://visualgo.net/en/recursion',
    description: 'Visual step-by-step state matrix simulator.',
  },

  // Graphs (Critical gap: 45)
  {
    id: 'res-graph-1',
    topicId: 'graphs',
    topicName: 'Graphs',
    title: 'Graph Representation & Traversal: BFS vs DFS with Adjacency Lists',
    type: 'Article',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://cp-algorithms.com/graph/breadth-first-search.html',
    description: 'Standard graph modeling techniques, queue/stack state tracking, and cycle detection.',
  },
  {
    id: 'res-graph-2',
    topicId: 'graphs',
    topicName: 'Graphs',
    title: 'Shortest Path Algorithms: Dijkstra & Bellman-Ford Deep Dive',
    type: 'Video',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/resources/lecture-16-dijkstra/',
    description: 'Priority queue implementation and relaxation proofs.',
  },
  {
    id: 'res-graph-3',
    topicId: 'graphs',
    topicName: 'Graphs',
    title: 'Topological Sort & Kahn’s Algorithm for Dependency Scheduling',
    type: 'Problem Set',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://cp-algorithms.com/graph/topological-sort.html',
    description: 'Course scheduling and build system dependency resolution problems.',
  },
  {
    id: 'res-graph-4',
    topicId: 'graphs',
    topicName: 'Graphs',
    title: 'Disjoint Set Union (DSU) and Minimum Spanning Trees (Kruskal’s)',
    type: 'Interactive',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    url: 'https://visualgo.net/en/mst',
    description: 'Interactive union-find with path compression and rank heuristics.',
  },

  // Recursion (High gap: 52)
  {
    id: 'res-rec-1',
    topicId: 'recursion',
    topicName: 'Recursion',
    title: 'Mental Models for Recursion: Call Stack Visualization & Base Cases',
    type: 'Video',
    difficulty: 'Beginner',
    estimatedMinutes: 45,
    url: 'https://cs50.harvard.edu/x/2024/weeks/3/',
    description: 'Understanding memory activation records and preventing stack overflow.',
  },
  {
    id: 'res-rec-2',
    topicId: 'recursion',
    topicName: 'Recursion',
    title: 'Backtracking Masterclass: N-Queens, Subsets & Permutations',
    type: 'Problem Set',
    difficulty: 'Intermediate',
    estimatedMinutes: 60,
    url: 'https://leetcode.com/explore/learn/card/recursion-ii/',
    description: 'Pruning search trees and state undo techniques.',
  },

  // Trees (High gap: 61)
  {
    id: 'res-tree-1',
    topicId: 'trees',
    topicName: 'Trees',
    title: 'Binary Tree Traversals: Recursive & Iterative Inorder, Preorder, Postorder',
    type: 'Interactive',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://visualgo.net/en/bst',
    description: 'Visualizing depth-first and level-order traversals on binary search trees.',
  },
  {
    id: 'res-tree-2',
    topicId: 'trees',
    topicName: 'Trees',
    title: 'Balanced BSTs: AVL Tree Rotations & Red-Black Tree Invariants',
    type: 'Article',
    difficulty: 'Advanced',
    estimatedMinutes: 60,
    url: 'https://cp-algorithms.com/data_structures/treap.html',
    description: 'Height balance guarantees and self-balancing operations.',
  },

  // Linked Lists (Medium gap: 68)
  {
    id: 'res-ll-1',
    topicId: 'linked-lists',
    topicName: 'Linked Lists',
    title: 'Pointer Manipulation & Two-Pointer Technique: Fast & Slow Pointers',
    type: 'Video',
    difficulty: 'Beginner',
    estimatedMinutes: 45,
    url: 'https://leetcode.com/explore/learn/card/linked-list/',
    description: 'Cycle detection (Floyd’s algorithm), intersection point, and linked list reversal.',
  },

  // Stacks & Queues (Medium gap: 70)
  {
    id: 'res-sq-1',
    topicId: 'stacks-queues',
    topicName: 'Stacks & Queues',
    title: 'Monotonic Stacks: Next Greater Element & Histogram Area Optimization',
    type: 'Problem Set',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://leetcode.com/tag/monotonic-stack/',
    description: 'Linear time optimizations using strictly increasing/decreasing stacks.',
  },

  // Arrays (Medium gap: 72)
  {
    id: 'res-arr-1',
    topicId: 'arrays',
    topicName: 'Arrays',
    title: 'Sliding Window & Prefix Sums: Subarray Constraints & Frequency Maps',
    type: 'Interactive',
    difficulty: 'Intermediate',
    estimatedMinutes: 45,
    url: 'https://leetcode.com/explore/featured/card/leetcodes-interview-crash-course-data-structures-and-algorithms/',
    description: 'Fixed and variable size sliding window problem patterns.',
  },

  // Python (Foundational: 84)
  {
    id: 'res-py-1',
    topicId: 'python',
    topicName: 'Python',
    title: 'Python DSA Idioms: Bisect, Heapq, Collections & Time Complexities',
    type: 'Article',
    difficulty: 'Beginner',
    estimatedMinutes: 30,
    url: 'https://docs.python.org/3/library/collections.html',
    description: 'High-speed Python standard library primitives for competitive programming.',
  },
];

export function getSyntheticPerformance(studentId: string): TopicPerformance[] {
  return TOPIC_DEFINITIONS.map(t => {
    let mastery: TopicPerformance['mastery'] = 'Mastered';
    if (t.defaultScore < 50) mastery = 'Critical';
    else if (t.defaultScore < 65) mastery = 'High';
    else if (t.defaultScore < 75) mastery = 'Medium';
    else if (t.defaultScore < 85) mastery = 'Low';

    return {
      topicId: t.id,
      topicName: t.name,
      score: t.defaultScore,
      mastery,
      isGap: t.defaultScore < 75,
      lastEvaluatedAt: new Date().toISOString(),
    };
  });
}

/**
 * Generate synthetic calendar slots for Sneha over the upcoming 4 weeks
 * Monday: 18:00 - 20:00 (Available)
 * Tuesday: 18:00 - 19:00 (Available) & 19:00 - 21:00 (College lab, Unavailable)
 * Wednesday: 19:00 - 21:00 (Available)
 * Thursday: 18:00 - 20:00 (Available)
 * Friday: 18:00 - 21:00 (Personal commitment, Unavailable)
 * Saturday: 10:00 - 13:00 (Available)
 * Sunday: 10:00 - 12:00 (Available)
 */
export function generateSyntheticCalendar(startDateStr = '2026-09-14', weeks = 4): CalendarSlot[] {
  const slots: CalendarSlot[] = [];
  const start = new Date(startDateStr);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let w = 0; w < weeks; w++) {
    for (let d = 0; d < 7; d++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + (w * 7) + d);
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayName = days[currentDate.getDay()];

      if (dayName === 'Monday') {
        slots.push({
          id: `cal-${dateStr}-mon`,
          dayOfWeek: 'Monday',
          date: dateStr,
          startTime: '18:00',
          endTime: '20:00',
          isAvailable: true,
          reason: 'Evening Study Window',
        });
      } else if (dayName === 'Tuesday') {
        slots.push({
          id: `cal-${dateStr}-tue-1`,
          dayOfWeek: 'Tuesday',
          date: dateStr,
          startTime: '18:00',
          endTime: '19:00',
          isAvailable: true,
          reason: 'Pre-Dinner Study Window',
        });
        slots.push({
          id: `cal-${dateStr}-tue-2`,
          dayOfWeek: 'Tuesday',
          date: dateStr,
          startTime: '19:00',
          endTime: '21:00',
          isAvailable: false,
          reason: 'University Operating Systems Lab',
        });
      } else if (dayName === 'Wednesday') {
        slots.push({
          id: `cal-${dateStr}-wed`,
          dayOfWeek: 'Wednesday',
          date: dateStr,
          startTime: '19:00',
          endTime: '21:00',
          isAvailable: true,
          reason: 'Mid-week Study Block',
        });
      } else if (dayName === 'Thursday') {
        slots.push({
          id: `cal-${dateStr}-thu`,
          dayOfWeek: 'Thursday',
          date: dateStr,
          startTime: '18:00',
          endTime: '20:00',
          isAvailable: true,
          reason: 'Evening Study Window',
        });
      } else if (dayName === 'Friday') {
        slots.push({
          id: `cal-${dateStr}-fri`,
          dayOfWeek: 'Friday',
          date: dateStr,
          startTime: '18:00',
          endTime: '21:00',
          isAvailable: false,
          reason: 'College Club / Hackathon Meet',
        });
      } else if (dayName === 'Saturday') {
        slots.push({
          id: `cal-${dateStr}-sat`,
          dayOfWeek: 'Saturday',
          date: dateStr,
          startTime: '10:00',
          endTime: '13:00',
          isAvailable: true,
          reason: 'Weekend Focus Block',
        });
      } else if (dayName === 'Sunday') {
        slots.push({
          id: `cal-${dateStr}-sun`,
          dayOfWeek: 'Sunday',
          date: dateStr,
          startTime: '10:00',
          endTime: '12:00',
          isAvailable: true,
          reason: 'Weekly Revision & Problem Solving',
        });
      }
    }
  }

  return slots;
}
