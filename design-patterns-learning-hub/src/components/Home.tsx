import React from 'react';
import { Link } from 'react-router-dom';
import { useDesignPatterns } from '../context/DesignPatternsContext';
import { BookOpen, Target, Star } from 'lucide-react';
import './Home.css';

export const Home: React.FC = () => {
  const { patterns, userProgress } = useDesignPatterns();

  const categorizedPatterns = {
    creational: patterns.filter(p => p.category === 'creational'),
    structural: patterns.filter(p => p.category === 'structural'),
    behavioral: patterns.filter(p => p.category === 'behavioral'),
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '🟢';
      case 'intermediate': return '🟡';
      case 'advanced': return '🔴';
      default: return '⚪';
    }
  };

  const isPatternCompleted = (patternId: string) => {
    return userProgress.patternsCompleted.includes(patternId);
  };

  return (
    <div className="home">
      <header className="home-header">
        <h1>🎯 Master Software Design Patterns</h1>
        <p>Learn design patterns through interactive lessons and gamified challenges</p>
        
        <div className="progress-stats">
          <div className="stat">
            <Star className="stat-icon" />
            <div>
              <div className="stat-number">{userProgress.totalPoints}</div>
              <div className="stat-label">Points</div>
            </div>
          </div>
          <div className="stat">
            <Target className="stat-icon" />
            <div>
              <div className="stat-number">{userProgress.patternsCompleted.length}/{patterns.length}</div>
              <div className="stat-label">Patterns</div>
            </div>
          </div>
          <div className="stat">
            <BookOpen className="stat-icon" />
            <div>
              <div className="stat-number">{userProgress.challengesCompleted.length}</div>
              <div className="stat-label">Challenges</div>
            </div>
          </div>
        </div>
      </header>

      <div className="patterns-grid">
        {Object.entries(categorizedPatterns).map(([category, categoryPatterns]) => (
          <section key={category} className="pattern-category">
            <h2 className="category-title">
              {category.charAt(0).toUpperCase() + category.slice(1)} Patterns
            </h2>
            <div className="patterns-list">
              {categoryPatterns.map(pattern => (
                <div key={pattern.id} className={`pattern-card ${isPatternCompleted(pattern.id) ? 'completed' : ''}`}>
                  <div className="pattern-header">
                    <h3>{pattern.name}</h3>
                    <div className="pattern-meta">
                      <span className="difficulty">
                        {getDifficultyIcon(pattern.difficulty)} {pattern.difficulty}
                      </span>
                      {isPatternCompleted(pattern.id) && <span className="completed-badge">✅</span>}
                    </div>
                  </div>
                  
                  <p className="pattern-description">{pattern.description}</p>
                  
                  <div className="pattern-stats">
                    <span className="challenges-count">
                      {pattern.challenges.length} challenges
                    </span>
                    <span className="points">
                      {pattern.challenges.reduce((sum, c) => sum + c.points, 0)} pts
                    </span>
                  </div>
                  
                  <div className="pattern-actions">
                    <Link 
                      to={`/lesson/${category}/${pattern.id}`} 
                      className="btn btn-primary"
                    >
                      <BookOpen size={16} />
                      Learn
                    </Link>
                    <Link 
                      to={`/challenge/${category}/${pattern.id}/${pattern.challenges[0]?.id}`} 
                      className="btn btn-secondary"
                    >
                      <Target size={16} />
                      Challenge
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
      
      <section className="getting-started">
        <h2>🚀 Getting Started</h2>
        <div className="guide-steps">
          <div className="step">
            <div className="step-number">1</div>
            <div>
              <h3>📚 Read the Lesson</h3>
              <p>Start with the interactive lesson to understand the pattern</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <div>
              <h3>🎮 Complete Challenges</h3>
              <p>Practice with hands-on coding challenges</p>
            </div>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <div>
              <h3>🏆 Earn Achievements</h3>
              <p>Master patterns and unlock achievements</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};