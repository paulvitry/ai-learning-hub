import React from 'react';
import { useDesignPatterns } from '../context/DesignPatternsContext';
import { Trophy, Target, Star, Calendar } from 'lucide-react';
import './Progress.css';

export const Progress: React.FC = () => {
  const { patterns, userProgress } = useDesignPatterns();

  const totalChallenges = patterns.reduce((sum, pattern) => sum + pattern.challenges.length, 0);
  const completionPercentage = Math.round((userProgress.patternsCompleted.length / patterns.length) * 100);

  const getPatternProgress = (patternId: string) => {
    const pattern = patterns.find(p => p.id === patternId);
    if (!pattern) return 0;
    
    const completedChallenges = pattern.challenges.filter(c => 
      userProgress.challengesCompleted.includes(c.id)
    ).length;
    
    return Math.round((completedChallenges / pattern.challenges.length) * 100);
  };

  return (
    <div className="progress-page">
      <header className="progress-header">
        <h1>🏆 Your Progress</h1>
        <p>Track your learning journey through design patterns</p>
      </header>

      <div className="progress-overview">
        <div className="progress-card">
          <div className="progress-circle">
            <svg viewBox="0 0 36 36" className="circular-chart">
              <path
                className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="circle"
                strokeDasharray={`${completionPercentage}, 100`}
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <text x="18" y="20.35" className="percentage">
                {completionPercentage}%
              </text>
            </svg>
          </div>
          <div className="progress-info">
            <h3>Overall Progress</h3>
            <p>{userProgress.patternsCompleted.length} of {patterns.length} patterns mastered</p>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <Star className="stat-icon" />
            <div className="stat-content">
              <div className="stat-number">{userProgress.totalPoints}</div>
              <div className="stat-label">Total Points</div>
            </div>
          </div>
          
          <div className="stat-card">
            <Target className="stat-icon" />
            <div className="stat-content">
              <div className="stat-number">{userProgress.challengesCompleted.length}/{totalChallenges}</div>
              <div className="stat-label">Challenges</div>
            </div>
          </div>
          
          <div className="stat-card">
            <Calendar className="stat-icon" />
            <div className="stat-content">
              <div className="stat-number">{userProgress.currentStreak}</div>
              <div className="stat-label">Day Streak</div>
            </div>
          </div>
          
          <div className="stat-card">
            <Trophy className="stat-icon" />
            <div className="stat-content">
              <div className="stat-number">{userProgress.achievements.length}</div>
              <div className="stat-label">Achievements</div>
            </div>
          </div>
        </div>
      </div>

      <section className="patterns-progress">
        <h2>Pattern Mastery</h2>
        <div className="patterns-list">
          {patterns.map(pattern => {
            const progressPercentage = getPatternProgress(pattern.id);
            const isCompleted = userProgress.patternsCompleted.includes(pattern.id);
            
            return (
              <div key={pattern.id} className={`pattern-progress-card ${isCompleted ? 'completed' : ''}`}>
                <div className="pattern-header">
                  <h3>{pattern.name}</h3>
                  <span className={`category-badge ${pattern.category}`}>
                    {pattern.category}
                  </span>
                </div>
                
                <div className="progress-bar-container">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <span className="progress-text">{progressPercentage}%</span>
                </div>
                
                <div className="pattern-stats">
                  <span>
                    {pattern.challenges.filter(c => userProgress.challengesCompleted.includes(c.id)).length}
                    /{pattern.challenges.length} challenges
                  </span>
                  <span>
                    {pattern.challenges.reduce((sum, c) => 
                      userProgress.challengesCompleted.includes(c.id) ? sum + c.points : sum, 0
                    )} pts earned
                  </span>
                </div>
                
                {isCompleted && (
                  <div className="completion-badge">
                    <Trophy size={16} />
                    Mastered!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="achievements">
        <h2>🏅 Achievements</h2>
        <div className="achievements-grid">
          <div className="achievement-card locked">
            <div className="achievement-icon">🥇</div>
            <h3>First Steps</h3>
            <p>Complete your first challenge</p>
            <div className="achievement-status">
              {userProgress.challengesCompleted.length > 0 ? 'Unlocked' : 'Locked'}
            </div>
          </div>
          
          <div className="achievement-card locked">
            <div className="achievement-icon">🔥</div>
            <h3>On Fire</h3>
            <p>Maintain a 7-day learning streak</p>
            <div className="achievement-status">
              {userProgress.currentStreak >= 7 ? 'Unlocked' : `${userProgress.currentStreak}/7 days`}
            </div>
          </div>
          
          <div className="achievement-card locked">
            <div className="achievement-icon">🎯</div>
            <h3>Pattern Master</h3>
            <p>Master all patterns in a category</p>
            <div className="achievement-status">Locked</div>
          </div>
          
          <div className="achievement-card locked">
            <div className="achievement-icon">⚡</div>
            <h3>Speed Runner</h3>
            <p>Complete a challenge in under 5 minutes</p>
            <div className="achievement-status">Locked</div>
          </div>
        </div>
      </section>
    </div>
  );
};