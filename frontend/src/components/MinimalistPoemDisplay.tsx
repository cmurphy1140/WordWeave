import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PoemData, LoadingState } from '../types';
import PoemActions from './PoemActions';
import { SparklesIcon } from './icons/MinimalistIcons';

interface MinimalistPoemDisplayProps {
  poemData: PoemData | null;
  loading: LoadingState;
  onRegenerate?: () => void;
  className?: string;
}

const MinimalistPoemDisplay: React.FC<MinimalistPoemDisplayProps> = ({ 
  poemData, 
  loading, 
  onRegenerate,
  className = '' 
}) => {
  // Generate subtle theme-based styling
  const themeStyles = useMemo(() => {
    if (!poemData?.analysis?.visualRecommendations) {
      return {};
    }

    const { colors } = poemData.analysis.visualRecommendations;
    
    return {
      '--poem-accent': colors.accent || 'var(--color-primary-500)',
      '--poem-gradient-start': colors.primary || 'var(--color-primary-600)',
      '--poem-gradient-end': colors.secondary || 'var(--color-primary-700)',
    } as React.CSSProperties;
  }, [poemData?.analysis?.visualRecommendations]);

  if (loading.isLoading) {
    return (
      <motion.div
        className={`minimalist-poem-display loading ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-16) var(--space-4)',
          minHeight: '400px'
        }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: 'linear' 
          }}
          style={{
            marginBottom: 'var(--space-6)'
          }}
        >
          <SparklesIcon size={32} />
        </motion.div>
        
        <motion.h3
          className="text-xl font-medium text-primary"
          style={{ marginBottom: 'var(--space-3)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity, 
            ease: 'easeInOut' 
          }}
        >
          {loading.loadingText || 'Crafting your poem...'}
        </motion.h3>
        
        {loading.progress !== undefined && (
          <motion.div
            style={{
              width: '240px',
              height: '2px',
              background: 'var(--border-light)',
              borderRadius: 'var(--radius-full)',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <motion.div
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--color-primary-500), var(--color-primary-600))',
                borderRadius: 'var(--radius-full)'
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${loading.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </motion.div>
        )}
      </motion.div>
    );
  }

  if (!poemData) {
    return (
      <motion.div
        className={`minimalist-poem-display empty ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 'var(--space-20) var(--space-4)',
          textAlign: 'center'
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            marginBottom: 'var(--space-8)'
          }}
        >
          <SparklesIcon size={48} className="text-tertiary" />
        </motion.div>
        
        <h3 
          className="text-2xl font-light text-primary"
          style={{ marginBottom: 'var(--space-4)' }}
        >
          Your poem awaits
        </h3>
        
        <p className="text-lg text-secondary" style={{ maxWidth: '400px' }}>
          Enter three inspiring words above to create a unique, personalized poem
        </p>
      </motion.div>
    );
  }

  return (
    <motion.article
      className={`minimalist-poem-display ${className}`}
      style={{
        ...themeStyles,
        maxWidth: '800px',
        margin: '0 auto'
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      {/* Poem Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-10)'
        }}
      >
        <div 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-2) var(--space-4)',
            background: 'var(--surface-elevated)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--border-light)',
            fontSize: 'var(--text-sm)',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-6)'
          }}
        >
          <span>{poemData.metadata.wordCount} words</span>
          <div style={{ 
            width: '4px', 
            height: '4px', 
            borderRadius: '50%', 
            background: 'var(--border-medium)' 
          }} />
          <span>{poemData.metadata.emotion}</span>
          <div style={{ 
            width: '4px', 
            height: '4px', 
            borderRadius: '50%', 
            background: 'var(--border-medium)' 
          }} />
          <span>{poemData.metadata.generationTime.toFixed(1)}s</span>
        </div>
      </motion.header>

      {/* Main Poem Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-3xl)',
          padding: 'var(--space-12) var(--space-8)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle background accent */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, 
              var(--poem-gradient-start, var(--color-primary-500)), 
              var(--poem-gradient-end, var(--color-primary-600))
            )`,
            borderRadius: 'var(--radius-3xl) var(--radius-3xl) 0 0'
          }}
        />

        <pre
          className="poem-text"
          style={{
            fontFamily: '"Crimson Text", Georgia, serif',
            fontSize: 'clamp(var(--text-lg), 2.5vw, var(--text-2xl))',
            lineHeight: 'var(--leading-relaxed)',
            color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-word',
            textAlign: 'center',
            fontWeight: 'var(--font-normal)',
            letterSpacing: 'var(--tracking-wide)',
            margin: 0
          }}
        >
          {poemData.poem}
        </pre>
      </motion.div>

      {/* Theme Analysis (Minimal) */}
      {poemData.analysis && (
        <motion.aside
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            marginTop: 'var(--space-8)',
            textAlign: 'center'
          }}
        >
          <div 
            style={{
              display: 'inline-flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              justifyContent: 'center'
            }}
          >
            {(poemData.analysis?.themes || poemData.analysis?.themeAnalysis?.themes || []).slice(0, 3).map((theme: string) => (
              <span
                key={theme}
                style={{
                  padding: 'var(--space-1) var(--space-3)',
                  background: 'var(--surface-elevated)',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-tertiary)',
                  border: '1px solid var(--border-light)',
                  textTransform: 'uppercase',
                  letterSpacing: 'var(--tracking-wider)',
                  fontWeight: 'var(--font-medium)'
                }}
              >
                {theme}
              </span>
            ))}
          </div>
        </motion.aside>
      )}

      {/* Actions */}
      <PoemActions 
        poemData={poemData} 
        onRegenerate={onRegenerate}
      />
    </motion.article>
  );
};

export default MinimalistPoemDisplay;
