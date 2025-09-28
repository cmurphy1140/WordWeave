import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoem } from '../hooks/usePoem';
import LearningCurvePoemInput from './LearningCurvePoemInput';
import LearningCurvePoemDisplay from './LearningCurvePoemDisplay';

// SVG Icons (no emoji policy)
const SettingsIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>
);

const CloseIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const MoonIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const SunIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
  </svg>
);

interface ThemeMode {
  name: string;
  value: 'light' | 'dark';
  icon: React.ReactNode;
}

const LearningCurveApp: React.FC = () => {
  const { poemData, loading, error, generatePoem, clearPoem } = usePoem();
  const [showSettings, setShowSettings] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>({
    name: 'Light',
    value: 'light',
    icon: <SunIcon size={16} />
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.value);
    document.body.className = currentTheme.value === 'dark' ? 'dark-theme' : 'light-theme';
  }, [currentTheme]);

  // Handle poem generation
  const handleGeneratePoem = async (verb: string, adjective: string, noun: string) => {
    try {
      await generatePoem({ verb, adjective, noun });
    } catch (error) {
      console.error('Failed to generate poem:', error);
    }
  };

  // Handle theme toggle
  const toggleTheme = () => {
    setCurrentTheme(prev => ({
      name: prev.value === 'light' ? 'Dark' : 'Light',
      value: prev.value === 'light' ? 'dark' : 'light',
      icon: prev.value === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />
    }));
  };

  // Handle new poem creation
  const handleNewPoem = () => {
    clearPoem();
  };

  return (
    <div className="learning-curve-app">
      {/* Background with subtle grain */}
      <div className="app-background" />

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSettings(false)}
              className="settings-backdrop"
            />

            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, x: 320 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 320 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="settings-panel"
            >
              {/* Settings Header */}
              <div className="settings-header">
                <h2 className="text-display-md font-semibold text-primary">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn btn-ghost btn-icon-sm"
                  aria-label="Close settings"
                >
                  <CloseIcon size={18} />
                </button>
              </div>

              {/* Appearance Section */}
              <div className="settings-section">
                <h3 className="text-caption text-tertiary">Appearance</h3>

                <button
                  onClick={toggleTheme}
                  className="settings-item"
                >
                  <span className="settings-item-label">
                    <span>Theme</span>
                    <span className="settings-item-description">
                      Choose light or dark appearance
                    </span>
                  </span>
                  <span className="settings-item-value">
                    {currentTheme.icon}
                    {currentTheme.name}
                  </span>
                </button>
              </div>

              {/* About Section */}
              <div className="settings-section">
                <h3 className="text-caption text-tertiary">About</h3>

                <div className="about-content">
                  <div className="about-icon">
                    <SparklesIcon size={24} />
                  </div>
                  <div className="about-text">
                    <h4 className="text-body-md font-semibold text-primary">WordWeave</h4>
                    <p className="text-body-sm text-secondary">
                      Transform your words into beautiful poetry using advanced AI.
                      Each poem is unique and crafted specifically for your inspiration.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Button */}
      <motion.button
        onClick={() => setShowSettings(true)}
        className="settings-button"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Open settings"
      >
        <SettingsIcon size={20} />
      </motion.button>

      {/* Main Content */}
      <main className="app-main">
        <div className="container-md">
          <AnimatePresence mode="wait">
            {!poemData ? (
              <motion.div
                key="input"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.6 }}
                  className="app-header"
                >
                  <div className="header-icon">
                    <SparklesIcon size={32} />
                  </div>
                  <h1 className="text-display-xl font-bold text-primary">WordWeave</h1>
                  <p className="text-body-lg text-secondary header-subtitle">
                    Transform three words into beautiful poetry with AI
                  </p>
                </motion.div>

                {/* Input Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <LearningCurvePoemInput
                    onSubmit={handleGeneratePoem}
                    loading={loading.isLoading}
                    error={error}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="poem"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="content-section"
              >
                <LearningCurvePoemDisplay
                  poemData={poemData}
                  loading={loading}
                  onNewPoem={handleNewPoem}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="app-footer"
      >
        <p className="text-body-sm text-tertiary">
          Crafted with AI and inspiration
        </p>
      </motion.footer>
    </div>
  );
};

export default LearningCurveApp;