import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePoem } from '../hooks/usePoem';
import MinimalistPoemInput from './MinimalistPoemInput';
import MinimalistPoemDisplay from './MinimalistPoemDisplay';
import { DynamicBackground } from './DynamicBackground';
import { MenuIcon, XIcon } from './icons/MinimalistIcons';

interface Theme {
  name: string;
  value: 'light' | 'dark';
}

const MinimalistApp: React.FC = () => {
  const { poemData, loading, generatePoem } = usePoem();
  const [currentTheme, setCurrentTheme] = useState<Theme>({ name: 'Light', value: 'light' });
  const [showSettings, setShowSettings] = useState(false);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme.value);
  }, [currentTheme]);

  // Handle poem generation
  const handleGeneratePoem = async (words: string[]) => {
    try {
      // Convert words array to WordInputs format
      const [verb = '', adjective = '', noun = ''] = words;
      await generatePoem({ verb, adjective, noun, words });
    } catch (error) {
      console.error('Failed to generate poem:', error);
    }
  };

  // Handle regeneration
  const handleRegenerate = async () => {
    if (poemData) {
      // Re-use the last words if available
      const lastWords = ['inspiration', 'creativity', 'poetry']; // This should come from state
      await handleGeneratePoem(lastWords);
    }
  };

  const toggleTheme = () => {
    setCurrentTheme(prev => ({
      name: prev.value === 'light' ? 'Dark' : 'Light',
      value: prev.value === 'light' ? 'dark' : 'light'
    }));
  };

  return (
    <div className="minimalist-app" style={{ position: 'relative', minHeight: '100vh' }}>
      {/* Dynamic Background */}
      <DynamicBackground
        text={poemData?.poem || ''}
        autoDetect={true}
        showControls={false}
      />

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
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.3)',
                backdropFilter: 'blur(4px)',
                zIndex: 'var(--z-modal-backdrop)'
              }}
            />
            
            {/* Settings Panel */}
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                width: '320px',
                background: 'var(--surface-card)',
                borderLeft: '1px solid var(--border-light)',
                zIndex: 'var(--z-modal)',
                padding: 'var(--space-6)',
                boxShadow: 'var(--shadow-2xl)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--space-8)'
              }}>
                <h2 className="text-xl font-semibold text-primary">Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="btn-ghost"
                  style={{
                    padding: 'var(--space-2)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <XIcon size={20} />
                </button>
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 
                  className="text-sm font-medium text-secondary"
                  style={{ 
                    marginBottom: 'var(--space-4)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)'
                  }}
                >
                  Appearance
                </h3>
                
                <button
                  onClick={toggleTheme}
                  className="btn-secondary"
                  style={{
                    width: '100%',
                    justifyContent: 'space-between',
                    padding: 'var(--space-4)'
                  }}
                >
                  <span>Theme</span>
                  <span style={{ color: 'var(--text-tertiary)' }}>
                    {currentTheme.name}
                  </span>
                </button>
              </div>

              <div style={{ marginBottom: 'var(--space-6)' }}>
                <h3 
                  className="text-sm font-medium text-secondary"
                  style={{ 
                    marginBottom: 'var(--space-4)',
                    textTransform: 'uppercase',
                    letterSpacing: 'var(--tracking-wider)'
                  }}
                >
                  About
                </h3>
                
                <p className="text-sm text-tertiary" style={{ lineHeight: 'var(--leading-relaxed)' }}>
                  WordWeave transforms your words into beautiful poetry using advanced AI. 
                  Each poem is unique and crafted specifically for your inspiration.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Settings Button */}
      <motion.button
        onClick={() => setShowSettings(true)}
        className="btn-ghost"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1, duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          position: 'fixed',
          top: 'var(--space-6)',
          right: 'var(--space-6)',
          zIndex: 'var(--z-fixed)',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'var(--glass-background)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--glass-border)',
          boxShadow: 'var(--shadow-lg)'
        }}
        aria-label="Open settings"
      >
        <MenuIcon size={20} />
      </motion.button>

      {/* Main Content */}
      <main style={{
        position: 'relative',
        zIndex: 1,
        padding: 'var(--space-6) var(--space-4)',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        <div className="container-md">
          <AnimatePresence mode="wait">
            {!poemData ? (
              <motion.div
                key="input"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <MinimalistPoemInput
                  onSubmit={handleGeneratePoem}
                  loading={loading.isLoading}
                />
              </motion.div>
            ) : (
              <motion.div
                key="poem"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <MinimalistPoemDisplay
                  poemData={poemData}
                  loading={loading}
                  onRegenerate={handleRegenerate}
                />
                
                {/* Back to Input Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 0.5 }}
                  style={{
                    textAlign: 'center',
                    marginTop: 'var(--space-12)'
                  }}
                >
                  <button
                    onClick={() => window.location.reload()} // Simple reset for now
                    className="btn-ghost"
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-tertiary)',
                      padding: 'var(--space-3) var(--space-6)'
                    }}
                  >
                    Create Another Poem
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: 'var(--space-6) var(--space-4)',
          borderTop: '1px solid var(--border-light)'
        }}
      >
        <p 
          className="text-sm text-tertiary"
          style={{ opacity: 0.6 }}
        >
          Made with inspiration by WordWeave
        </p>
      </motion.footer>
    </div>
  );
};

export default MinimalistApp;
