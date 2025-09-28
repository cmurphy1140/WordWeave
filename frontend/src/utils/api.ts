import { WordInputs, PoemData, ThemeAnalysis, ApiResponse } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';
console.log('🔧 API_BASE_URL configured as:', API_BASE_URL);
const API_KEY = process.env.REACT_APP_API_KEY;

// Request configuration
const getRequestConfig = (options: RequestInit = {}): RequestInit => ({
  ...options,
  headers: {
    'Content-Type': 'application/json',
    ...(API_KEY && { 'X-API-Key': API_KEY }),
    ...options.headers,
  },
});

// Error handling utility
class ApiError extends Error {
  public code: string;
  public details?: any;

  constructor(message: string, code: string, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

// Generic API request handler
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  console.log('🌐 API REQUEST DETAILS:', {
    url,
    method: options.method || 'GET',
    headers: getRequestConfig(options).headers,
    body: options.body,
    timestamp: new Date().toISOString()
  });
  
  try {
    console.log('📡 MAKING FETCH REQUEST...');
    const response = await fetch(url, getRequestConfig(options));
    
    console.log('📨 RESPONSE RECEIVED:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    console.log('📝 PARSING JSON RESPONSE...');
    const data: ApiResponse<T> = await response.json();
    console.log('✅ JSON PARSED SUCCESSFULLY:', data);
    
    if (!response.ok) {
      console.error('❌ HTTP ERROR:', response.status, response.statusText);
      throw new ApiError(
        data.error?.message || `HTTP error! status: ${response.status}`,
        data.error?.code || 'HTTP_ERROR',
        data.error?.details
      );
    }
    
    if (!data.success) {
      console.error('❌ API SUCCESS=FALSE:', data);
      throw new ApiError(
        data.error?.message || 'API request failed',
        data.error?.code || 'API_ERROR',
        data.error?.details
      );
    }
    
    console.log('🎉 API REQUEST SUCCESSFUL:', data);
    return data;
  } catch (error) {
    console.error('💥 API REQUEST ERROR:', error);
    if (error instanceof ApiError) {
      console.error('🔴 API ERROR DETAILS:', {
        message: error.message,
        code: error.code,
        details: error.details
      });
      throw error;
    }
    
    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Network error. Please check your connection.',
        'NETWORK_ERROR'
      );
    }
    
    // Handle timeout errors
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError(
        'Request timed out. Please try again.',
        'TIMEOUT_ERROR'
      );
    }
    
    throw new ApiError(
      'An unexpected error occurred.',
      'UNKNOWN_ERROR',
      error
    );
  }
}

// Generate poem from three words
export async function generatePoem(
  inputs: WordInputs,
  signal?: AbortSignal
): Promise<PoemData> {
  console.log('🌐 API: generatePoem called with:', inputs);
  
  // Validate inputs
  if (!inputs.verb?.trim() || !inputs.adjective?.trim() || !inputs.noun?.trim()) {
    console.error('❌ API: Validation failed - missing words');
    throw new ApiError(
      'All three words (verb, adjective, noun) are required.',
      'VALIDATION_ERROR'
    );
  }

  console.log('🌐 API: Making request to:', `${API_BASE_URL}/generate`);
  const response = await apiRequest<PoemData>('/generate', {
    method: 'POST',
    body: JSON.stringify({
      verb: inputs.verb.trim(),
      adjective: inputs.adjective.trim(),
      noun: inputs.noun.trim(),
    }),
    signal,
  });

  console.log('✅ API: Request successful, returning data');
  return response.data!;
}

// Analyze poem theme (separate Lambda function)
export async function analyzeTheme(
  poem: string,
  signal?: AbortSignal
): Promise<ThemeAnalysis> {
  if (!poem?.trim()) {
    throw new ApiError('Poem text is required for theme analysis.', 'VALIDATION_ERROR');
  }

  const response = await apiRequest<ThemeAnalysis>('/analyze-theme', {
    method: 'POST',
    body: JSON.stringify({ poem: poem.trim() }),
    signal,
  });

  return response.data!;
}

// Health check endpoint
export async function checkHealth(signal?: AbortSignal): Promise<any> {
  const response = await apiRequest('/health', {
    method: 'GET',
    signal,
  });

  return response.data;
}

// Retry utility for failed requests
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries;
      const shouldRetry = error instanceof ApiError && 
        ['NETWORK_ERROR', 'TIMEOUT_ERROR'].includes(error.code);
      
      if (isLastAttempt || !shouldRetry) {
        throw error;
      }
      
      // Exponential backoff with jitter
      const backoffDelay = delay * Math.pow(2, attempt - 1) + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, backoffDelay));
    }
  }
  
  throw new Error('Max retry attempts exceeded');
}

// Request timeout utility
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 30000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new ApiError('Request timeout', 'TIMEOUT_ERROR')), timeoutMs)
    ),
  ]);
}

// Cached API calls (simple in-memory cache)
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export function getCachedData<T>(key: string): T | null {
  const cached = cache.get(key);
  if (!cached) return null;
  
  if (Date.now() > cached.timestamp + cached.ttl) {
    cache.delete(key);
    return null;
  }
  
  return cached.data as T;
}

export function setCachedData<T>(key: string, data: T, ttlMs: number = 300000): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
    ttl: ttlMs,
  });
}

// Generate poem with caching
export async function generatePoemCached(
  inputs: WordInputs,
  signal?: AbortSignal
): Promise<PoemData> {
  const cacheKey = `poem:${inputs.verb}:${inputs.adjective}:${inputs.noun}`;
  const cached = getCachedData<PoemData>(cacheKey);
  
  if (cached) {
    console.log('Returning cached poem');
    return cached;
  }
  
  const poem = await generatePoem(inputs, signal);
  setCachedData(cacheKey, poem, 600000); // 10 minute cache
  
  return poem;
}

// Analyze theme with caching
export async function analyzeThemeCached(
  poem: string,
  signal?: AbortSignal
): Promise<ThemeAnalysis> {
  const cacheKey = `theme:${poem}`;
  const cached = getCachedData<ThemeAnalysis>(cacheKey);
  
  if (cached) {
    console.log('Returning cached theme analysis');
    return cached;
  }
  
  const analysis = await analyzeTheme(poem, signal);
  setCachedData(cacheKey, analysis, 300000); // 5 minute cache
  
  return analysis;
}

// Export error class for use in components
export { ApiError };
