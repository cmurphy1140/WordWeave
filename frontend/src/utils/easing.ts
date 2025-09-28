/**
 * Advanced easing functions for smooth animations
 * Based on Robert Penner's easing equations and modern web standards
 */

// Cubic Bezier curves for smooth transitions
export const easingCurves = {
  // Material Design easing curves
  material: {
    standard: [0.4, 0.0, 0.2, 1],
    decelerate: [0.0, 0.0, 0.2, 1],
    accelerate: [0.4, 0.0, 1, 1],
    sharp: [0.4, 0.0, 0.6, 1],
  },
  
  // Custom smooth curves
  smooth: {
    gentle: [0.25, 0.46, 0.45, 0.94],
    soft: [0.25, 0.1, 0.25, 1],
    fluid: [0.23, 1, 0.32, 1],
    bouncy: [0.68, -0.55, 0.265, 1.55],
    elastic: [0.175, 0.885, 0.32, 1.275],
  },
  
  // Natural motion curves
  natural: {
    easeOutQuart: [0.25, 1, 0.5, 1],
    easeOutCubic: [0.33, 1, 0.68, 1],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeOutCirc: [0.08, 0.82, 0.17, 1],
  },
  
  // Poetic motion curves (for WordWeave)
  poetic: {
    whisper: [0.25, 0.46, 0.45, 0.94],
    flow: [0.23, 1, 0.32, 1],
    shimmer: [0.25, 0.46, 0.45, 0.94],
    dance: [0.68, -0.55, 0.265, 1.55],
    breathe: [0.25, 0.1, 0.25, 1],
  },
};

// Spring configurations for natural motion
export const springConfigs = {
  gentle: {
    type: "spring",
    stiffness: 120,
    damping: 20,
    mass: 1,
  },
  
  smooth: {
    type: "spring",
    stiffness: 100,
    damping: 25,
    mass: 1,
  },
  
  fluid: {
    type: "spring",
    stiffness: 80,
    damping: 30,
    mass: 1,
  },
  
  bouncy: {
    type: "spring",
    stiffness: 150,
    damping: 15,
    mass: 1,
  },
  
  poetic: {
    type: "spring",
    stiffness: 90,
    damping: 22,
    mass: 1.1,
  },
};

// Duration presets for consistent timing
export const durations = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.5,
  leisurely: 0.8,
  poetic: 1.2,
};

// Animation presets for common use cases
export const animationPresets = {
  // Fade animations
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  fadeInUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  fadeInDown: {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  // Scale animations
  scaleIn: {
    initial: { scale: 0.95, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.95, opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  scaleInBounce: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20,
    },
  },
  
  // Slide animations
  slideInLeft: {
    initial: { x: -50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  slideInRight: {
    initial: { x: 50, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 50, opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  // Poetic animations (WordWeave specific)
  poeticFade: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: {
      duration: durations.poetic,
      ease: easingCurves.poetic.whisper,
    },
  },
  
  wordAppear: {
    initial: { opacity: 0, scale: 0.9, y: 5 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.9, y: -5 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.poetic.flow,
    },
  },
  
  shimmer: {
    initial: { opacity: 0, scale: 0.95, rotateX: -10 },
    animate: { opacity: 1, scale: 1, rotateX: 0 },
    exit: { opacity: 0, scale: 0.95, rotateX: 10 },
    transition: {
      duration: durations.slow,
      ease: easingCurves.poetic.shimmer,
    },
  },
  
  // Layout animations
  layoutShift: {
    layoutId: true,
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.fluid,
    },
  },
  
  // Stagger animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1,
      },
    },
  },
  
  staggerItem: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
};

// Hover animations
export const hoverAnimations = {
  gentle: {
    whileHover: { scale: 1.02 },
    whileTap: { scale: 0.98 },
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
  
  smooth: {
    whileHover: { scale: 1.05, y: -2 },
    whileTap: { scale: 0.95 },
    transition: {
      duration: durations.fast,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  poetic: {
    whileHover: { 
      scale: 1.03, 
      y: -1,
      boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
    },
    whileTap: { scale: 0.97 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.poetic.flow,
    },
  },
};

// Page transition animations
export const pageTransitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  slide: {
    initial: { x: 100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 },
    transition: {
      duration: durations.normal,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  poetic: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
    transition: {
      duration: durations.poetic,
      ease: easingCurves.poetic.whisper,
    },
  },
};

// Utility functions for creating custom animations
export const createCustomAnimation = (
  initial: any,
  animate: any,
  exit: any = {},
  transition: any = {}
) => ({
  initial,
  animate,
  exit,
  transition: {
    duration: durations.normal,
    ease: easingCurves.smooth.gentle,
    ...transition,
  },
});

export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  itemAnimation: any = animationPresets.staggerItem
) => ({
  animate: {
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: 0.1,
    },
  },
  ...itemAnimation,
});

// Performance-optimized animations for mobile
export const mobileOptimized = {
  fadeIn: {
    ...animationPresets.fadeIn,
    transition: {
      duration: durations.fast,
      ease: easingCurves.material.standard,
    },
  },
  
  scaleIn: {
    ...animationPresets.scaleIn,
    transition: {
      duration: durations.fast,
      ease: easingCurves.material.standard,
    },
  },
  
  slideIn: {
    initial: { x: 20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: -20, opacity: 0 },
    transition: {
      duration: durations.fast,
      ease: easingCurves.material.standard,
    },
  },
};

// Accessibility-friendly animations
export const accessibleAnimations = {
  // Respects prefers-reduced-motion
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: durations.fast,
      ease: easingCurves.smooth.gentle,
    },
  },
  
  // Minimal motion for sensitive users
  subtle: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: durations.instant,
    },
  },
};

// Export default easing configuration
export const defaultEasing = {
  curves: easingCurves.smooth.gentle,
  spring: springConfigs.gentle,
  duration: durations.normal,
  preset: animationPresets.fadeIn,
};

// Helper to get animation based on user preferences
export const getAccessibleAnimation = (animation: any, prefersReducedMotion: boolean = false) => {
  if (prefersReducedMotion) {
    return accessibleAnimations.subtle;
  }
  return animation;
};

// Helper to create responsive animations
export const getResponsiveAnimation = (animation: any, isMobile: boolean = false) => {
  if (isMobile) {
    return {
      ...animation,
      transition: {
        ...animation.transition,
        duration: durations.fast,
        ease: easingCurves.material.standard,
      },
    };
  }
  return animation;
};
