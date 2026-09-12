import { LearningResource } from './types';

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
