import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignPatternsProvider, useDesignPatterns } from '../DesignPatternsContext';

// Test component to access context
const TestComponent = () => {
  const { patterns, userProgress, updateProgress, getPatternByIds } = useDesignPatterns();
  
  return (
    <div>
      <div data-testid="patterns-count">{patterns.length}</div>
      <div data-testid="total-points">{userProgress.totalPoints}</div>
      <div data-testid="patterns-completed">{userProgress.patternsCompleted.length}</div>
      <div data-testid="challenges-completed">{userProgress.challengesCompleted.length}</div>
      <button 
        onClick={() => updateProgress('singleton', 'singleton-debug', 100)}
        data-testid="update-progress"
      >
        Update Progress
      </button>
      <div data-testid="singleton-pattern">
        {getPatternByIds('creational', 'singleton')?.name || 'Not found'}
      </div>
    </div>
  );
};

const ProviderWrapper = ({ children }: { children: React.ReactNode }) => (
  <DesignPatternsProvider>{children}</DesignPatternsProvider>
);

describe('DesignPatternsContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  test('provides initial state correctly', () => {
    render(
      <ProviderWrapper>
        <TestComponent />
      </ProviderWrapper>
    );

    expect(screen.getByTestId('patterns-count')).toHaveTextContent('23'); // We now have 23 patterns with all challenges
    expect(screen.getByTestId('total-points')).toHaveTextContent('0');
    expect(screen.getByTestId('patterns-completed')).toHaveTextContent('0');
    expect(screen.getByTestId('challenges-completed')).toHaveTextContent('0');
  });

  test('updates progress correctly', () => {
    render(
      <ProviderWrapper>
        <TestComponent />
      </ProviderWrapper>
    );

    const updateButton = screen.getByTestId('update-progress');
    fireEvent.click(updateButton);

    expect(screen.getByTestId('total-points')).toHaveTextContent('100');
    expect(screen.getByTestId('challenges-completed')).toHaveTextContent('1');
  });

  test('getPatternByIds returns correct pattern', () => {
    render(
      <ProviderWrapper>
        <TestComponent />
      </ProviderWrapper>
    );

    expect(screen.getByTestId('singleton-pattern')).toHaveTextContent('Singleton');
  });

  test('persists progress in localStorage', () => {
    render(
      <ProviderWrapper>
        <TestComponent />
      </ProviderWrapper>
    );

    const updateButton = screen.getByTestId('update-progress');
    fireEvent.click(updateButton);

    const savedProgress = localStorage.getItem('designPatternsProgress');
    expect(savedProgress).toBeTruthy();
    
    const parsedProgress = JSON.parse(savedProgress!);
    expect(parsedProgress.totalPoints).toBe(100);
    expect(parsedProgress.challengesCompleted).toContain('singleton-debug');
  });

  test('loads progress from localStorage', () => {
    // Pre-populate localStorage
    const mockProgress = {
      patternsCompleted: ['singleton'],
      challengesCompleted: ['singleton-debug'],
      totalPoints: 200,
      achievements: [],
      currentStreak: 5,
      lastActivityDate: new Date().toISOString(),
    };
    localStorage.setItem('designPatternsProgress', JSON.stringify(mockProgress));

    render(
      <ProviderWrapper>
        <TestComponent />
      </ProviderWrapper>
    );

    expect(screen.getByTestId('total-points')).toHaveTextContent('200');
    expect(screen.getByTestId('patterns-completed')).toHaveTextContent('1');
    expect(screen.getByTestId('challenges-completed')).toHaveTextContent('1');
  });

  test('throws error when used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDesignPatterns must be used within a DesignPatternsProvider');
    
    consoleSpy.mockRestore();
  });
});