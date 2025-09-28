import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface FadeInWordsProps {
  text: string;
  staggerDelay?: number;
  wordDuration?: number;
  startDelay?: number;
  onComplete?: () => void;
  className?: string;
  isPaused?: boolean;
  preserveSpaces?: boolean;
}

const FadeInWords: React.FC<FadeInWordsProps> = memo(({
  text,
  staggerDelay,
  wordDuration = 0.6,
  startDelay = 0,
  onComplete,
  className = '',
  isPaused = false,
  preserveSpaces = true
}) => {
  const { themeAnalysis } = useTheme();
  const [visibleWordCount, setVisibleWordCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPausedState, setIsPausedState] = useState(isPaused);

  // Split text into words while preserving spaces
  const words = useMemo(() => {
    if (!text) return [];
    return text.split(/(\s+)/).filter(word => word.length > 0);
  }, [text]);

  // Get stagger delay from theme or use prop
  const effectiveStaggerDelay = staggerDelay || 
    (themeAnalysis?.animation?.timing?.stagger_delay || 150) / 1000;

  useEffect(() => {
    setIsPausedState(isPaused);
  }, [isPaused]);

  useEffect(() => {
    // Reset when text changes
    setVisibleWordCount(0);
    setIsAnimating(false);
  }, [text]);

  useEffect(() => {
    if (isPausedState || visibleWordCount >= words.length) {
      if (visibleWordCount >= words.length && !isAnimating) {
        onComplete?.();
      }
      return;
    }

    setIsAnimating(true);
    
    const timeout = setTimeout(() => {
      setVisibleWordCount(prev => prev + 1);
    }, visibleWordCount === 0 ? startDelay : effectiveStaggerDelay * 1000);

    return () => clearTimeout(timeout);
  }, [visibleWordCount, words.length, effectiveStaggerDelay, startDelay, isPausedState, isAnimating, onComplete]);

  const wordVariants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.8
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: wordDuration,
        ease: themeAnalysis?.animation?.timing?.easing || "easeOut"
      }
    },
    exit: {
      opacity: 0,
      y: -10,
      scale: 0.9,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div className={`fade-in-words ${className}`}>
      <AnimatePresence mode="wait">
        {words.map((word, index) => {
          const isVisible = index < visibleWordCount;
          const isSpace = /^\s+$/.test(word);
          
          return (
            <motion.span
              key={`${text}-${index}`}
              className={`word ${isSpace ? 'space' : 'text'}`}
              variants={wordVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              exit="exit"
              style={{
                display: 'inline-block',
                whiteSpace: preserveSpaces && isSpace ? 'pre' : 'normal',
                marginRight: isSpace ? 0 : undefined,
                transformOrigin: 'left center',
                willChange: 'transform, opacity'
              }}
            >
              {isSpace && preserveSpaces ? word : word}
            </motion.span>
          );
        })}
      </AnimatePresence>
    </div>
  );
});

FadeInWords.displayName = 'FadeInWords';

export default FadeInWords;

