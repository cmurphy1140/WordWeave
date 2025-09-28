import React, { useState, useEffect, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface TypewriterTextProps {
  text: string;
  speed?: number; // characters per second
  startDelay?: number;
  onComplete?: () => void;
  className?: string;
  isPaused?: boolean;
  showCursor?: boolean;
}

const TypewriterText: React.FC<TypewriterTextProps> = memo(({
  text,
  speed,
  startDelay = 0,
  onComplete,
  className = '',
  isPaused = false,
  showCursor = true
}) => {
  const { themeAnalysis } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isPausedState, setIsPausedState] = useState(isPaused);

  // Get animation speed from theme or use prop
  const effectiveSpeed = speed || (themeAnalysis?.animation?.timing?.duration ? 
    Math.max(1, 10 - (themeAnalysis.animation.timing.duration / 300)) : 3);

  const typeNextCharacter = useCallback(() => {
    if (currentIndex < text.length && !isPausedState) {
      setDisplayedText(text.slice(0, currentIndex + 1));
      setCurrentIndex(prev => prev + 1);
    } else if (currentIndex >= text.length && !isComplete) {
      setIsComplete(true);
      onComplete?.();
    }
  }, [currentIndex, text, isPausedState, isComplete, onComplete]);

  useEffect(() => {
    setIsPausedState(isPaused);
  }, [isPaused]);

  useEffect(() => {
    // Reset when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    setIsComplete(false);
  }, [text]);

  useEffect(() => {
    if (isComplete || isPausedState) return;

    const timeout = setTimeout(() => {
      typeNextCharacter();
    }, currentIndex === 0 ? startDelay : 1000 / effectiveSpeed);

    return () => clearTimeout(timeout);
  }, [currentIndex, effectiveSpeed, startDelay, typeNextCharacter, isComplete, isPausedState]);

  return (
    <div className={`typewriter-text ${className}`}>
      <motion.span
        className="typewriter-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        {displayedText}
      </motion.span>
      
      {showCursor && (
        <motion.span
          className="typewriter-cursor"
          animate={{ 
            opacity: isComplete ? 0 : [1, 1, 0, 0] 
          }}
          transition={{ 
            duration: 1.2, 
            repeat: isComplete ? 0 : Infinity,
            ease: "linear" 
          }}
          style={{
            display: 'inline-block',
            width: '2px',
            height: '1.2em',
            backgroundColor: 'var(--theme-primary)',
            marginLeft: '2px',
            transform: 'translateY(0.1em)'
          }}
        />
      )}
    </div>
  );
});

TypewriterText.displayName = 'TypewriterText';

export default TypewriterText;

