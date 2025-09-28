import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Logo Component with Animation
const AnimatedLogo: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="animated-logo"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Outer Circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="55"
              stroke="url(#gradient1)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, rotate: 0 }}
              animate={{ pathLength: 1, rotate: 360 }}
              transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
            />
            
            {/* Inner Weave Pattern */}
            <motion.path
              d="M30 60 Q45 30, 60 60 Q75 90, 90 60 Q75 30, 60 60 Q45 90, 30 60"
              stroke="url(#gradient2)"
              strokeWidth="3"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut", delay: 0.8 }}
            />
            
            {/* Center Word Mark */}
            <motion.text
              x="60"
              y="65"
              textAnchor="middle"
              fontSize="14"
              fontWeight="600"
              fill="url(#gradient3)"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 1.5 }}
            >
              WW
            </motion.text>
            
            {/* Floating Elements */}
            {[...Array(6)].map((_, i) => (
              <motion.circle
                key={i}
                cx={60 + Math.cos(i * Math.PI / 3) * 35}
                cy={60 + Math.sin(i * Math.PI / 3) * 35}
                r="2"
                fill="url(#gradient4)"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 1, 0.7],
                  scale: [0, 1.2, 1],
                  y: [0, -5, 0]
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  delay: 2 + (i * 0.2),
                  repeatType: "reverse"
                }}
              />
            ))}
            
            <defs>
              <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#667eea" />
                <stop offset="100%" stopColor="#764ba2" />
              </linearGradient>
              <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f093fb" />
                <stop offset="100%" stopColor="#f5576c" />
              </linearGradient>
              <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4facfe" />
                <stop offset="100%" stopColor="#00f2fe" />
              </linearGradient>
              <radialGradient id="gradient4">
                <stop offset="0%" stopColor="#ffecd2" />
                <stop offset="100%" stopColor="#fcb69f" />
              </radialGradient>
            </defs>
          </svg>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Typewriter Tagline Component
const TypewriterTagline: React.FC<{ isVisible: boolean; delay?: number }> = ({ 
  isVisible, 
  delay = 0 
}) => {
  const taglines = [
    "Where Words Dance into Poetry",
    "Crafting Verses from the Heart",
    "Your Thoughts, Beautifully Woven"
  ];
  
  const [currentTagline] = useState(taglines[0]);
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = setTimeout(() => {
      if (currentIndex < currentTagline.length) {
        setDisplayedText(currentTagline.slice(0, currentIndex + 1));
        setCurrentIndex(prev => prev + 1);
      }
    }, delay + (currentIndex * 100));

    return () => clearTimeout(timeout);
  }, [isVisible, currentIndex, currentTagline, delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="typewriter-tagline"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, delay: delay / 1000 }}
        >
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '300', 
            color: '#667eea',
            margin: 0,
            fontFamily: 'serif'
          }}>
            {displayedText}
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
              style={{ color: '#764ba2' }}
            >
              |
            </motion.span>
          </h2>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Parallax Background Layers
