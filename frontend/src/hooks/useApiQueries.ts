import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { WordInputs, PoemData, ThemeAnalysis } from '../types';
import { generatePoemCached, analyzeThemeCached } from '../utils/api';
import { cacheService } from '../services/CacheService';

// Query keys for React Query
export const queryKeys = {
  poems: ['poems'] as const,
  poem: (inputs: WordInputs) => ['poems', 'poem', inputs] as const,
  themes: ['themes'] as const,
  theme: (inputs: WordInputs) => ['themes', 'theme', inputs] as const,
  cachedPoems: ['poems', 'cached'] as const,
  userPreferences: ['user', 'preferences'] as const,
};

// Hook for generating poems with caching
export const useGeneratePoem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (inputs: WordInputs): Promise<PoemData> => {
      // Check cache first
      const cached = cacheService.getCachedPoem(inputs);
      if (cached) {
        return cached;
      }

      // Generate new poem
      const poemData = await generatePoemCached(inputs);
      
      // Cache the result
      cacheService.cachePoem(inputs, poemData);
      
      return poemData;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.poems });
      queryClient.invalidateQueries({ queryKey: queryKeys.cachedPoems });
      
      // Set the generated poem in cache
      queryClient.setQueryData(queryKeys.poem(variables), data);
    },
    onError: (error) => {
      console.error('Failed to generate poem:', error);
    },
  });
};

// Hook for analyzing themes with caching
export const useAnalyzeTheme = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ inputs, poem }: { inputs: WordInputs; poem: string }): Promise<ThemeAnalysis> => {
      // Check cache first
      const cached = cacheService.getCachedThemeAnalysis(inputs);
      if (cached) {
        return cached;
      }

      // Analyze theme
      const themeAnalysis = await analyzeThemeCached(poem);
      
      // Cache the result
      cacheService.cacheThemeAnalysis(inputs, themeAnalysis);
      
      return themeAnalysis;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.themes });
      
      // Set the analysis in cache
      queryClient.setQueryData(queryKeys.theme(variables.inputs), data);
    },
    onError: (error) => {
      console.error('Failed to analyze theme:', error);
    },
  });
};

// Hook for getting cached poems
export const useCachedPoems = () => {
  return useQuery({
    queryKey: queryKeys.cachedPoems,
    queryFn: () => cacheService.getAllCachedPoems(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting a specific poem from cache
export const useCachedPoem = (inputs: WordInputs | null) => {
  return useQuery({
    queryKey: inputs ? queryKeys.poem(inputs) : [],
    queryFn: () => inputs ? cacheService.getCachedPoem(inputs) : null,
    enabled: !!inputs,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Hook for getting user preferences
export const useUserPreferences = () => {
  return useQuery({
    queryKey: queryKeys.userPreferences,
    queryFn: () => cacheService.getUserPreferences() || {},
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

// Hook for updating user preferences
export const useUpdateUserPreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: any) => {
      cacheService.cacheUserPreferences(preferences);
      return preferences;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.userPreferences, data);
    },
  });
};

// Hook for cache management
export const useCacheManagement = () => {
  const queryClient = useQueryClient();

  const clearAllCache = () => {
    cacheService.clearAllCache();
    queryClient.clear();
  };

  const removePoemFromCache = (inputs: WordInputs) => {
    cacheService.removeCachedPoem(inputs);
    queryClient.removeQueries({ queryKey: queryKeys.poem(inputs) });
    queryClient.invalidateQueries({ queryKey: queryKeys.cachedPoems });
  };

  const getCacheStats = () => {
    return cacheService.getCacheStats();
  };

  const warmCache = async () => {
    await cacheService.warmCacheWithPopularWords();
    queryClient.invalidateQueries({ queryKey: queryKeys.cachedPoems });
  };

  return {
    clearAllCache,
    removePoemFromCache,
    getCacheStats,
    warmCache,
  };
};

// Hook for prefetching popular poems
export const usePrefetchPopularPoems = () => {
  const queryClient = useQueryClient();

  const prefetchPopularPoems = async () => {
    const popularCombinations = [
      { verb: 'dance', adjective: 'ethereal', noun: 'moonlight' },
      { verb: 'whisper', adjective: 'ancient', noun: 'forest' },
      { verb: 'soar', adjective: 'golden', noun: 'horizon' },
      { verb: 'bloom', adjective: 'vibrant', noun: 'garden' },
      { verb: 'flow', adjective: 'serene', noun: 'river' },
    ];

    // Prefetch each popular combination
    await Promise.allSettled(
      popularCombinations.map(async (inputs) => {
        // Only prefetch if not already cached
        const cached = cacheService.getCachedPoem(inputs);
        if (!cached) {
          try {
            await queryClient.prefetchQuery({
              queryKey: queryKeys.poem(inputs),
              queryFn: async () => {
                const poemData = await generatePoemCached(inputs);
                cacheService.cachePoem(inputs, poemData);
                return poemData;
              },
              staleTime: 5 * 60 * 1000,
            });
          } catch (error) {
            console.warn(`Failed to prefetch poem for ${inputs.verb} ${inputs.adjective} ${inputs.noun}:`, error);
          }
        }
      })
    );
  };

  return { prefetchPopularPoems };
};

// Hook for background cache warming
export const useCacheWarming = () => {
  const { prefetchPopularPoems } = usePrefetchPopularPoems();

  const startBackgroundWarming = () => {
    // Warm cache on app start
    setTimeout(() => {
      prefetchPopularPoems();
    }, 2000); // Wait 2 seconds after app load

    // Set up periodic cache warming (every 30 minutes)
    const interval = setInterval(() => {
      prefetchPopularPoems();
    }, 30 * 60 * 1000);

    return () => clearInterval(interval);
  };

  return { startBackgroundWarming };
};
