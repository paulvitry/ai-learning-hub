import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDesignPatterns } from '../context/DesignPatternsContext';
import { Target, ArrowRight, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './PatternLesson.css';

export const PatternLesson: React.FC = () => {
  const { category, pattern } = useParams<{ category: string; pattern: string }>();
  const { getPatternByIds, userProgress } = useDesignPatterns();
  const [lessonContent, setLessonContent] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const patternData = category && pattern ? getPatternByIds(category, pattern) : undefined;

  useEffect(() => {
    const loadLessonContent = async () => {
      if (!patternData?.lessonFile) return;
      
      try {
        // In a real app, you would load the markdown file
        // For now, we'll use a placeholder
        const response = await fetch(`/${patternData.lessonFile}`);
        if (response.ok) {
          const content = await response.text();
          setLessonContent(content);
        } else {
          // If fetch fails, provide a fallback with pattern information
          setLessonContent(`# ${patternData.name} Pattern

## Overview
The ${patternData.name} pattern ${patternData.description.toLowerCase()}.

## When to Use
This pattern is classified as **${patternData.category}** with **${patternData.difficulty}** difficulty level.

## Available Challenges
You have ${patternData.challenges.length} challenges available to practice this pattern.

*Note: Detailed lesson content is being loaded. If this message persists, please check the lesson file path: \`${patternData.lessonFile}\`*`);
        }
      } catch (error) {
        setLessonContent(`# ${patternData.name} Pattern\n\n## Overview\n\nThe ${patternData.name} pattern ${patternData.description.toLowerCase()}.\n\n*Lesson content is being loaded...*`);
      }
      setLoading(false);
    };

    loadLessonContent();
  }, [patternData]);

  if (!patternData) {
    return (
      <div className="lesson-error">
        <h2>Pattern Not Found</h2>
        <p>The requested pattern could not be found.</p>
        <Link to="/" className="btn btn-primary">
          <ArrowLeft size={16} />
          Back to Home
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="lesson-loading">
        <div className="loader"></div>
        <p>Loading lesson...</p>
      </div>
    );
  }

  return (
    <div className="pattern-lesson">
      <header className="lesson-header">
        <div className="breadcrumb">
          <Link to="/">Home</Link>
          <span className="separator">/</span>
          <span className="category">{category}</span>
          <span className="separator">/</span>
          <span className="current">{patternData.name}</span>
        </div>
        
        <div className="pattern-info">
          <h1>{patternData.name} Pattern</h1>
          <p className="pattern-description">{patternData.description}</p>
          <div className="pattern-meta">
            <span className={`difficulty difficulty-${patternData.difficulty}`}>
              {patternData.difficulty}
            </span>
            <span className="challenges-available">
              {patternData.challenges.length} challenges available
            </span>
          </div>
        </div>
      </header>

      <div className="lesson-content">
        <div className="markdown-content">
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : 'javascript';
                
                return !inline ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={language}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {lessonContent}
          </ReactMarkdown>
        </div>
      </div>

      <footer className="lesson-footer">
        <div className="lesson-navigation">
          <Link to="/" className="btn btn-outline">
            <ArrowLeft size={16} />
            Back to Patterns
          </Link>
          
          {patternData.challenges.length > 0 && (
            <Link 
              to={`/challenge/${category}/${pattern}/${patternData.challenges[0].id}`}
              className="btn btn-primary"
            >
              Start Challenges
              <ArrowRight size={16} />
            </Link>
          )}
        </div>

        <div className="challenges-preview">
          <h3>Available Challenges</h3>
          <div className="challenges-list">
            {patternData.challenges.map((challenge, index) => {
              const isCompleted = userProgress.challengesCompleted.includes(challenge.id);
              return (
                <Link
                  key={challenge.id}
                  to={`/challenge/${category}/${pattern}/${challenge.id}`}
                  className={`challenge-preview ${isCompleted ? 'completed' : ''}`}
                >
                  <div className="challenge-number">
                    {isCompleted ? '✅' : index + 1}
                  </div>
                  <div className="challenge-info">
                    <h4>{challenge.title}</h4>
                    <p>{challenge.description}</p>
                    <div className="challenge-meta">
                      <span className={`difficulty difficulty-${challenge.difficulty}`}>
                        {challenge.difficulty}
                      </span>
                      <span className="points">{challenge.points} pts</span>
                      {isCompleted && <span className="completed-badge">Completed</span>}
                    </div>
                  </div>
                  <Target size={20} className="challenge-icon" />
                </Link>
              );
            })}
          </div>
        </div>
      </footer>
    </div>
  );
};