const ParallaxBackground: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="parallax-background" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -10,
          overflow: 'hidden'
        }}>
          {/* Base layer */}
          <motion.div
            className="bg-layer-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 2, delay: 0.5 }}
            style={{
              position: 'absolute',
              width: '120%',
              height: '120%',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              transform: 'translate(-10%, -10%)'
            }}
          />
          
          {/* Floating shapes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className={`floating-shape-${i}`}
              initial={{ opacity: 0, y: 100, x: Math.random() * 200 - 100 }}
              animate={{ 
                opacity: 0.05,
                y: -20,
                x: Math.random() * 50 - 25
              }}
              transition={{ 
                duration: 3 + Math.random() * 2, 
                delay: 1 + Math.random(),
                repeat: Infinity,
                repeatType: "reverse"
              }}
              style={{
                position: 'absolute',
                left: `${10 + (i * 12)}%`,
                top: `${20 + Math.random() * 60}%`,
                width: `${20 + Math.random() * 40}px`,
                height: `${20 + Math.random() * 40}px`,
                borderRadius: Math.random() > 0.5 ? '50%' : '20%',
                background: i % 2 === 0 ? '#f093fb' : '#4facfe'
              }}
            />
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// UI Cascade Animation
const UICascade: React.FC<{ isVisible: boolean; children: React.ReactNode }> = ({ 
  isVisible, 
  children 
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <div className="ui-cascade">
          {childrenArray.map((child, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{
                duration: 0.6,
                delay: 2.5 + (index * 0.1),
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
            >
              {child}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
};

// Main Initial Loading Component
interface InitialLoadingProps {
  isVisible: boolean;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const InitialLoadingSequence: React.FC<InitialLoadingProps> = ({ 
  isVisible, 
  onComplete,
  children 
}) => {
  useEffect(() => {
    if (isVisible && onComplete) {
      const timer = setTimeout(() => {
        onComplete();
      }, 4000); // Complete after 4 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="initial-loading-sequence"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fafafa',
            zIndex: 1000
          }}
        >
          <ParallaxBackground isVisible={isVisible} />
          
          <div style={{ textAlign: 'center', zIndex: 1 }}>
            <AnimatedLogo isVisible={isVisible} />
            <div style={{ marginTop: '2rem' }}>
              <TypewriterTagline isVisible={isVisible} delay={2000} />
            </div>
          </div>
          
          <UICascade isVisible={isVisible}>
            {children}
          </UICascade>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Generation Loading States

type GenerationPhase = 'gathering' | 'weaving' | 'painting' | 'revealing';

const FloatingDots: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="floating-dots" style={{ position: 'relative', width: '100px', height: '40px' }}>
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className={`dot-${i}`}
          style={{
            position: 'absolute',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#667eea',
            left: `${i * 20}px`,
            top: '16px'
          }}
          animate={isActive ? {
            y: [0, -10, 0],
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6]
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  );
};

const InterconnectingLines: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <svg width="120" height="80" viewBox="0 0 120 80" style={{ overflow: 'visible' }}>
      {[...Array(4)].map((_, i) => (
        <motion.path
          key={i}
          d={`M${20 + i * 25} 40 Q${40 + i * 25} ${20 + (i % 2) * 20} ${60 + i * 25} 40`}
          stroke="#f093fb"
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={isActive ? { 
            pathLength: 1, 
            opacity: 1,
            strokeDasharray: [0, 100, 0]
          } : { pathLength: 0, opacity: 0 }}
          transition={{
            duration: 2,
            repeat: isActive ? Infinity : 0,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        />
      ))}
      
      {/* Connection points */}
      {[...Array(6)].map((_, i) => (
        <motion.circle
          key={i}
          cx={20 + i * 20}
          cy={40}
          r="3"
          fill="#764ba2"
          initial={{ scale: 0, opacity: 0 }}
          animate={isActive ? { 
            scale: [0, 1.5, 1],
            opacity: [0, 1, 0.8]
          } : { scale: 0, opacity: 0 }}
          transition={{
            duration: 1,
            delay: 0.5 + i * 0.1,
            repeat: isActive ? Infinity : 0,
            repeatDelay: 1
          }}
        />
      ))}
    </svg>
  );
};

const BloomingColors: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
  
  return (
    <div className="blooming-colors" style={{ position: 'relative', width: '100px', height: '100px' }}>
      {colors.map((color, i) => (
        <motion.div
          key={i}
          className={`color-bloom-${i}`}
          style={{
            position: 'absolute',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: color,
            left: '50%',
            top: '50%',
            transformOrigin: 'center'
          }}
          initial={{ scale: 0, x: '-50%', y: '-50%' }}
          animate={isActive ? {
            scale: [0, 2, 1.5],
            x: ['-50%', `${-50 + Math.cos(i * Math.PI / 3) * 30}%`, `${-50 + Math.cos(i * Math.PI / 3) * 25}%`],
            y: ['-50%', `${-50 + Math.sin(i * Math.PI / 3) * 30}%`, `${-50 + Math.sin(i * Math.PI / 3) * 25}%`],
            opacity: [0, 1, 0.8]
          } : { scale: 0, x: '-50%', y: '-50%' }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse"
          }}
        />
      ))}
      
      {/* Center pulse */}
      <motion.div
        style={{
          position: 'absolute',
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, #fff, transparent)',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)'
        }}
        animate={isActive ? {
          scale: [1, 3, 1],
          opacity: [0.8, 0.2, 0.8]
        } : {}}
        transition={{
          duration: 1.5,
          repeat: isActive ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    </div>
  );
};

