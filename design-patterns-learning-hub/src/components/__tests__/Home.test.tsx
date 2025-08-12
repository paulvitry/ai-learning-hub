import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Home } from '../Home';
import { DesignPatternsProvider } from '../../context/DesignPatternsContext';

const HomeWrapper = () => (
  <BrowserRouter>
    <DesignPatternsProvider>
      <Home />
    </DesignPatternsProvider>
  </BrowserRouter>
);

describe('Home Component', () => {
  test('renders main heading', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('🎯 Master Software Design Patterns')).toBeInTheDocument();
    expect(screen.getByText('Learn design patterns through interactive lessons and gamified challenges')).toBeInTheDocument();
  });

  test('renders progress statistics', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('Points')).toBeInTheDocument();
    expect(screen.getByText('Patterns')).toBeInTheDocument();
    expect(screen.getByText('Challenges')).toBeInTheDocument();
  });

  test('renders pattern categories', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('Creational Patterns')).toBeInTheDocument();
    expect(screen.getByText('Structural Patterns')).toBeInTheDocument();
    expect(screen.getByText('Behavioral Patterns')).toBeInTheDocument();
  });

  test('renders pattern cards with correct information', () => {
    render(<HomeWrapper />);
    
    // Test Singleton pattern card
    expect(screen.getByText('Singleton')).toBeInTheDocument();
    expect(screen.getByText('Ensures a class has only one instance and provides global access to it')).toBeInTheDocument();
    
    // Test Observer pattern card
    expect(screen.getByText('Observer')).toBeInTheDocument();
    expect(screen.getByText('Notifies multiple objects about state changes')).toBeInTheDocument();
  });

  test('renders action buttons for each pattern', () => {
    render(<HomeWrapper />);
    
    const learnButtons = screen.getAllByText('Learn');
    const challengeButtons = screen.getAllByText('Challenge');
    
    expect(learnButtons.length).toBeGreaterThan(0);
    expect(challengeButtons.length).toBeGreaterThan(0);
  });

  test('renders getting started section', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('🚀 Getting Started')).toBeInTheDocument();
    expect(screen.getByText('📚 Read the Lesson')).toBeInTheDocument();
    expect(screen.getByText('🎮 Complete Challenges')).toBeInTheDocument();
    expect(screen.getByText('🏆 Earn Achievements')).toBeInTheDocument();
  });

  test('pattern cards have correct links', () => {
    render(<HomeWrapper />);
    
    const learnButtons = screen.getAllByText('Learn');
    const challengeButtons = screen.getAllByText('Challenge');
    
    // Check that buttons are actually links
    learnButtons.forEach(button => {
      expect(button.closest('a')).toHaveAttribute('href');
    });
    
    challengeButtons.forEach(button => {
      expect(button.closest('a')).toHaveAttribute('href');
    });
  });

  test('displays difficulty badges', () => {
    render(<HomeWrapper />);
    
    expect(screen.getByText('🟢 beginner')).toBeInTheDocument();
    expect(screen.getByText('🟡 intermediate')).toBeInTheDocument();
  });
});