import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Target, Award } from 'lucide-react';
import './Navigation.css';

export const Navigation: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Target className="nav-logo" />
        <h1>Design Patterns Hub</h1>
      </div>
      
      <ul className="nav-links">
        <li>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <Home size={20} />
            <span>Home</span>
          </Link>
        </li>
        <li>
          <Link 
            to="/progress" 
            className={`nav-link ${isActive('/progress') ? 'active' : ''}`}
          >
            <Award size={20} />
            <span>Progress</span>
          </Link>
        </li>
      </ul>
    </nav>
  );
};