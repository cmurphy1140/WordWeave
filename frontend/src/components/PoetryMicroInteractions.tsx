import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Poetry-themed micro-interaction presets
export const poetryMicroPresets = {
  // Button interactions
  generateButton: {
    initial: { scale: 1, boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)' },
    hover: { 
      scale: 1.02, 
      boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.98,
      transition: { duration: 0.1 }
    },
    ripple: {
      initial: { scale: 0, opacity: 0.6 },
      animate: { 
        scale: 4, 
        opacity: 0,
        transition: { duration: 0.6, ease: "easeOut" }
      }
    }
  },

  shareButton: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.05,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.95,
      transition: { duration: 0.1 }
    },
    particles: {
      initial: { scale: 0, opacity: 1 },
      animate: { 
        scale: 1.5, 
        opacity: 0,
        transition: { duration: 0.8, ease: "easeOut" }
      }
    }
  },

  saveButton: {
    initial: { scale: 1 },
    hover: { 
      scale: 1.03,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.97,
      transition: { duration: 0.1 }
    },
    heartFill: {
      initial: { scale: 0, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
        transition: { duration: 0.4, ease: "easeOut" }
      }
    }
  },

  remixButton: {
    initial: { scale: 1, rotate: 0 },
    hover: { 
      scale: 1.04,
      rotate: 5,
      transition: { duration: 0.2 }
    },
    tap: { 
      scale: 0.96,
      rotate: -5,
      transition: { duration: 0.1 }
    },
    swirl: {
      initial: { scale: 0, rotate: 0 },
      animate: { 
        scale: 1.2, 
        rotate: 360,
        transition: { duration: 0.6, ease: "easeInOut" }
      }
    }
  },

  // Feedback animations
  success: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      scale: 0, 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    sparkles: {
      initial: { scale: 0, opacity: 0 },
      animate: { 
        scale: 1, 
        opacity: 1,
        transition: { duration: 0.5, ease: "easeOut" }
      }
    }
  },

  error: {
    initial: { x: 0 },
    animate: { 
      x: [-10, 10, -10, 10, 0],
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  },

  loading: {
    initial: { opacity: 0 },
    animate: { 
      opacity: 1,
      transition: { duration: 0.3 }
    },
    cursor: {
      animate: { 
        opacity: [1, 0, 1],
        transition: { duration: 1, repeat: Infinity, ease: "easeInOut" }
      }
    }
  },

  processing: {
    initial: { scale: 0, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    inkblot: {
      animate: { 
        scale: [1, 1.2, 1],
        opacity: [0.8, 1, 0.8],
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
      }
    }
  },

  // Hover effects
  wordHover: {
    initial: { y: 0, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' },
    hover: { 
      y: -2, 
      boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      transition: { duration: 0.2 }
    }
  },

  cardHover: {
    initial: { rotateX: 0, rotateY: 0 },
    hover: { 
      rotateX: 5, 
      rotateY: 5,
      transition: { duration: 0.3 }
    }
  },

  linkHover: {
    initial: { scaleX: 0 },
    hover: { 
      scaleX: 1,
      transition: { duration: 0.3, ease: "easeOut" }
    }
  },

  imageHover: {
    initial: { scale: 1, filter: 'blur(0px)' },
    hover: { 
      scale: 1.05, 
      filter: 'blur(1px)',
      transition: { duration: 0.3 }
    }
  },

  // Transition choreography
  waterfall: {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      y: -20,
      transition: { duration: 0.3 }
    }
  },

  pageCurl: {
    initial: { rotateY: 0, scale: 1 },
    animate: { 
      rotateY: 90, 
      scale: 0.8,
      transition: { duration: 0.5, ease: "easeInOut" }
    }
  }
};

// Button Components
interface PoetryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'generate' | 'share' | 'save' | 'remix';
  className?: string;
  disabled?: boolean;
}

