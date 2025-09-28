// Animation Components Export
export { default as TypewriterText } from './TypewriterText';
export { default as FadeInWords } from './FadeInWords';
export { default as StaggeredLines } from './StaggeredLines';
export { default as GlowingText } from './GlowingText';
export { default as MorphingText } from './MorphingText';

// Examples and Demo Components
export { default as TextAnimationExamples } from './TextAnimationExamples';
export {
  TypewriterTextExamples,
  FadeInWordsExamples,
  StaggeredLinesExamples,
  GlowingTextExamples,
  MorphingTextExamples,
  CombinedAnimationExample
} from './TextAnimationExamples';

// Type exports for animation props
export interface AnimationControlProps {
  isPaused?: boolean;
  onComplete?: () => void;
  className?: string;
}

export interface ThemeAwareAnimationProps extends AnimationControlProps {
  // These props are automatically derived from theme context
  // but can be overridden
  duration?: number;
  staggerDelay?: number;
  easing?: string;
}

// Animation presets for different moods and styles
export const AnimationPresets = {
  CALM: {
    duration: 3,
    staggerDelay: 250,
    easing: "easeInOut"
  },
  ENERGETIC: {
    duration: 1.2,
    staggerDelay: 80,
    easing: "easeOut"
  },
  DRAMATIC: {
    duration: 2.5,
    staggerDelay: 120,
    easing: "easeInOut"
  },
  MYSTICAL: {
    duration: 2.2,
    staggerDelay: 180,
    easing: "easeInOut"
  },
  ROMANTIC: {
    duration: 2.8,
    staggerDelay: 200,
    easing: "easeInOut"
  },
  PLAYFUL: {
    duration: 1.5,
    staggerDelay: 100,
    easing: "easeOut"
  }
};

// GPU-accelerated properties for performance
export const GPU_ACCELERATED_PROPS = [
  'transform',
  'opacity',
  'filter',
  'will-change'
] as const;

// Animation utility functions
export const AnimationUtils = {
  // Calculate optimal animation timing based on text length
  getOptimalTiming: (textLength: string, baseSpeed: number = 2) => {
    const wordCount = textLength.split(' ').length;
    return {
      typewriterSpeed: Math.max(1, baseSpeed + (wordCount / 50)),
      staggerDelay: Math.max(0.05, 0.15 - (wordCount / 500)),
      morphDuration: Math.min(3, Math.max(0.8, wordCount / 20))
    };
  },

  // Get animation preset based on emotion analysis
  getPresetForEmotion: (emotion?: string, intensity: number = 0.5) => {
    if (!emotion) return AnimationPresets.CALM;
    
    const emotionMap: Record<string, keyof typeof AnimationPresets> = {
      'joy': intensity > 0.7 ? 'ENERGETIC' : 'PLAYFUL',
      'love': 'ROMANTIC',
      'sadness': 'DRAMATIC',
      'anger': 'ENERGETIC',
      'fear': 'MYSTICAL',
      'surprise': 'PLAYFUL',
      'calm': 'CALM'
    };
    
    return AnimationPresets[emotionMap[emotion.toLowerCase()] || 'CALM'];
  },

  // Create staggered delay for child elements
  createStaggerConfig: (childCount: number, totalDuration: number = 2) => {
    const delay = totalDuration / Math.max(childCount, 1);
    return Array.from({ length: childCount }, (_, i) => ({
      delay: i * delay,
      duration: Math.min(delay * 2, 0.8)
    }));
  }
};

// Performance monitoring for animations
export const AnimationPerformance = {
  // Monitor frame rate during animations
  monitorFPS: (callback: (fps: number) => void) => {
    let fps = 0;
    let lastTime = performance.now();
    let frameCount = 0;

    const tick = () => {
      const now = performance.now();
      frameCount++;
      
      if (now - lastTime >= 1000) {
        fps = Math.round((frameCount * 1000) / (now - lastTime));
        callback(fps);
        frameCount = 0;
        lastTime = now;
      }
      
      requestAnimationFrame(tick);
    };
    
    requestAnimationFrame(tick);
  },

  // Check if reduced motion is preferred
  shouldReduceMotion: () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Get optimal animation settings for device
  getOptimalSettings: () => {
    const isLowEnd = navigator.hardwareConcurrency <= 2;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const shouldReduce = AnimationPerformance.shouldReduceMotion();
    
    return {
      enableParticles: !isLowEnd && !isMobile && !shouldReduce,
      reduceComplexity: isLowEnd || shouldReduce,
      preferSimpleTransitions: isMobile || shouldReduce,
      maxConcurrentAnimations: isLowEnd ? 2 : isMobile ? 3 : 5
    };
  }
};

