import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface StaggeredLinesProps {
  text: string;
  lineStagger?: number;
  lineDuration?: number;
  startDelay?: number;
  onComplete?: () => void;
  className?: string;
  isPaused?: boolean;
  animationType?: 'slide' | 'fade' | 'bounce' | 'scale';
}

const StaggeredLines: React.FC<StaggeredLinesProps> = memo(({
  text,
  lineStagger,
  lineDuration = 0.8,
  startDelay = 0,
  onComplete,
  className = '',
  isPaused = false,
  animationType = 'slide'
}) => {
  const { themeAnalysis } = useTheme();
  const [visibleLineCount, setVisibleLineCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPausedState, setIsPausedState] = useState(isPaused);

  // Split text into lines
  const lines = useMemo(() => {
    if (!text) return [];
    return text.split('\n').filter(line => line.trim().length > 0);
  }, [text]);

  // Get stagger delay from theme or use prop - reduced for subtler effect
  const effectiveLineStagger = lineStagger || 
    (themeAnalysis?.animation?.timing?.stagger_delay || 100) / 1000; // Reduced from 200

  useEffect(() => {
    setIsPausedState(isPaused);
  }, [isPaused]);

  useEffect(() => {
    // Reset when text changes
    setVisibleLineCount(0);
    setIsAnimating(false);
  }, [text]);

  useEffect(() => {
    if (isPausedState || visibleLineCount >= lines.length) {
      if (visibleLineCount >= lines.length && !isAnimating) {
        onComplete?.();
      }
      return;
    }

    setIsAnimating(true);

    const timeout = setTimeout(() => {
      setVisibleLineCount(prev => prev + 1);
    }, visibleLineCount === 0 ? startDelay : effectiveLineStagger * 1000);

    return () => clearTimeout(timeout);
  }, [visibleLineCount, lines.length, effectiveLineStagger, startDelay, isPausedState, isAnimating, onComplete]);

  const getLineVariants = () => {
    const baseTransition = {
      duration: 0.3, // Reduced from 0.8
      ease: "easeOut"
    };

    switch (animationType) {
      case 'slide':
        return {
          hidden: { opacity: 0, y: 10 }, // Reduced movement from -50, y: 10
          visible: { opacity: 1, y: 0, transition: baseTransition },
          exit: { opacity: 0, y: -5, transition: { duration: 0.2 } } // Reduced from 0.4
        };
      case 'fade':
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: baseTransition },
          exit: { opacity: 0, transition: { duration: 0.2 } } // Reduced from 0.3
        };
      case 'bounce':
        return {
          hidden: { opacity: 0, y: 10 }, // Reduced from y: 50, scale: 0.8
          visible: { 
            opacity: 1, 
            y: 0, 
            transition: { ...baseTransition, type: "spring", damping: 20, stiffness: 100 } // Reduced spring intensity
          },
          exit: { opacity: 0, y: -5, transition: { duration: 0.2 } } // Reduced from y: -20, scale: 0.9
        };
      case 'scale':
        return {
          hidden: { opacity: 0, scale: 0.95 }, // Reduced from scale: 0.5, rotateX: -15
          visible: { 
            opacity: 1, 
            scale: 1, 
            transition: baseTransition
          },
          exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } } // Reduced from scale: 0.8, rotateX: 15
        };
      default:
        return {
          hidden: { opacity: 0, y: 5 }, // Reduced from y: 20
          visible: { opacity: 1, y: 0, transition: baseTransition },
          exit: { opacity: 0, y: -3, transition: { duration: 0.2 } } // Reduced from y: -10
        };
    }
  };

  const lineVariants = getLineVariants();

  return (
    <div className={`staggered-lines ${className}`}>
      <AnimatePresence mode="wait">
        {lines.map((line, index) => {
          const isVisible = index < visibleLineCount;
          
          return (
            <motion.div
              key={`${text}-line-${index}`}
              className="poem-line"
              variants={lineVariants}
              initial="hidden"
              animate={isVisible ? "visible" : "hidden"}
              exit="exit"
              style={{
                transformOrigin: 'left center',
                willChange: 'transform, opacity',
                marginBottom: 'calc(var(--spacing-scale) * 0.75rem)'
              }}
              whileHover={{
                x: 2, // Reduced from 5
                transition: { duration: 0.15 } // Reduced from 0.2
              }}
            >
              {line}
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Progress indicator */}
      {lines.length > 0 && (
        <motion.div
          className="progress-indicator"
          initial={{ width: 0 }}
          animate={{ 
            width: `${(visibleLineCount / lines.length) * 100}%` 
          }}
          transition={{ duration: 0.3 }}
          style={{
            height: '2px',
            backgroundColor: 'var(--theme-accent)',
            marginTop: 'calc(var(--spacing-scale) * 1rem)',
            borderRadius: '1px',
            transformOrigin: 'left center'
          }}
        />
      )}
    </div>
  );
});

StaggeredLines.displayName = 'StaggeredLines';

export default StaggeredLines;

