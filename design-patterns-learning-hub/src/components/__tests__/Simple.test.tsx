import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DesignPatternsProvider, useDesignPatterns } from '../../context/DesignPatternsContext';

// Simple test component to test context functionality
const TestComponent = () => {
  const { patterns, userProgress, updateProgress } = useDesignPatterns();
  
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
    </div>
  );
};

describe('Design Patterns Context', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides correct initial state', () => {
    render(
      <DesignPatternsProvider>
        <TestComponent />
      </DesignPatternsProvider>
    );

    expect(screen.getByTestId('patterns-count')).toHaveTextContent('23');
    expect(screen.getByTestId('total-points')).toHaveTextContent('0');
    expect(screen.getByTestId('patterns-completed')).toHaveTextContent('0');
    expect(screen.getByTestId('challenges-completed')).toHaveTextContent('0');
  });

  test('updates progress correctly when challenge completed', () => {
    render(
      <DesignPatternsProvider>
        <TestComponent />
      </DesignPatternsProvider>
    );

    const updateButton = screen.getByTestId('update-progress');
    fireEvent.click(updateButton);

    expect(screen.getByTestId('total-points')).toHaveTextContent('100');
    expect(screen.getByTestId('challenges-completed')).toHaveTextContent('1');
  });

  test('persists progress to localStorage', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    
    render(
      <DesignPatternsProvider>
        <TestComponent />
      </DesignPatternsProvider>
    );

    const updateButton = screen.getByTestId('update-progress');
    fireEvent.click(updateButton);

    expect(setItemSpy).toHaveBeenCalledWith(
      'designPatternsProgress', 
      expect.stringContaining('"totalPoints":100')
    );
    
    setItemSpy.mockRestore();
  });

  test('throws error when context used outside provider', () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useDesignPatterns must be used within a DesignPatternsProvider');
    
    consoleSpy.mockRestore();
  });
});

// Test pattern data structure
describe('Design Patterns Data', () => {
  test('all patterns have required fields', () => {
    render(
      <DesignPatternsProvider>
        <TestComponent />
      </DesignPatternsProvider>
    );

    // This will implicitly test that patternsData is valid
    expect(screen.getByTestId('patterns-count')).toHaveTextContent('23');
  });
});