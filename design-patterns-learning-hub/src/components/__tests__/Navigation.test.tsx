import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navigation } from '../Navigation';

const NavigationWrapper = () => (
  <BrowserRouter>
    <Navigation />
  </BrowserRouter>
);

describe('Navigation Component', () => {
  test('renders navigation brand and title', () => {
    render(<NavigationWrapper />);
    
    expect(screen.getByText('Design Patterns Hub')).toBeInTheDocument();
  });

  test('renders all navigation links', () => {
    render(<NavigationWrapper />);
    
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Progress')).toBeInTheDocument();
  });

  test('navigation links have correct href attributes', () => {
    render(<NavigationWrapper />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    const progressLink = screen.getByRole('link', { name: /progress/i });
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(progressLink).toHaveAttribute('href', '/progress');
  });

  test('applies active class to current route', () => {
    render(<NavigationWrapper />);
    
    const homeLink = screen.getByRole('link', { name: /home/i });
    expect(homeLink).toHaveClass('active');
  });

  test('has proper accessibility attributes', () => {
    render(<NavigationWrapper />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toBeInTheDocument();
    
    const links = screen.getAllByRole('link');
    links.forEach(link => {
      expect(link).toBeVisible();
    });
  });
});