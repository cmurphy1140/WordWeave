import React, { useState, useEffect, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface MorphingTextProps {
  currentText: string;
  previousText?: string;
  morphDuration?: number;
  morphType?: 'slide' | 'fade' | 'flip' | 'wave' | 'spiral';
  className?: string;
  isPaused?: boolean;
  preserveHeight?: boolean;
  onMorphComplete?: () => void;
}

const MorphingText: React.FC<MorphingTextProps> = memo(({
  currentText,
  previousText,
  morphDuration,
  morphType = 'wave',
  className = '',
  isPaused = false,
  preserveHeight = true,
  onMorphComplete
}) => {
  const { themeAnalysis } = useTheme();
  const [displayText, setDisplayText] = useState(currentText);
  const [isMorphing, setIsMorphing] = useState(false);

  // Get morph duration from theme or use prop
  const effectiveMorphDuration = morphDuration || 
    (themeAnalysis?.animation?.timing?.duration ? themeAnalysis.animation.timing.duration / 1000 : 1.2);

  // Memoize text analysis for smooth transitions
  const textAnalysis = useMemo(() => {
    const current = currentText?.split('') || [];
    const previous = previousText?.split('') || [];
    const maxLength = Math.max(current.length, previous.length);
    
    return Array.from({ length: maxLength }, (_, index) => ({
      current: current[index] || '',
      previous: previous[index] || '',
      hasChanged: current[index] !== previous[index]
    }));
  }, [currentText, previousText]);

  useEffect(() => {
    if (currentText !== displayText && !isPaused) {
      setIsMorphing(true);
      
      const timeout = setTimeout(() => {
        setDisplayText(currentText);
        setIsMorphing(false);
        onMorphComplete?.();
      }, effectiveMorphDuration * 1000 * 0.5);

      return () => clearTimeout(timeout);
    }
  }, [currentText, displayText, effectiveMorphDuration, isPaused, onMorphComplete]);

  const getMorphVariants = () => {
    const baseTransition = {
      duration: effectiveMorphDuration,
      ease: themeAnalysis?.animation?.timing?.easing || "easeInOut"
    };

    switch (morphType) {
      case 'slide':
        return {
          initial: { x: -100, opacity: 0 },
          animate: { x: 0, opacity: 1 },
          exit: { x: 100, opacity: 0 },
          transition: baseTransition
        };
      
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: baseTransition
        };
      
      case 'flip':
        return {
          initial: { rotateY: 90, opacity: 0 },
          animate: { rotateY: 0, opacity: 1 },
          exit: { rotateY: -90, opacity: 0 },
          transition: baseTransition
        };
      
      case 'wave':
        return {
          initial: { y: 50, opacity: 0, scale: 0.8 },
          animate: { y: 0, opacity: 1, scale: 1 },
          exit: { y: -50, opacity: 0, scale: 1.1 },
          transition: { ...baseTransition, type: "spring", damping: 20 }
        };
      
      case 'spiral':
        return {
          initial: { rotate: -180, scale: 0, opacity: 0 },
          animate: { rotate: 0, scale: 1, opacity: 1 },
          exit: { rotate: 180, scale: 0, opacity: 0 },
          transition: baseTransition
        };
      
      default:
        return {
          initial: { y: 20, opacity: 0 },
          animate: { y: 0, opacity: 1 },
          exit: { y: -20, opacity: 0 },
          transition: baseTransition
        };
    }
  };

  const morphVariants = getMorphVariants();

  // Character-level morphing for smooth transitions
  const renderCharacterMorph = () => {
    return (
      <div className="character-morph">
        {textAnalysis.map((char, index) => (
          <motion.span
            key={`char-${index}`}
            className={`char ${char.hasChanged ? 'changing' : 'stable'}`}
            initial={char.hasChanged ? morphVariants.initial : undefined}
            animate={morphVariants.animate}
            exit={char.hasChanged ? morphVariants.exit : undefined}
            transition={{
              ...morphVariants.transition,
              delay: index * 0.02 // Stagger character animations
            }}
            style={{
              display: 'inline-block',
              transformOrigin: 'center center',
              willChange: 'transform, opacity',
              minWidth: char.current === ' ' ? '0.5ch' : undefined
            }}
          >
            {char.current}
          </motion.span>
        ))}
      </div>
    );
  };

  // Word-level morphing for dramatic effects
  const renderWordMorph = () => {
    const currentWords = currentText.split(/(\s+)/);
    // const previousWords = previousText?.split(/(\s+)/) || []; // Available for future enhancements
    
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={currentText}
          className="word-morph"
          {...morphVariants}
          style={{
            transformOrigin: 'center center',
            willChange: 'transform, opacity'
          }}
        >
          {currentWords.map((word, index) => (
            <motion.span
              key={`word-${index}`}
              className={`word ${/^\s+$/.test(word) ? 'space' : 'text'}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: effectiveMorphDuration * 0.6,
                delay: index * 0.05,
                ease: "easeOut"
              }}
              style={{
                display: 'inline-block',
                whiteSpace: /^\s+$/.test(word) ? 'pre' : 'normal'
              }}
            >
              {word}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    );
  };

  return (
    <div 
      className={`morphing-text ${className}`}
      style={{
        position: 'relative',
        minHeight: preserveHeight ? '1.2em' : undefined
      }}
    >
      {/* Background morphing effect */}
      {isMorphing && (
        <motion.div
          className="morph-background"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 0], 
            opacity: [0, 0.3, 0] 
          }}
          transition={{ 
            duration: effectiveMorphDuration,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '120%',
            height: '120%',
            background: `radial-gradient(circle, var(--theme-accent) 0%, transparent 70%)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: -1
          }}
        />
      )}

      {/* Character-level morphing for fine control */}
      {previousText && morphType === 'wave' ? renderCharacterMorph() : renderWordMorph()}

      {/* Progress ripple effect */}
      {isMorphing && (
        <motion.div
          className="morph-ripple"
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 3, opacity: 0 }}
          transition={{ 
            duration: effectiveMorphDuration * 0.8,
            ease: "easeOut"
          }}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            border: `2px solid var(--theme-primary)`,
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Morphing status indicator */}
      {isMorphing && (
        <motion.div
          className="morph-indicator"
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ duration: effectiveMorphDuration }}
          style={{
            position: 'absolute',
            bottom: '-8px',
            left: 0,
            height: '2px',
            backgroundColor: 'var(--theme-accent)',
            borderRadius: '1px',
            transformOrigin: 'left center'
          }}
        />
      )}
    </div>
  );
});

MorphingText.displayName = 'MorphingText';

export default MorphingText;
