import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Progress } from '../Progress';
import { DesignPatternsProvider } from '../../context/DesignPatternsContext';

const ProgressWrapper = () => (
  <BrowserRouter>
    <DesignPatternsProvider>
      <Progress />
    </DesignPatternsProvider>
  </BrowserRouter>
);

describe('Progress Component', () => {
  test('renders progress page header', () => {
    render(<ProgressWrapper />);
    
    expect(screen.getByText('🏆 Your Progress')).toBeInTheDocument();
    expect(screen.getByText('Track your learning journey through design patterns')).toBeInTheDocument();
  });

  test('renders overall progress circle', () => {
    render(<ProgressWrapper />);
    
    expect(screen.getByText('Overall Progress')).toBeInTheDocument();
    expect(screen.getByText(/patterns mastered/)).toBeInTheDocument();
  });

  test('renders statistics cards', () => {
    render(<ProgressWrapper />);
    
    expect(screen.getByText('Total Points')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByText('Achievements')).toBeInTheDocument();
  });

  test('renders pattern mastery section', () => {
    render(<ProgressWrapper />);
    
    expect(screen.getByText('Pattern Mastery')).toBeInTheDocument();
    
    // Should show individual patterns
    expect(screen.getByText('Singleton')).toBeInTheDocument();
    expect(screen.getByText('Observer')).toBeInTheDocument();
    expect(screen.getByText('Strategy')).toBeInTheDocument();
    expect(screen.getByText('Adapter')).toBeInTheDocument();
  });

  test('renders progress bars for patterns', () => {
    render(<ProgressWrapper />);
    
    const progressBars = screen.getAllByClassName('progress-bar');
    expect(progressBars.length).toBeGreaterThan(0);
  });

  test('renders achievements section', () => {
    render(<ProgressWrapper />);
    
    expect(screen.getByText('🏅 Achievements')).toBeInTheDocument();
    expect(screen.getByText('First Steps')).toBeInTheDocument();
    expect(screen.getByText('On Fire')).toBeInTheDocument();
    expect(screen.getByText('Pattern Master')).toBeInTheDocument();
    expect(screen.getByText('Speed Runner')).toBeInTheDocument();
  });

  test('shows category badges with correct styles', () => {
    render(<ProgressWrapper />);
    
    const badges = screen.getAllByText(/creational|structural|behavioral/);
    expect(badges.length).toBeGreaterThan(0);
    
    badges.forEach(badge => {
      expect(badge).toHaveClass('category-badge');
    });
  });

  test('displays progress percentage correctly', () => {
    render(<ProgressWrapper />);
    
    // Should show 0% initially
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  test('shows locked achievements initially', () => {
    render(<ProgressWrapper />);
    
    const lockedText = screen.getAllByText('Locked');
    expect(lockedText.length).toBeGreaterThan(0);
  });
});