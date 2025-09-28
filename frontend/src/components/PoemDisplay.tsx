import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PoemData, LoadingState } from '../types';
import PoemActions from './PoemActions';

interface PoemDisplayProps {
  poemData: PoemData | null;
  loading: LoadingState;
  className?: string;
}

const PoemDisplay: React.FC<PoemDisplayProps> = ({ poemData, loading, className = '' }) => {
  console.log('🎨 PoemDisplay received:', { 
    poemData: poemData ? 'EXISTS' : 'NULL', 
    loading,
    hasAnalysis: !!poemData?.analysis,
    analysisKeys: poemData?.analysis ? Object.keys(poemData.analysis) : [],
    visualRecs: poemData?.analysis?.visualRecommendations ? 'EXISTS' : 'MISSING'
  });

  // Generate dynamic styles based on theme analysis
  const dynamicStyles = useMemo(() => {
    if (!poemData?.analysis?.visualRecommendations) {
      console.log('🎨 No visual recommendations found');
      return {};
    }

    console.log('🎨 Applying visual recommendations:', poemData.analysis.visualRecommendations);
    const { colors, typography, effects } = poemData.analysis.visualRecommendations;
    
    const styles = {
      '--poem-primary-color': colors.primary,
      '--poem-secondary-color': colors.secondary,
      '--poem-accent-color': colors.accent,
      '--poem-background-color': colors.background,
      '--poem-gradient': `linear-gradient(135deg, ${colors.gradient.join(', ')})`,
      '--poem-font-family': typography.fontFamily === 'serif' ? '"Crimson Text", Georgia, serif' : '"Inter", sans-serif',
      '--poem-font-weight': typography.fontWeight === 'light' ? '300' : typography.fontWeight === 'bold' ? '700' : '400',
      '--poem-letter-spacing': typography.letterSpacing === 'wide' ? '0.1em' : typography.letterSpacing === 'tight' ? '-0.02em' : '0.02em',
      '--poem-line-height': typography.lineHeight,
      '--poem-font-size': typography.fontSize === 'large' ? '1.5rem' : typography.fontSize === 'small' ? '1rem' : '1.25rem',
      '--poem-blur': effects.blur ? 'blur(0.5px)' : 'none',
      '--poem-glow': effects.glow ? `0 0 20px ${colors.accent}40` : 'none',
      '--poem-shadow': effects.shadow ? `0 8px 32px ${colors.primary}20` : 'none',
    } as React.CSSProperties;
    
    console.log('🎨 Generated CSS variables:', styles);
    return styles;
  }, [poemData?.analysis?.visualRecommendations]);

  if (loading.isLoading) {
    return (
      <motion.div
        className={`poem-display loading ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="loading-content">
          <div className="loading-spinner"></div>
          <p className="loading-text">{loading.loadingText || 'Generating your poem...'}</p>
          {loading.progress !== undefined && (
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${loading.progress}%` }}
              ></div>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  if (!poemData) {
    return (
      <motion.div
        className={`poem-display empty ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="placeholder-content">
          <div className="placeholder-icon">✨</div>
          <h3 className="placeholder-title">Your Poem Will Appear Here</h3>
          <p className="placeholder-text">
            Enter three words above to generate a beautiful, personalized poem
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`poem-display ${className}`}
      style={dynamicStyles}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2, duration: 0.8 }}
    >
      {/* Poem Header */}
      <motion.div
        className="poem-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <h2 className="poem-title">Your Generated Poem</h2>
        <div className="poem-metadata">
          <span className="word-count">{poemData.metadata.wordCount} words</span>
          <span className="separator">•</span>
          <span className="emotion">{poemData.metadata.emotion}</span>
          <span className="separator">•</span>
          <span className="generation-time">
            {poemData.metadata.generationTime.toFixed(1)}s
          </span>
        </div>
      </motion.div>

      {/* Poem Content with Dynamic Styling */}
      <motion.div
        className="poem-content-wrapper"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <div className={`poem-text-container ${poemData.analysis ? 'themed' : ''}`}>
          {poemData.analysis && (
            <div className="theme-indicator">
              🎨 Theme: {poemData.analysis.themeAnalysis.emotional_tone.primary}
            </div>
          )}
          <pre className={`poem-text ${poemData.analysis ? 'themed' : ''}`}>
            {poemData.poem}
          </pre>
        </div>
      </motion.div>

      {/* Poem Actions */}
      <PoemActions poemData={poemData} />
    </motion.div>
  );
};

export default PoemDisplay;