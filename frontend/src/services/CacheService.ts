import { PoemData, WordInputs } from '../types';

// Cache configuration
const CACHE_CONFIG = {
  POEMS: {
    key: 'wordweave_poems',
    maxItems: 50,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  THEMES: {
    key: 'wordweave_themes',
    maxItems: 20,
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  },
  USER_PREFERENCES: {
    key: 'wordweave_preferences',
    maxItems: 1,
    ttl: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
};

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface CacheEntry<T> {
  [key: string]: CacheItem<T>;
}

export class CacheService {
  private static instance: CacheService;
  private cache: Map<string, CacheEntry<any>> = new Map();

  private constructor() {
    this.loadFromLocalStorage();
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Generic cache methods
  private set<T>(cacheKey: string, itemKey: string, data: T, ttl: number): void {
    const cache = this.cache.get(cacheKey) || {};
    cache[itemKey] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
    this.cache.set(cacheKey, cache);
    this.saveToLocalStorage();
  }

  private get<T>(cacheKey: string, itemKey: string): T | null {
    const cache = this.cache.get(cacheKey);
    if (!cache || !cache[itemKey]) {
      return null;
    }

    const item = cache[itemKey];
    const now = Date.now();

    // Check if item has expired
    if (now - item.timestamp > item.ttl) {
      delete cache[itemKey];
      this.cache.set(cacheKey, cache);
      this.saveToLocalStorage();
      return null;
    }

    return item.data;
  }

  private remove(cacheKey: string, itemKey: string): void {
    const cache = this.cache.get(cacheKey);
    if (cache && cache[itemKey]) {
      delete cache[itemKey];
      this.cache.set(cacheKey, cache);
      this.saveToLocalStorage();
    }
  }

  private clear(cacheKey: string): void {
    this.cache.delete(cacheKey);
    this.saveToLocalStorage();
  }

  private cleanup(cacheKey: string, maxItems: number): void {
    const cache = this.cache.get(cacheKey);
    if (!cache) return;

    const entries = Object.entries(cache);
    if (entries.length <= maxItems) return;

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - maxItems);
    toRemove.forEach(([key]) => {
      delete cache[key];
    });

    this.cache.set(cacheKey, cache);
    this.saveToLocalStorage();
  }

  // Poem-specific cache methods
  public cachePoem(inputs: WordInputs, poemData: PoemData): void {
    const key = this.generatePoemKey(inputs);
    this.set(CACHE_CONFIG.POEMS.key, key, poemData, CACHE_CONFIG.POEMS.ttl);
    this.cleanup(CACHE_CONFIG.POEMS.key, CACHE_CONFIG.POEMS.maxItems);
  }

  public getCachedPoem(inputs: WordInputs): PoemData | null {
    const key = this.generatePoemKey(inputs);
    return this.get(CACHE_CONFIG.POEMS.key, key);
  }

  public getAllCachedPoems(): Array<{ inputs: WordInputs; poemData: PoemData }> {
    const cache = this.cache.get(CACHE_CONFIG.POEMS.key) || {};
    return Object.entries(cache)
      .filter(([_, item]) => {
        const now = Date.now();
        return now - item.timestamp <= item.ttl;
      })
      .map(([key, item]) => ({
        inputs: this.parsePoemKey(key),
        poemData: item.data,
      }))
      .sort((a, b) => b.poemData.metadata.generationTime - a.poemData.metadata.generationTime);
  }

  public removeCachedPoem(inputs: WordInputs): void {
    const key = this.generatePoemKey(inputs);
    this.remove(CACHE_CONFIG.POEMS.key, key);
  }

  // Theme cache methods
  public cacheThemeAnalysis(inputs: WordInputs, themeAnalysis: any): void {
    const key = this.generatePoemKey(inputs);
    this.set(CACHE_CONFIG.THEMES.key, key, themeAnalysis, CACHE_CONFIG.THEMES.ttl);
    this.cleanup(CACHE_CONFIG.THEMES.key, CACHE_CONFIG.THEMES.maxItems);
  }

  public getCachedThemeAnalysis(inputs: WordInputs): any | null {
    const key = this.generatePoemKey(inputs);
    return this.get(CACHE_CONFIG.THEMES.key, key);
  }

  // User preferences cache
  public cacheUserPreferences(preferences: any): void {
    this.set(CACHE_CONFIG.USER_PREFERENCES.key, 'preferences', preferences, CACHE_CONFIG.USER_PREFERENCES.ttl);
  }

  public getUserPreferences(): any | null {
    return this.get(CACHE_CONFIG.USER_PREFERENCES.key, 'preferences');
  }

  // Utility methods
  private generatePoemKey(inputs: WordInputs): string {
    return `${inputs.verb.toLowerCase()}_${inputs.adjective.toLowerCase()}_${inputs.noun.toLowerCase()}`;
  }

  private parsePoemKey(key: string): WordInputs {
    const [verb, adjective, noun] = key.split('_');
    return { verb, adjective, noun };
  }

  // LocalStorage persistence
  private saveToLocalStorage(): void {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem('wordweave_cache', JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to localStorage:', error);
    }
  }

  private loadFromLocalStorage(): void {
    try {
      const data = localStorage.getItem('wordweave_cache');
      if (data) {
        const parsed = JSON.parse(data);
        this.cache = new Map(Object.entries(parsed));
        
        // Clean up expired items on load
        this.cleanupExpiredItems();
      }
    } catch (error) {
      console.warn('Failed to load cache from localStorage:', error);
      this.cache = new Map();
    }
  }

  private cleanupExpiredItems(): void {
    const now = Date.now();
    for (const [cacheKey, cache] of Array.from(this.cache.entries())) {
      const expiredKeys = Object.entries(cache)
        .filter(([_, item]: [string, CacheItem<any>]) => now - item.timestamp > item.ttl)
        .map(([key, _]) => key);

      expiredKeys.forEach(key => {
        delete cache[key];
      });

      if (Object.keys(cache).length === 0) {
        this.cache.delete(cacheKey);
      } else {
        this.cache.set(cacheKey, cache);
      }
    }
    this.saveToLocalStorage();
  }

  // Public utility methods
  public clearAllCache(): void {
    this.cache.clear();
    localStorage.removeItem('wordweave_cache');
  }

  public getCacheStats(): {
    poems: number;
    themes: number;
    totalSize: number;
  } {
    const poemsCache = this.cache.get(CACHE_CONFIG.POEMS.key) || {};
    const themesCache = this.cache.get(CACHE_CONFIG.THEMES.key) || {};
    
    return {
      poems: Object.keys(poemsCache).length,
      themes: Object.keys(themesCache).length,
      totalSize: JSON.stringify(Object.fromEntries(this.cache)).length,
    };
  }

  // Cache warming strategies
  public async warmCacheWithPopularWords(): Promise<void> {
    const popularCombinations = [
      { verb: 'dance', adjective: 'ethereal', noun: 'moonlight' },
      { verb: 'whisper', adjective: 'ancient', noun: 'forest' },
      { verb: 'soar', adjective: 'golden', noun: 'horizon' },
      { verb: 'bloom', adjective: 'vibrant', noun: 'garden' },
      { verb: 'flow', adjective: 'serene', noun: 'river' },
    ];

    // Only warm cache for combinations that aren't already cached
    for (const combination of popularCombinations) {
      if (!this.getCachedPoem(combination)) {
        // This would trigger a background fetch in a real implementation
        console.log(`Cache warming: ${combination.verb} ${combination.adjective} ${combination.noun}`);
      }
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();