const CurtainParts: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="curtain-parts" style={{ 
      position: 'relative', 
      width: '120px', 
      height: '80px',
      overflow: 'hidden',
      borderRadius: '8px',
      background: 'linear-gradient(45deg, #667eea, #764ba2)'
    }}>
      {/* Left curtain */}
      <motion.div
        className="curtain-left"
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(to right, #2d3748, #4a5568)',
          zIndex: 2
        }}
        initial={{ x: 0 }}
        animate={isActive ? { x: '-100%' } : { x: 0 }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
      />
      
      {/* Right curtain */}
      <motion.div
        className="curtain-right"
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '50%',
          height: '100%',
          background: 'linear-gradient(to left, #2d3748, #4a5568)',
          zIndex: 2
        }}
        initial={{ x: 0 }}
        animate={isActive ? { x: '100%' } : { x: 0 }}
        transition={{ duration: 2, ease: "easeInOut", delay: 0.5 }}
      />
      
      {/* Revealed content */}
      <motion.div
        className="revealed-content"
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: 'white',
          fontSize: '24px',
          fontWeight: 'bold'
        }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{ duration: 1, delay: 1.5 }}
      >
        ✨
      </motion.div>
    </div>
  );
};

interface GenerationLoadingProps {
  currentPhase: GenerationPhase | null;
  progress?: number;
}

