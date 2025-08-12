import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App';

// Integration test for the full application workflow
describe('Design Patterns Learning Hub - Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock console.error to avoid noise from missing routes in test environment
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('loads the application successfully', () => {
    render(<App />);
    
    expect(screen.getByText('Design Patterns Hub')).toBeInTheDocument();
    expect(screen.getByText('🎯 Master Software Design Patterns')).toBeInTheDocument();
  });

  test('displays all pattern categories', () => {
    render(<App />);
    
    expect(screen.getByText('Creational Patterns')).toBeInTheDocument();
    expect(screen.getByText('Structural Patterns')).toBeInTheDocument();
    expect(screen.getByText('Behavioral Patterns')).toBeInTheDocument();
  });

  test('shows pattern cards with correct information', () => {
    render(<App />);
    
    // Verify Singleton pattern is displayed
    expect(screen.getByText('Singleton')).toBeInTheDocument();
    expect(screen.getByText('Ensures a class has only one instance and provides global access to it')).toBeInTheDocument();
    
    // Verify Observer pattern is displayed
    expect(screen.getByText('Observer')).toBeInTheDocument();
    expect(screen.getByText('Notifies multiple objects about state changes')).toBeInTheDocument();
  });

  test('displays initial progress statistics', () => {
    render(<App />);
    
    // Should show 0 initial progress
    expect(screen.getByText('0')).toBeInTheDocument(); // Points
    expect(screen.getByText('0/5')).toBeInTheDocument(); // Patterns completed
  });

  test('pattern cards have learn and challenge buttons', () => {
    render(<App />);
    
    const learnButtons = screen.getAllByText('Learn');
    const challengeButtons = screen.getAllByText('Challenge');
    
    expect(learnButtons.length).toBeGreaterThan(0);
    expect(challengeButtons.length).toBeGreaterThan(0);
    
    // Verify buttons are actually links
    learnButtons.forEach(button => {
      expect(button.closest('a')).toHaveAttribute('href');
    });
    
    challengeButtons.forEach(button => {
      expect(button.closest('a')).toHaveAttribute('href');
    });
  });

  test('navigation works correctly', () => {
    render(<App />);
    
    // Test navigation to Progress page
    const progressLink = screen.getByRole('link', { name: /progress/i });
    expect(progressLink).toHaveAttribute('href', '/progress');
    
    // Test navigation back to Home
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveAttribute('href', '/');
  });

  test('getting started section is displayed', () => {
    render(<App />);
    
    expect(screen.getByText('🚀 Getting Started')).toBeInTheDocument();
    expect(screen.getByText('📚 Read the Lesson')).toBeInTheDocument();
    expect(screen.getByText('🎮 Complete Challenges')).toBeInTheDocument();
    expect(screen.getByText('🏆 Earn Achievements')).toBeInTheDocument();
  });

  test('difficulty badges are displayed correctly', () => {
    render(<App />);
    
    // Should show different difficulty levels
    expect(screen.getByText('🟢 beginner')).toBeInTheDocument();
    expect(screen.getByText('🟡 intermediate')).toBeInTheDocument();
  });

  test('application handles localStorage correctly', () => {
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem');
    
    render(<App />);
    
    // Should attempt to load from localStorage on initial render
    expect(getItemSpy).toHaveBeenCalledWith('designPatternsProgress');
    
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });
});

// Test the overall application structure and components
describe('Application Structure', () => {
  test('has proper semantic HTML structure', () => {
    render(<App />);
    
    // Should have navigation
    expect(screen.getByRole('navigation')).toBeInTheDocument();
    
    // Should have main content area
    expect(screen.getByRole('main')).toBeInTheDocument();
    
    // Should have proper headings hierarchy
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  test('application is accessible', () => {
    render(<App />);
    
    // All links should be accessible
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toBeVisible();
      expect(link).not.toHaveAttribute('href', '');
    });
    
    // Navigation should be keyboard accessible
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach(link => {
      expect(link).not.toHaveAttribute('tabindex', '-1');
    });
  });

  test('responsive design classes are applied', () => {
    render(<App />);
    
    // Should have grid layouts for patterns
    const patternCards = document.querySelectorAll('.pattern-card');
    expect(patternCards.length).toBeGreaterThan(0);
    
    // Should have responsive stats grid
    const statsElements = document.querySelectorAll('.stat');
    expect(statsElements.length).toBeGreaterThan(0);
  });
});