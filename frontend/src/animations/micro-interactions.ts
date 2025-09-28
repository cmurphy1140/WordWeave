/**
 * WordWeave Micro-Interactions Library
 * 
 * A cohesive collection of poetry-themed micro-interactions that enhance
 * user experience through meaningful, delightful animations.
 */

import { motion, Variants } from 'framer-motion';

// ============================================================================
// BUTTON INTERACTIONS
// ============================================================================

/**
 * Generate Button: Ripple that forms words
 * Creates expanding ripple effect with floating words that emerge from center
 */
export const generateButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

export const rippleVariants: Variants = {
  initial: { 
    scale: 0, 
    opacity: 0.8,
    x: 0,
    y: 0
  },
  animate: { 
    scale: [0, 1.5, 2],
    opacity: [0.8, 0.4, 0],
    transition: { 
      duration: 0.8,
      ease: "easeOut",
      times: [0, 0.5, 1]
    }
  }
};

export const floatingWordVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 0,
    scale: 0.8
  },
  animate: (delay: number) => ({
    opacity: [0, 1, 0],
    y: [-20, -40, -60],
    scale: [0.8, 1, 0.8],
    transition: {
      duration: 1.2,
      delay: delay,
      ease: "easeOut"
    }
  })
};

/**
 * Share Button: Exploding particles that reform as link
 * Particles burst outward then coalesce into a link icon
 */
export const shareButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.08,
    transition: { duration: 0.3, ease: "easeOut" }
  },
  tap: { 
    scale: 0.92,
    transition: { duration: 0.15 }
  }
};

export const particleVariants: Variants = {
  initial: { 
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0
  },
  explode: (index: number) => ({
    scale: [0, 1, 0.5],
    opacity: [0, 1, 0],
    x: Math.cos(index * 0.5) * 60,
    y: Math.sin(index * 0.5) * 60,
    transition: {
      duration: 0.6,
      delay: index * 0.05,
      ease: "easeOut"
    }
  }),
  reform: {
    scale: 1,
    opacity: 1,
    x: 0,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

/**
 * Save Button: Heart that fills with poem's colors
 * Heart outline fills with gradient colors from the current theme
 */
export const saveButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.1,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.9,
    transition: { duration: 0.1 }
  }
};

export const heartFillVariants: Variants = {
  initial: { 
    scale: 0,
    opacity: 0
  },
  fill: {
    scale: [0, 1.2, 1],
    opacity: [0, 0.8, 1],
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

/**
 * Remix Button: Swirl that shuffles elements
 * Creates a swirling motion that rearranges visual elements
 */
export const remixButtonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.06,
    rotate: 5,
    transition: { duration: 0.3 }
  },
  tap: { 
    scale: 0.94,
    rotate: -5,
    transition: { duration: 0.2 }
  }
};

export const swirlVariants: Variants = {
  initial: { 
    rotate: 0,
    scale: 1
  },
  animate: {
    rotate: [0, 180, 360],
    scale: [1, 1.1, 1],
    transition: {
      duration: 1.5,
      ease: "easeInOut"
    }
  }
};

// ============================================================================
// FEEDBACK ANIMATIONS
// ============================================================================

/**
 * Success: Sparkles cascading like stardust
 * Gentle sparkles that cascade down from top
 */
export const successVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0
  },
  animate: {
    opacity: [0, 1, 0],
    scale: [0, 1, 0.8],
    y: [0, 20, 40],
    transition: {
      duration: 2,
      ease: "easeOut"
    }
  }
};

export const sparkleVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0,
    rotate: 0
  },
  animate: (delay: number) => ({
    opacity: [0, 1, 0],
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: {
      duration: 1.5,
      delay: delay,
      ease: "easeOut"
    }
  })
};

/**
 * Error: Gentle shake with red poetry line
 * Subtle shake animation with a red underline that draws itself
 */
export const errorVariants: Variants = {
  initial: { 
    x: 0,
    opacity: 0
  },
  shake: {
    x: [-2, 2, -2, 2, 0],
    transition: {
      duration: 0.4,
      ease: "easeInOut"
    }
  }
};

