export interface DesignPattern {
  id: string;
  name: string;
  category: 'creational' | 'structural' | 'behavioral';
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessonFile: string;
  challenges: Challenge[];
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  type: 'debug' | 'implement' | 'refactor' | 'design' | 'quiz' | 'analysis';
  points: number;
  starterCode?: string;
  solution?: string;
  tests?: TestCase[];
  hints?: string[];
}

export interface TestCase {
  id: string;
  input: any;
  expectedOutput: any;
  description: string;
}

export interface UserProgress {
  patternsCompleted: string[];
  challengesCompleted: string[];
  totalPoints: number;
  achievements: string[];
  currentStreak: number;
  lastActivityDate: string;
}

export interface GameSession {
  patternId: string;
  challengeId: string;
  startTime: number;
  endTime?: number;
  attempts: number;
  completed: boolean;
  score: number;
}