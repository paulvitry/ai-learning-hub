import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './components/Home';
import { PatternLesson } from './components/PatternLesson';
import { PatternChallenge } from './components/PatternChallenge';
import { Progress } from './components/Progress';
import { Navigation } from './components/Navigation';
import { DesignPatternsProvider } from './context/DesignPatternsContext';
import './App.css';

function App() {
  return (
    <DesignPatternsProvider>
      <Router>
        <div className="app">
          <Navigation />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/lesson/:category/:pattern" element={<PatternLesson />} />
              <Route path="/challenge/:category/:pattern/:challengeId" element={<PatternChallenge />} />
            </Routes>
          </main>
        </div>
      </Router>
    </DesignPatternsProvider>
  );
}

export default App;