export const poetryLineVariants: Variants = {
  initial: { 
    scaleX: 0,
    opacity: 0
  },
  draw: {
    scaleX: 1,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

/**
 * Loading: Typing cursor writing invisible words
 * Blinking cursor that moves as if typing
 */
export const loadingCursorVariants: Variants = {
  initial: { 
    opacity: 1
  },
  blink: {
    opacity: [1, 0, 1],
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

export const typingVariants: Variants = {
  initial: { 
    x: 0
  },
  type: {
    x: [0, 10, 20, 30, 40],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

/**
 * Processing: Morphing inkblot patterns
 * Abstract inkblot shapes that morph and flow
 */
export const inkblotVariants: Variants = {
  initial: { 
    scale: 0,
    opacity: 0,
    borderRadius: "50%"
  },
  morph: {
    scale: [0, 1, 0.8, 1.2, 1],
    opacity: [0, 0.6, 0.8, 0.6, 0],
    borderRadius: ["50%", "30%", "70%", "40%", "50%"],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity
    }
  }
};

// ============================================================================
// HOVER EFFECTS
// ============================================================================

/**
 * Words: Subtle float with shadow lift
 * Gentle upward movement with enhanced shadow
 */
export const wordHoverVariants: Variants = {
  initial: { 
    y: 0,
    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
  },
  hover: { 
    y: -4,
    filter: "drop-shadow(0 8px 16px rgba(0,0,0,0.2))",
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Cards: Tilt with gradient shift
 * 3D tilt effect with color gradient animation
 */
export const cardHoverVariants: Variants = {
  initial: { 
    rotateX: 0,
    rotateY: 0,
    scale: 1
  },
  hover: { 
    rotateX: 5,
    rotateY: 5,
    scale: 1.02,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Links: Underline drawn like pen stroke
 * Animated underline that draws from left to right
 */
export const linkHoverVariants: Variants = {
  initial: { 
    scaleX: 0,
    originX: 0
  },
  hover: { 
    scaleX: 1,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  }
};

/**
 * Images: Ken Burns with blur focus
 * Subtle zoom and pan with focus blur effect
 */
export const imageHoverVariants: Variants = {
  initial: { 
    scale: 1,
    filter: "blur(0px)"
  },
  hover: { 
    scale: 1.05,
    filter: "blur(1px)",
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

// ============================================================================
// TRANSITION CHOREOGRAPHY
// ============================================================================

/**
 * Element entrance timing (waterfall, 50ms stagger)
 * Staggered entrance animations for lists and grids
 */
export const waterfallVariants: Variants = {
  initial: { 
    opacity: 0,
    y: 20
  },
  animate: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: index * 0.05,
      ease: "easeOut"
    }
  })
};

/**
 * Exit patterns (fade and scale down)
 * Smooth exit animations
 */
export const exitVariants: Variants = {
  exit: { 
    opacity: 0,
    scale: 0.8,
    transition: { 
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

/**
 * State changes (morph with conservation)
 * Smooth transitions between different states
 */
export const stateChangeVariants: Variants = {
  initial: { 
    opacity: 0,
    scale: 0.9
  },
  animate: { 
    opacity: 1,
    scale: 1,
    transition: { 
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0,
    scale: 1.1,
    transition: { 
      duration: 0.3,
      ease: "easeIn"
    }
  }
};

/**
 * Route transitions (page curl effect)
 * Page turning animation for route changes
 */
export const pageCurlVariants: Variants = {
  initial: { 
    rotateY: 0,
    opacity: 1
  },
  exit: { 
    rotateY: -90,
    opacity: 0,
    transition: { 
      duration: 0.6,
      ease: "easeIn"
    }
  },
  enter: { 
    rotateY: 90,
    opacity: 0
  },
  animate: { 
    rotateY: 0,
    opacity: 1,
    transition: { 
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random delay for staggered animations
 */
export const getRandomDelay = (baseDelay: number = 0.1): number => {
  return baseDelay + Math.random() * 0.2;
};

/**
 * Create spring animation configuration
 */
export const createSpringConfig = (stiffness: number = 300, damping: number = 30) => ({
  type: "spring" as const,
  stiffness,
  damping
});

/**
 * Generate color-aware animation variants
 */
export const createColorAwareVariants = (colors: string[]) => ({
  initial: { backgroundColor: colors[0] },
  animate: { 
    backgroundColor: colors,
    transition: { 
      duration: 2,
      repeat: Infinity,
      repeatType: "reverse" as const
    }
  }
});

// ============================================================================
// PRESET CONFIGURATIONS
// ============================================================================

export const microInteractionPresets = {
  // Button presets
  generateButton: {
    variants: generateButtonVariants,
    ripple: rippleVariants,
    floatingWords: floatingWordVariants
  },
  shareButton: {
    variants: shareButtonVariants,
    particles: particleVariants
  },
  saveButton: {
    variants: saveButtonVariants,
    heartFill: heartFillVariants
  },
  remixButton: {
    variants: remixButtonVariants,
    swirl: swirlVariants
  },
  
  // Feedback presets
  success: {
    variants: successVariants,
    sparkles: sparkleVariants
  },
  error: {
    variants: errorVariants,
    poetryLine: poetryLineVariants
  },
  loading: {
    cursor: loadingCursorVariants,
    typing: typingVariants
  },
  processing: {
    inkblot: inkblotVariants
  },
  
  // Hover presets
  wordHover: wordHoverVariants,
  cardHover: cardHoverVariants,
  linkHover: linkHoverVariants,
  imageHover: imageHoverVariants,
  
  // Transition presets
  waterfall: waterfallVariants,
  exit: exitVariants,
  stateChange: stateChangeVariants,
  pageCurl: pageCurlVariants
};

export default microInteractionPresets;
