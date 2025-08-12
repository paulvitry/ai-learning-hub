import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { DesignPattern, UserProgress, GameSession } from '../types';
import { designPatternsData } from '../data/patternsData';

interface DesignPatternsContextType {
  patterns: DesignPattern[];
  userProgress: UserProgress;
  currentSession: GameSession | null;
  updateProgress: (patternId: string, challengeId: string, points: number) => void;
  startSession: (patternId: string, challengeId: string) => void;
  endSession: (score: number) => void;
  getPatternByIds: (category: string, patternId: string) => DesignPattern | undefined;
}

const DesignPatternsContext = createContext<DesignPatternsContextType | undefined>(undefined);

interface DesignPatternsProviderProps {
  children: ReactNode;
}

export const DesignPatternsProvider: React.FC<DesignPatternsProviderProps> = ({ children }) => {
  const [patterns] = useState<DesignPattern[]>(designPatternsData);
  const [userProgress, setUserProgress] = useState<UserProgress>({
    patternsCompleted: [],
    challengesCompleted: [],
    totalPoints: 0,
    achievements: [],
    currentStreak: 0,
    lastActivityDate: new Date().toISOString(),
  });
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem('designPatternsProgress');
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    localStorage.setItem('designPatternsProgress', JSON.stringify(userProgress));
  }, [userProgress]);

  const updateProgress = (patternId: string, challengeId: string, points: number) => {
    setUserProgress(prev => {
      const newChallengesCompleted = [...prev.challengesCompleted];
      if (!newChallengesCompleted.includes(challengeId)) {
        newChallengesCompleted.push(challengeId);
      }

      const pattern = patterns.find(p => p.id === patternId);
      const allPatternChallengesCompleted = pattern?.challenges.every(c => 
        newChallengesCompleted.includes(c.id)
      );

      const newPatternsCompleted = [...prev.patternsCompleted];
      if (allPatternChallengesCompleted && !newPatternsCompleted.includes(patternId)) {
        newPatternsCompleted.push(patternId);
      }

      return {
        ...prev,
        challengesCompleted: newChallengesCompleted,
        patternsCompleted: newPatternsCompleted,
        totalPoints: prev.totalPoints + points,
        lastActivityDate: new Date().toISOString(),
      };
    });
  };

  const startSession = (patternId: string, challengeId: string) => {
    setCurrentSession({
      patternId,
      challengeId,
      startTime: Date.now(),
      attempts: 0,
      completed: false,
      score: 0,
    });
  };

  const endSession = (score: number) => {
    if (currentSession) {
      setCurrentSession(prev => prev ? {
        ...prev,
        endTime: Date.now(),
        completed: true,
        score,
      } : null);
    }
  };

  const getPatternByIds = (category: string, patternId: string): DesignPattern | undefined => {
    return patterns.find(p => p.category === category && p.id === patternId);
  };

  return (
    <DesignPatternsContext.Provider value={{
      patterns,
      userProgress,
      currentSession,
      updateProgress,
      startSession,
      endSession,
      getPatternByIds,
    }}>
      {children}
    </DesignPatternsContext.Provider>
  );
};

export const useDesignPatterns = () => {
  const context = useContext(DesignPatternsContext);
  if (!context) {
    throw new Error('useDesignPatterns must be used within a DesignPatternsProvider');
  }
  return context;
};