export const GenerationLoading: React.FC<GenerationLoadingProps> = ({ 
  currentPhase, 
  progress = 0 
}) => {
  const phaseMessages = {
    gathering: "Gathering words...",
    weaving: "Weaving verses...", 
    painting: "Painting emotions...",
    revealing: "Revealing magic..."
  };

  const getPhaseComponent = (phase: GenerationPhase) => {
    switch (phase) {
      case 'gathering':
        return <FloatingDots isActive={currentPhase === 'gathering'} />;
      case 'weaving':
        return <InterconnectingLines isActive={currentPhase === 'weaving'} />;
      case 'painting':
        return <BloomingColors isActive={currentPhase === 'painting'} />;
      case 'revealing':
        return <CurtainParts isActive={currentPhase === 'revealing'} />;
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {currentPhase && (
        <motion.div
          className="generation-loading"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
            gap: '1.5rem'
          }}
        >
          {/* Animation Component */}
          <div className="phase-animation">
            {getPhaseComponent(currentPhase)}
          </div>
          
          {/* Phase Message */}
          <motion.p
            key={currentPhase} // Key ensures re-animation on phase change
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: '1.1rem',
              color: '#667eea',
              fontWeight: '500',
              margin: 0,
              textAlign: 'center'
            }}
          >
            {phaseMessages[currentPhase]}
          </motion.p>
          
          {/* Progress Bar */}
          <div 
            className="progress-container"
            style={{
              width: '200px',
              height: '4px',
              backgroundColor: '#e2e8f0',
              borderRadius: '2px',
              overflow: 'hidden'
            }}
          >
            <motion.div
              className="progress-bar"
              style={{
                height: '100%',
                backgroundColor: '#667eea',
                borderRadius: '2px'
              }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Skeleton Screens

const ShimmerEffect: React.FC<{ width: string; height: string; className?: string }> = ({
  width,
  height,
  className = ''
}) => (
  <div
    className={`shimmer-effect ${className}`}
    style={{
      width,
      height,
      backgroundColor: '#e2e8f0',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <motion.div
      className="shimmer-overlay"
      style={{
        position: 'absolute',
        top: 0,
        left: '-100%',
        width: '100%',
        height: '100%',
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
      }}
      animate={{
        left: ['−100%', '100%']
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    />
  </div>
);

const MorphingShape: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const shapes = [
    'M20,20 L80,20 L80,30 L20,30 Z', // Rectangle
    'M50,15 L65,40 L35,40 Z', // Triangle  
    'M50,50 m-30,0 a30,30 0 1,0 60,0 a30,30 0 1,0 -60,0', // Circle
    'M30,25 Q50,10 70,25 Q50,40 30,25' // Curved shape
  ];

  const [currentShape, setCurrentShape] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setCurrentShape(prev => (prev + 1) % shapes.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, shapes.length]);

  return (
    <svg width="100" height="60" viewBox="0 0 100 60">
      <motion.path
        d={shapes[currentShape]}
        fill="url(#morphGradient)"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={isActive ? { 
          scale: [0.8, 1.1, 1],
          opacity: [0.6, 1, 0.8]
        } : { scale: 0.8, opacity: 0.6 }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      
      <defs>
        <linearGradient id="morphGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#667eea" />
          <stop offset="100%" stopColor="#764ba2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

interface PoemSkeletonProps {
  linesCount?: number;
  isVisible: boolean;
}

export const PoemSkeleton: React.FC<PoemSkeletonProps> = ({ 
  linesCount = 8, 
  isVisible 
}) => {
  const poeticMessages = [
    "Verses are taking shape...",
    "Words are finding their rhythm...", 
    "Stanzas are aligning perfectly...",
    "Metaphors are weaving together...",
    "The poem is almost ready..."
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      setCurrentMessage(prev => (prev + 1) % poeticMessages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible, poeticMessages.length]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="poem-skeleton"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '600px',
            padding: '2rem',
            margin: '0 auto'
          }}
        >
          {/* Header skeleton */}
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <ShimmerEffect width="60%" height="2rem" className="title-skeleton" />
            <div style={{ marginTop: '0.5rem' }}>
              <ShimmerEffect width="40%" height="1rem" className="subtitle-skeleton" />
            </div>
          </div>

          {/* Poem lines skeleton */}
          <div className="poem-lines-skeleton" style={{ marginBottom: '2rem' }}>
            {[...Array(linesCount)].map((_, i) => (
              <motion.div
                key={i}
                style={{ marginBottom: '0.75rem' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: i * 0.1,
                  ease: "easeOut"
                }}
              >
                <ShimmerEffect 
                  width={`${60 + Math.random() * 30}%`} 
                  height="1.2rem"
                  className="line-skeleton" 
                />
              </motion.div>
            ))}
          </div>

          {/* Progress indicator with morphing shape */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center', 
            gap: '1rem' 
          }}>
            <MorphingShape isActive={isVisible} />
            
            <motion.p
              key={currentMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              style={{
                fontSize: '0.9rem',
                color: '#667eea',
                textAlign: 'center',
                fontStyle: 'italic',
                margin: 0
              }}
            >
              {poeticMessages[currentMessage]}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Content Block Skeleton
interface ContentSkeletonProps {
  isVisible: boolean;
  variant?: 'card' | 'list' | 'grid';
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({ 
  isVisible, 
  variant = 'card' 
}) => {
  const renderCardSkeleton = () => (
    <motion.div
      className="card-skeleton"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      style={{
        padding: '1.5rem',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        margin: '1rem 0'
      }}
    >
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <ShimmerEffect width="60px" height="60px" className="avatar-skeleton" />
        <div style={{ flex: 1 }}>
          <ShimmerEffect width="70%" height="1rem" className="name-skeleton" />
          <div style={{ marginTop: '0.5rem' }}>
            <ShimmerEffect width="50%" height="0.8rem" className="meta-skeleton" />
          </div>
        </div>
      </div>
      
      <div>
        <ShimmerEffect width="100%" height="0.8rem" />
        <div style={{ marginTop: '0.5rem' }}>
          <ShimmerEffect width="85%" height="0.8rem" />
        </div>
        <div style={{ marginTop: '0.5rem' }}>
          <ShimmerEffect width="60%" height="0.8rem" />
        </div>
      </div>
    </motion.div>
  );

  const renderListSkeleton = () => (
    <motion.div
      className="list-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{ width: '100%' }}
    >
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: i * 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <ShimmerEffect width="40px" height="40px" />
          <div style={{ flex: 1 }}>
            <ShimmerEffect width={`${60 + Math.random() * 30}%`} height="1rem" />
            <div style={{ marginTop: '0.5rem' }}>
              <ShimmerEffect width="40%" height="0.8rem" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderGridSkeleton = () => (
    <motion.div
      className="grid-skeleton"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1rem',
        width: '100%'
      }}
    >
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.1 }}
          style={{
            padding: '1rem',
            border: '1px solid #e2e8f0',
            borderRadius: '8px'
          }}
        >
          <ShimmerEffect width="100%" height="120px" className="image-skeleton" />
          <div style={{ marginTop: '1rem' }}>
            <ShimmerEffect width="80%" height="1rem" />
            <div style={{ marginTop: '0.5rem' }}>
              <ShimmerEffect width="60%" height="0.8rem" />
            </div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );

  const renderSkeleton = () => {
    switch (variant) {
      case 'card':
        return renderCardSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'grid':
        return renderGridSkeleton();
      default:
        return renderCardSkeleton();
    }
  };

  return (
    <AnimatePresence>
      {isVisible && renderSkeleton()}
    </AnimatePresence>
  );
};

// Error States

type ErrorType = '404' | '500' | 'network' | 'timeout' | 'generic';

interface ErrorStateProps {
  type: ErrorType;
  isVisible: boolean;
  onRetry?: () => void;
  customMessage?: string;
}

const WanderingPoem: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <motion.div
      className="wandering-poem"
      style={{ position: 'relative', width: '200px', height: '150px' }}
    >
      {/* Background path */}
      <svg width="200" height="150" viewBox="0 0 200 150">
        <motion.path
          d="M20 75 Q50 25, 100 75 Q150 125, 180 75"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={isActive ? { pathLength: 1 } : { pathLength: 0 }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      
      {/* Wandering poem icon */}
      <motion.div
        style={{
          position: 'absolute',
          fontSize: '2rem',
          left: '20px',
          top: '65px'
        }}
        animate={isActive ? {
          x: [0, 30, 80, 130, 160],
          y: [0, -25, 0, 25, 0],
          rotate: [0, -10, 0, 10, 0]
        } : {}}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        📜
      </motion.div>
    </motion.div>
  );
};

const BrokenGears: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="broken-gears" style={{ position: 'relative', width: '120px', height: '120px' }}>
      {/* Large gear */}
      <motion.svg
        width="80"
        height="80"
        viewBox="0 0 80 80"
        style={{ position: 'absolute', top: '10px', left: '10px' }}
        animate={isActive ? { rotate: [0, 45, 0] } : {}}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M40,5 L45,15 L55,10 L60,20 L70,15 L75,25 L70,35 L60,30 L55,40 L45,35 L40,45 L35,35 L25,40 L20,30 L10,35 L5,25 L10,15 L20,20 L25,10 L35,15 Z"
          fill="#f56565"
          opacity="0.7"
        />
        <circle cx="40" cy="40" r="8" fill="#fff" />
      </motion.svg>
      
      {/* Small gear */}
      <motion.svg
        width="50"
        height="50"
        viewBox="0 0 50 50"
        style={{ position: 'absolute', top: '40px', left: '60px' }}
        animate={isActive ? { rotate: [0, -60, 0] } : {}}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <path
          d="M25,3 L28,8 L35,6 L38,11 L43,9 L46,14 L43,19 L38,17 L35,22 L28,20 L25,25 L22,20 L15,22 L12,17 L7,19 L4,14 L7,9 L12,11 L15,6 L22,8 Z"
          fill="#667eea"
          opacity="0.7"
        />
        <circle cx="25" cy="25" r="5" fill="#fff" />
      </motion.svg>
      
      {/* Sparks */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            fontSize: '0.8rem',
            left: `${50 + i * 10}px`,
            top: `${30 + i * 15}px`
          }}
          animate={isActive ? {
            opacity: [0, 1, 0],
            scale: [0.5, 1, 0.5],
            y: [0, -10, -20]
          } : {}}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeOut"
          }}
        >
          ✨
        </motion.div>
      ))}
    </div>
  );
};