export const PoetryButton: React.FC<PoetryButtonProps> = ({
  children,
  onClick,
  type = 'generate',
  className = '',
  disabled = false
}) => {
  const [ripple, setRipple] = React.useState(false);
  const [particles, setParticles] = React.useState(false);

  const handleClick = () => {
    if (disabled) return;
    
    // Trigger appropriate animation based on type
    if (type === 'generate') {
      setRipple(true);
      setTimeout(() => setRipple(false), 600);
    } else if (type === 'share') {
      setParticles(true);
      setTimeout(() => setParticles(false), 800);
    }
    
    onClick?.();
  };

  const getPreset = () => {
    switch (type) {
      case 'generate': return poetryMicroPresets.generateButton;
      case 'share': return poetryMicroPresets.shareButton;
      case 'save': return poetryMicroPresets.saveButton;
      case 'remix': return poetryMicroPresets.remixButton;
      default: return poetryMicroPresets.generateButton;
    }
  };

  const preset = getPreset();

  return (
    <motion.button
      className={`poetry-button poetry-button--${type} ${className}`}
      variants={preset}
      initial="initial"
      whileHover="hover"
      whileTap="tap"
      onClick={handleClick}
      disabled={disabled}
      style={{
        position: 'relative',
        overflow: 'hidden',
        border: 'none',
        borderRadius: '8px',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1
      }}
    >
      {children}
      
      {/* Ripple effect for generate button */}
      <AnimatePresence>
        {ripple && 'ripple' in preset && (
          <motion.div
            className="ripple-effect"
            variants={preset.ripple}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              background: 'rgba(102, 126, 234, 0.3)',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        )}
      </AnimatePresence>

      {/* Particles effect for share button */}
      <AnimatePresence>
        {particles && 'particles' in preset && (
          <div style={{ position: 'absolute', top: '50%', left: '50%', pointerEvents: 'none' }}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="particle"
                variants={preset.particles}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: '#667eea',
                  transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-20px)`
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </motion.button>
  );
};

// Feedback Components
interface FeedbackProps {
  type: 'success' | 'error' | 'loading' | 'processing';
  message?: string;
  isVisible: boolean;
}

export const PoetryFeedback: React.FC<FeedbackProps> = ({
  type,
  message,
  isVisible
}) => {
  const getPreset = () => {
    switch (type) {
      case 'success': return poetryMicroPresets.success;
      case 'error': return poetryMicroPresets.error;
      case 'loading': return poetryMicroPresets.loading;
      case 'processing': return poetryMicroPresets.processing;
      default: return poetryMicroPresets.success;
    }
  };

  const preset = getPreset();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={`poetry-feedback poetry-feedback--${type}`}
          variants={preset}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{
            padding: '12px 20px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            margin: '8px 0'
          }}
        >
          {type === 'success' && (
            <>
              <motion.div
                className="sparkle"
                variants={'sparkles' in preset ? preset.sparkles : {}}
                initial="initial"
                animate="animate"
                style={{
                  width: '16px',
                  height: '16px',
                  background: 'radial-gradient(circle, #4ade80, #22c55e)',
                  borderRadius: '50%'
                }}
              />
              ✨ {message || 'Success!'}
            </>
          )}
          
          {type === 'error' && (
            <>
              ❌ {message || 'Error occurred'}
            </>
          )}
          
          {type === 'loading' && (
            <>
              <motion.div
                className="cursor"
                variants={'cursor' in preset ? preset.cursor : {}}
                animate="cursor"
                style={{
                  width: '2px',
                  height: '16px',
                  background: '#667eea',
                  marginRight: '4px'
                }}
              />
              {message || 'Loading...'}
            </>
          )}
          
          {type === 'processing' && (
            <>
              <motion.div
                className="inkblot"
                variants={'inkblot' in preset ? preset.inkblot : {}}
                animate="inkblot"
                style={{
                  width: '16px',
                  height: '16px',
                  background: 'radial-gradient(circle, #667eea, #764ba2)',
                  borderRadius: '50%'
                }}
              />
              {message || 'Processing...'}
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Hover Components
interface WordHoverProps {
  children: React.ReactNode;
  className?: string;
}

export const WordHover: React.FC<WordHoverProps> = ({ children, className = '' }) => (
  <motion.div
    className={`word-hover ${className}`}
    variants={poetryMicroPresets.wordHover}
    initial="initial"
    whileHover="hover"
    style={{
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: '4px',
      cursor: 'pointer'
    }}
  >
    {children}
  </motion.div>
);

interface CardHoverProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHover: React.FC<CardHoverProps> = ({ children, className = '' }) => (
  <motion.div
    className={`card-hover ${className}`}
    variants={poetryMicroPresets.cardHover}
    initial="initial"
    whileHover="hover"
    style={{
      perspective: '1000px',
      cursor: 'pointer'
    }}
  >
    {children}
  </motion.div>
);

interface LinkHoverProps {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export const LinkHover: React.FC<LinkHoverProps> = ({ 
  children, 
  href, 
  onClick, 
  className = '' 
}) => (
  <motion.div
    className={`link-hover ${className}`}
    variants={poetryMicroPresets.linkHover}
    initial="initial"
    whileHover="hover"
    style={{
      position: 'relative',
      cursor: 'pointer'
    }}
    onClick={onClick}
  >
    {href ? (
      <a href={href} style={{ textDecoration: 'none', color: 'inherit' }}>
        {children}
      </a>
    ) : (
      children
    )}
    <motion.div
      className="underline"
      style={{
        position: 'absolute',
        bottom: '-2px',
        left: 0,
        right: 0,
        height: '2px',
        background: '#667eea',
        transformOrigin: 'left'
      }}
    />
  </motion.div>
);

// Transition Components
interface WaterfallProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export const WaterfallTransition: React.FC<WaterfallProps> = ({ 
  children, 
  delay = 0, 
  className = '' 
}) => (
  <motion.div
    className={`waterfall-transition ${className}`}
    variants={poetryMicroPresets.waterfall}
    initial="initial"
    animate="animate"
    exit="exit"
    transition={{ delay }}
  >
    {children}
  </motion.div>
);

interface PageCurlProps {
  children: React.ReactNode;
  isVisible: boolean;
  className?: string;
}

export const PageCurlTransition: React.FC<PageCurlProps> = ({ 
  children, 
  isVisible, 
  className = '' 
}) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        className={`page-curl-transition ${className}`}
        variants={poetryMicroPresets.pageCurl}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

// poetryMicroPresets is already exported at the top of the file
