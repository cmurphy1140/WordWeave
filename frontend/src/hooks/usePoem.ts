import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { WordInputs, PoemData, LoadingState } from '../types';
import { generatePoemCached, withRetry, ApiError } from '../utils/api';
import { useTheme } from '../contexts/ThemeContext';

interface UsePoemResult {
  poemData: PoemData | null;
  loading: LoadingState;
  error: string | null;
  generatePoem: (inputs: WordInputs) => Promise<void>;
  clearPoem: () => void;
  retryGeneration: () => Promise<void>;
  cancelGeneration: () => void;
}

export const usePoem = (): UsePoemResult => {
  const [poemData, setPoemData] = useState<PoemData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ isLoading: false });
  const [error, setError] = useState<string | null>(null);
  const [lastInputs, setLastInputs] = useState<WordInputs | null>(null);
  
  const { setCurrentPoem } = useTheme();
  const abortControllerRef = useRef<AbortController | null>(null);

  // Loading messages that change over time
  const loadingMessages = useMemo(() => [
    'Weaving words together...',
    'Consulting with Claude...',
    'Crafting your unique poem...',
    'Adding poetic magic...',
    'Almost ready...'
  ], []);

  // const updateLoadingMessage = useCallback((messageIndex: number) => {
  //   if (messageIndex < loadingMessages.length) {
  //     setLoading(prev => ({
  //       ...prev,
  //       loadingText: loadingMessages[messageIndex],
  //       progress: ((messageIndex + 1) / loadingMessages.length) * 0.8 // Max 80% during generation
  //     }));
  //   }
  // }, [loadingMessages]);

  // Generate poem function
  const generatePoem = useCallback(async (inputs: WordInputs) => {
    console.log('🎯 GENERATE POEM CALLED:', { inputs, timestamp: new Date().toISOString() });
    
    // Validate inputs
    if (!inputs.verb?.trim() || !inputs.adjective?.trim() || !inputs.noun?.trim()) {
      console.log('❌ INPUT VALIDATION FAILED - Missing words');
      setError('Please provide all three words (verb, adjective, noun)');
      return;
    }
    
    console.log('✅ INPUT VALIDATION PASSED');

    // Cancel any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    // Reset state
    console.log('🔄 RESETTING STATE...');
    setError(null);
    setPoemData(null);
    setCurrentPoem(null);
    setLastInputs(inputs);
    
    // Start loading with first message
    console.log('⏳ STARTING LOADING STATE...');
    setLoading({
      isLoading: true,
      loadingText: loadingMessages[0],
      progress: 0.2
    });

    try {
      // Progressive loading messages
      const messageInterval = setInterval(() => {
        setLoading(prev => {
          const currentIndex = loadingMessages.indexOf(prev.loadingText || '');
          const nextIndex = Math.min(currentIndex + 1, loadingMessages.length - 1);
          return {
            ...prev,
            loadingText: loadingMessages[nextIndex],
            progress: ((nextIndex + 1) / loadingMessages.length) * 0.8
          };
        });
      }, 800);

      // Generate poem with retry logic
      console.log('🌐 CALLING API - generatePoemCached...');
      const result = await withRetry(
        () => generatePoemCached(inputs, abortControllerRef.current?.signal),
        3,
        1000
      );
      console.log('✅ API CALL SUCCESSFUL:', { 
        poemLength: result.poem.length, 
        wordCount: result.metadata.wordCount,
        sentiment: result.metadata.sentiment 
      });

      clearInterval(messageInterval);
      
      // Final loading state
      setLoading({
        isLoading: true,
        loadingText: 'Finalizing your poem...',
        progress: 0.9
      });

      // Small delay for smooth UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Success
      console.log('🎉 SETTING POEM DATA:', result);
      setPoemData(result);
      setCurrentPoem(result);
      setLoading({ isLoading: false, progress: 1 });
      
      console.log('🎊 POEM GENERATED SUCCESSFULLY:', {
        wordCount: result.metadata.wordCount,
        sentiment: result.metadata.sentiment,
        emotion: result.metadata.emotion,
        cached: result.metadata.id.includes('cached'),
        timestamp: new Date().toISOString()
      });

    } catch (err) {
      console.error('💥 POEM GENERATION ERROR:', err);
      
      if (abortControllerRef.current?.signal.aborted) {
        console.log('🚫 REQUEST CANCELLED');
        // Request was cancelled
        setLoading({ isLoading: false });
        return;
      }

      let errorMessage = 'Failed to generate poem. Please try again.';
      
      if (err instanceof ApiError) {
        console.error('🔴 API ERROR:', { code: err.code, message: err.message });
        switch (err.code) {
          case 'NETWORK_ERROR':
            errorMessage = 'Network connection failed. Please check your internet connection.';
            break;
          case 'TIMEOUT_ERROR':
            errorMessage = 'Request timed out. The service may be busy, please try again.';
            break;
          case 'VALIDATION_ERROR':
            errorMessage = err.message;
            break;
          case 'RATE_LIMIT_EXCEEDED':
            errorMessage = 'Too many requests. Please wait a moment before trying again.';
            break;
          default:
            errorMessage = err.message || errorMessage;
        }
      } else if (err instanceof Error) {
        console.error('🔴 GENERAL ERROR:', { message: err.message, stack: err.stack });
      } else {
        console.error('🔴 UNKNOWN ERROR:', { message: String(err), stack: undefined });
      }
      
      console.error('🚨 SETTING ERROR MESSAGE:', errorMessage);
      setError(errorMessage);
      setLoading({ isLoading: false });
    }
  }, [loadingMessages, setCurrentPoem]);

  // Retry last generation
  const retryGeneration = useCallback(async () => {
    if (lastInputs) {
      await generatePoem(lastInputs);
    }
  }, [lastInputs, generatePoem]);

  // Cancel current generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading({ isLoading: false });
    setError(null);
  }, []);

  // Clear poem data
  const clearPoem = useCallback(() => {
    cancelGeneration();
    setPoemData(null);
    setCurrentPoem(null);
    setError(null);
    setLastInputs(null);
  }, [cancelGeneration, setCurrentPoem]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    poemData,
    loading,
    error,
    generatePoem,
    clearPoem,
    retryGeneration,
    cancelGeneration,
  };
};
