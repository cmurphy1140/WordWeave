// Loading States Component Library for WordWeave
// A comprehensive collection of delightful loading animations and states

// Main Components
export {
  InitialLoadingSequence,
  GenerationLoading,
  PoemSkeleton,
  ContentSkeleton,
  ErrorState
} from './LoadingStates';

// Demo Component
export { LoadingStatesDemo } from './LoadingStatesDemo';

// Types
export type GenerationPhase = 'gathering' | 'weaving' | 'painting' | 'revealing';
export type ErrorType = '404' | '500' | 'network' | 'timeout' | 'generic';
export type SkeletonVariant = 'card' | 'list' | 'grid';

// Utility Components and Hooks
import React, { useState, useEffect, useCallback } from 'react';

// Loading State Management Hook
export const useLoadingSequence = (phases: string[], phaseDuration: number = 2000) => {
  const [currentPhase, setCurrentPhase] = useState<string | null>(phases[0] || null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const startSequence = useCallback(() => {
    setCurrentPhase(phases[0] || null);
    setProgress(0);
    setIsComplete(false);

    let phaseIndex = 0;
    let progressValue = 0;
    
    const interval = setInterval(() => {
      progressValue += (100 / (phaseDuration / 50));
      setProgress(Math.min(progressValue, 100));

      if (progressValue >= 100) {
        phaseIndex++;
        if (phaseIndex >= phases.length) {
          setIsComplete(true);
          setCurrentPhase(null);
          clearInterval(interval);
        } else {
          setCurrentPhase(phases[phaseIndex]);
          progressValue = 0;
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [phases, phaseDuration]);

  const resetSequence = useCallback(() => {
    setCurrentPhase(phases[0] || null);
    setProgress(0);
    setIsComplete(false);
  }, [phases]);

  return {
    currentPhase,
    progress,
    isComplete,
    startSequence,
    resetSequence
  };
};

// Generation Loading Hook
export const useGenerationLoading = () => {
  const phases = ['gathering', 'weaving', 'painting', 'revealing'];
  return useLoadingSequence(phases, 3000);
};

// Error State Management Hook
export const useErrorState = () => {
  const [error, setError] = useState<{
    type: ErrorType;
    message?: string;
    isVisible: boolean;
  } | null>(null);

  const showError = useCallback((type: ErrorType, message?: string) => {
    setError({ type, message, isVisible: true });
  }, []);

  const hideError = useCallback(() => {
    setError(prev => prev ? { ...prev, isVisible: false } : null);
    setTimeout(() => setError(null), 300); // Allow exit animation
  }, []);

  const retryAction = useCallback(() => {
    hideError();
    // Return a promise that can be used for retry logic
    return new Promise<void>((resolve) => {
      setTimeout(resolve, 300);
    });
  }, [hideError]);

  return {
    error,
    showError,
    hideError,
    retryAction
  };
};

// Loading State Provider Context
interface LoadingContextType {
  isInitialLoading: boolean;
  generationPhase: string | null;
  generationProgress: number;
  error: { type: ErrorType; message?: string } | null;
  showInitialLoading: () => void;
  hideInitialLoading: () => void;
  startGeneration: () => void;
  stopGeneration: () => void;
  showError: (type: ErrorType, message?: string) => void;
  hideError: () => void;
}

const LoadingContext = React.createContext<LoadingContextType | undefined>(undefined);

// Loading State Provider
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const generationLoading = useGenerationLoading();
  const errorState = useErrorState();

  const showInitialLoading = useCallback(() => {
    setIsInitialLoading(true);
  }, []);

  const hideInitialLoading = useCallback(() => {
    setIsInitialLoading(false);
  }, []);

  const startGeneration = useCallback(() => {
    generationLoading.startSequence();
  }, [generationLoading]);

  const stopGeneration = useCallback(() => {
    generationLoading.resetSequence();
  }, [generationLoading]);

  const contextValue: LoadingContextType = {
    isInitialLoading,
    generationPhase: generationLoading.currentPhase,
    generationProgress: generationLoading.progress,
    error: errorState.error,
    showInitialLoading,
    hideInitialLoading,
    startGeneration,
    stopGeneration,
    showError: errorState.showError,
    hideError: errorState.hideError
  };

  return (
    <LoadingContext.Provider value={contextValue}>
      {children}
    </LoadingContext.Provider>
  );
};

// Hook to use Loading Context
export const useLoading = (): LoadingContextType => {
  const context = React.useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};

// Presets for common loading scenarios
export const LoadingPresets = {
  // Quick initial load for SPA
  quickStart: {
    duration: 2000,
    phases: ['initializing', 'ready']
  },
  
  // Full poetry generation flow
  poemGeneration: {
    duration: 8000,
    phases: ['gathering', 'weaving', 'painting', 'revealing']
  },
  
  // Content loading
  contentLoad: {
    duration: 1500,
    phases: ['loading']
  },
  
  // Heavy computation
  processing: {
    duration: 5000,
    phases: ['analyzing', 'processing', 'finalizing']
  }
};

// Animation easing presets
export const EasingPresets = {
  gentle: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  bouncy: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
  swift: "cubic-bezier(0.4, 0, 0.2, 1)",
  dramatic: "cubic-bezier(0.7, 0, 0.3, 1)",
  poetic: "cubic-bezier(0.45, 0, 0.55, 1)" // Custom easing for WordWeave
};

// Utility function to create custom loading messages
export const createPoeticMessages = (theme: string): string[] => {
  const themes = {
    nature: [
      "Seeds of inspiration are sprouting...",
      "Petals of thought unfurling...",
      "Rivers of words flowing..."
    ],
    cosmic: [
      "Stars aligning with your thoughts...",
      "Cosmic dust settling into verses...",
      "Galaxies of words converging..."
    ],
    oceanic: [
      "Waves of creativity gathering...",
      "Tides of inspiration rising...",
      "Pearls of wisdom surfacing..."
    ],
    default: [
      "Words are taking shape...",
      "Verses finding their rhythm...",
      "Poetry coming to life..."
    ]
  };

  return themes[theme as keyof typeof themes] || themes.default;
};

// Performance monitoring utilities
export const LoadingMetrics = {
  startTiming: (label: string): (() => number) => {
    const start = performance.now();
    return () => {
      const end = performance.now();
      const duration = end - start;
      console.log(`Loading "${label}" took ${duration.toFixed(2)}ms`);
      return duration;
    };
  },

  measureLoadingSequence: async (
    sequence: () => Promise<void>,
    label: string = 'Loading Sequence'
  ): Promise<number> => {
    const endTiming = LoadingMetrics.startTiming(label);
    try {
      await sequence();
      return endTiming();
    } catch (error) {
      endTiming();
      throw error;
    }
  }
};

// Constants
export const LOADING_CONSTANTS = {
  DEFAULT_PHASE_DURATION: 2000,
  SHIMMER_DURATION: 1500,
  ERROR_DISPLAY_DURATION: 5000,
  SKELETON_LINE_HEIGHTS: {
    small: '0.8rem',
    medium: '1rem',
    large: '1.2rem'
  },
  ANIMATION_DELAYS: {
    cascade: 100,
    stagger: 150,
    sequence: 200
  }
} as const;
