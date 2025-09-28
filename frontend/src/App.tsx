import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HomePage, AnimationShowcasePage, PipelineTestPage, GeneratedPoemPage } from './pages';
import TypographyDemo from './pages/TypographyDemo';
import ColorSystemPage from './pages/ColorSystemPage';
import Navigation from './components/Navigation';
import LearningCurveApp from './components/LearningCurveApp';
import MinimalistApp from './components/MinimalistApp';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryProvider } from './providers/QueryProvider';
import { registerServiceWorker, swManager } from './utils/serviceWorker';
import { initializePerformanceMonitoring } from './utils/performance';
import { useCacheWarming } from './hooks/useApiQueries';
import { preloadAnimationComponents } from './components/LazyAnimationComponents';
import './styles/learning-curve-theme.css';
import './styles/learning-curve-components.css';
import './styles/learning-curve-app.css';
import './styles/learning-curve-input.css';
import './styles/learning-curve-display.css';
import './styles/dial-inspired.css';
import './styles/app-dial.css';
import './styles/poem-generator.css';
import './styles/smooth-animations.css';
import './styles/typography-system.css';
import './styles/color-system.css';
import './styles/poetry-micro-interactions.css';
import './styles/design-system.css';
import './App.css';

const App: React.FC = () => {
  // Initialize performance monitoring
  useEffect(() => {
    initializePerformanceMonitoring({
      enableReporting: true,
      debugMode: process.env.NODE_ENV === 'development',
      sampleRate: 1.0,
    });
  }, []);

  // Initialize Service Worker
  useEffect(() => {
    registerServiceWorker({
      onSuccess: (registration) => {
        console.log('Service Worker registered successfully:', registration);
        swManager.initialize();
      },
      onUpdate: (registration) => {
        console.log('Service Worker updated:', registration);
      },
      onOfflineReady: (registration) => {
        console.log('App is ready for offline use:', registration);
      },
    });
  }, []);

  // Preload critical components
  useEffect(() => {
    setTimeout(() => {
      preloadAnimationComponents();
    }, 2000);
  }, []);

  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
};

const AppContent: React.FC = () => {
  const { startBackgroundWarming } = useCacheWarming();

  useEffect(() => {
    // Start background cache warming
    const cleanup = startBackgroundWarming();
    return cleanup;
  }, [startBackgroundWarming]);

  return (
    <Router>
      <Routes>
        {/* Main Learning Curve app */}
        <Route path="/" element={<LearningCurveApp />} />

        {/* Alternative minimalist app */}
        <Route path="/minimalist" element={<MinimalistApp />} />
        
        {/* Legacy routes for development/testing */}
        <Route path="/legacy" element={
          <div className="app">
            <div className="app-container">
              <Navigation />
              <main className="app-main">
                <motion.header 
                  className="app-header"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <h1 className="app-title">WordWeave</h1>
                  <p className="app-subtitle">Where Words Paint Worlds</p>
                </motion.header>
                <HomePage />
              </main>
            </div>
          </div>
        } />
        
        <Route path="/showcase" element={<AnimationShowcasePage />} />
        <Route path="/pipeline" element={<PipelineTestPage />} />
        <Route path="/generated-poem" element={<GeneratedPoemPage />} />
        <Route path="/typography-demo" element={<TypographyDemo />} />
        <Route path="/color-system" element={<ColorSystemPage />} />
      </Routes>
    </Router>
    );
};

export default App;