const DisconnectedWeb: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="disconnected-web" style={{ position: 'relative', width: '150px', height: '100px' }}>
      <svg width="150" height="100" viewBox="0 0 150 100">
        {/* Broken connections */}
        <motion.path
          d="M20 20 L60 20"
          stroke="#f56565"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 1 }}
          animate={isActive ? { 
            pathLength: [1, 0.3, 1],
            opacity: [1, 0.3, 1]
          } : {}}
          transition={{ duration: 2, repeat: Infinity }}
        />
        
        <motion.path
          d="M90 20 L130 20"
          stroke="#667eea"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 1 }}
          animate={isActive ? { 
            pathLength: [1, 0.5, 1],
            opacity: [1, 0.2, 1]
          } : {}}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
        />
        
        <motion.path
          d="M20 50 L130 50"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeDasharray="10,5"
          animate={isActive ? { 
            strokeDashoffset: [0, 20],
            opacity: [0.8, 0.3, 0.8]
          } : {}}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Network nodes */}
        {[20, 60, 90, 130].map((x, i) => (
          <motion.circle
            key={i}
            cx={x}
            cy="20"
            r="6"
            fill={i < 2 ? "#f56565" : "#667eea"}
            animate={isActive ? {
              scale: [1, 1.3, 1],
              opacity: [0.7, 1, 0.7]
            } : {}}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </svg>
      
      {/* WiFi signal lines */}
      <motion.div
        style={{ position: 'absolute', right: '10px', top: '60px', fontSize: '2rem' }}
        animate={isActive ? {
          opacity: [1, 0.3, 1],
          scale: [1, 0.9, 1]
        } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        📶
      </motion.div>
    </div>
  );
};

const SandClock: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div className="sand-clock" style={{ position: 'relative', width: '80px', height: '100px' }}>
      <svg width="80" height="100" viewBox="0 0 80 100">
        {/* Hourglass outline */}
        <path
          d="M15 10 L65 10 L65 20 L40 45 L65 70 L65 90 L15 90 L15 70 L40 45 L15 20 Z"
          stroke="#667eea"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Top sand */}
        <motion.path
          d="M18 13 L62 13 L62 18 L40 40 L18 18 Z"
          fill="#f093fb"
          initial={{ scaleY: 1 }}
          animate={isActive ? { scaleY: [1, 0.3, 1] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Bottom sand */}
        <motion.path
          d="M18 87 L62 87 L62 82 L40 60 L18 82 Z"
          fill="#f093fb"
          initial={{ scaleY: 0 }}
          animate={isActive ? { scaleY: [0, 0.7, 0] } : {}}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* Falling sand particles */}
        {[...Array(5)].map((_, i) => (
          <motion.circle
            key={i}
            cx={40 + (Math.random() - 0.5) * 4}
            cy="45"
            r="1"
            fill="#f093fb"
            animate={isActive ? {
              y: [0, 25],
              opacity: [0, 1, 0]
            } : {}}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "linear"
            }}
          />
        ))}
      </svg>
    </div>
  );
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  isVisible,
  onRetry,
  customMessage
}) => {
  const errorConfig = {
    '404': {
      title: "This poem has wandered off...",
      message: customMessage || "Like verses lost in translation, this page has found its own path to somewhere else.",
      icon: <WanderingPoem isActive={isVisible} />,
      action: "Return to verses"
    },
    '500': {
      title: "Our verses need a moment...",
      message: customMessage || "Even the most seasoned poets pause between stanzas. Our servers are catching their breath.",
      icon: <BrokenGears isActive={isVisible} />,
      action: "Try composing again"
    },
    'network': {
      title: "Reconnecting to the muse...",
      message: customMessage || "The connection between inspiration and creation seems to have wandered. Let's restore the link.",
      icon: <DisconnectedWeb isActive={isVisible} />,
      action: "Restore connection"
    },
    'timeout': {
      title: "Some poems take time...",
      message: customMessage || "The most beautiful verses are worth waiting for, but this one is taking longer than usual.",
      icon: <SandClock isActive={isVisible} />,
      action: "Wait a bit longer"
    },
    'generic': {
      title: "A creative pause...",
      message: customMessage || "Sometimes the muse whispers, sometimes she takes a break. Let's try again.",
      icon: <WanderingPoem isActive={isVisible} />,
      action: "Try again"
    }
  };

  const config = errorConfig[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`error-state error-state--${type}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '3rem 2rem',
            maxWidth: '500px',
            margin: '0 auto'
          }}
        >
          {/* Error Icon Animation */}
          <motion.div
            className="error-icon"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ marginBottom: '2rem' }}
          >
            {config.icon}
          </motion.div>

          {/* Error Title */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            style={{
              fontSize: '1.8rem',
              fontWeight: '600',
              color: '#2d3748',
              margin: '0 0 1rem 0',
              fontFamily: 'serif'
            }}
          >
            {config.title}
          </motion.h2>

          {/* Error Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.6 }}
            style={{
              fontSize: '1.1rem',
              lineHeight: '1.6',
              color: '#4a5568',
              margin: '0 0 2rem 0',
              maxWidth: '400px'
            }}
          >
            {config.message}
          </motion.p>

          {/* Retry Button */}
          {onRetry && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.8 }}
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'
              }}
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              style={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {config.action}
            </motion.button>
          )}

          {/* Decorative Elements */}
          <motion.div
            className="decorative-dots"
            style={{
              position: 'absolute',
              bottom: '1rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: '0.5rem'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ duration: 0.5, delay: 1 }}
          >
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#667eea'
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.8, 0.3]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
