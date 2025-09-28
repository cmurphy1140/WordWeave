import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
import { cacheService } from '../services/CacheService';

interface PerformanceMetrics {
  // Core Web Vitals
  CLS: number | null;
  FID: number | null;
  LCP: number | null;
  
  // Other important metrics
  FCP: number | null;
  TTFB: number | null;
  
  // Custom metrics
  poemGenerationTime: number | null;
  themeAnalysisTime: number | null;
  cacheHitRate: number | null;
  bundleSize: number | null;
  
  // Timestamps
  timestamp: number;
  url: string;
  userAgent: string;
}

interface PerformanceConfig {
  enableReporting: boolean;
  endpoint?: string;
  sampleRate: number;
  debugMode: boolean;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Partial<PerformanceMetrics> = {};
  private config: PerformanceConfig = {
    enableReporting: true,
    sampleRate: 1.0,
    debugMode: process.env.NODE_ENV === 'development',
  };

  private constructor() {
    this.initializeWebVitals();
    this.initializeCustomMetrics();
  }

  public static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  private initializeWebVitals(): void {
    // Core Web Vitals
    getCLS(this.handleMetric.bind(this, 'CLS'));
    getFID(this.handleMetric.bind(this, 'FID'));
    getLCP(this.handleMetric.bind(this, 'LCP'));
    
    // Additional metrics
    getFCP(this.handleMetric.bind(this, 'FCP'));
    getTTFB(this.handleMetric.bind(this, 'TTFB'));
  }

  private initializeCustomMetrics(): void {
    // Monitor bundle size
    this.measureBundleSize();
    
    // Monitor cache performance
    this.initializeCacheMonitoring();
    
    // Monitor memory usage
    this.initializeMemoryMonitoring();
  }

  private handleMetric(metricName: string, metric: any): void {
    if (this.shouldReport()) {
      this.metrics[metricName as keyof PerformanceMetrics] = metric.value;
      
      if (this.config.debugMode) {
        console.log(`Performance Metric - ${metricName}:`, metric.value);
      }
      
      // Report to analytics endpoint
      this.reportMetric(metricName, metric);
    }
  }

  private shouldReport(): boolean {
    return this.config.enableReporting && Math.random() < this.config.sampleRate;
  }

  private reportMetric(metricName: string, metric: any): void {
    if (this.config.endpoint) {
      const payload = {
        metric: metricName,
        value: metric.value,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      // Send to analytics endpoint
      fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch((error) => {
        if (this.config.debugMode) {
          console.error('Failed to report performance metric:', error);
        }
      });
    }
  }

  private measureBundleSize(): void {
    // Measure initial bundle size
    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;

    scripts.forEach((script) => {
      const src = script.getAttribute('src');
      if (src && src.includes('/static/js/')) {
        // Estimate size based on script element
        totalSize += 100; // Placeholder - in real implementation, measure actual size
      }
    });

    this.metrics.bundleSize = totalSize;
  }

  private initializeCacheMonitoring(): void {
    // Monitor cache hit rate
    let cacheHits = 0;
    let cacheMisses = 0;

    // Override cache methods to track hits/misses
    const originalGet = cacheService.getCachedPoem.bind(cacheService);
    cacheService.getCachedPoem = (inputs: any) => {
      const result = originalGet(inputs);
      if (result) {
        cacheHits++;
      } else {
        cacheMisses++;
      }
      
      // Update hit rate
      const total = cacheHits + cacheMisses;
      this.metrics.cacheHitRate = total > 0 ? (cacheHits / total) * 100 : null;
      
      return result;
    };
  }

  private initializeMemoryMonitoring(): void {
    // Monitor memory usage if available
    if ('memory' in performance) {
      setInterval(() => {
        const memory = (performance as any).memory;
        if (memory) {
          console.log('Memory Usage:', {
            used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + ' MB',
            total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + ' MB',
            limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + ' MB',
          });
        }
      }, 30000); // Check every 30 seconds
    }
  }

  // Public methods for tracking custom metrics
  public trackPoemGeneration(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.poemGenerationTime = duration;
    
    if (this.config.debugMode) {
      console.log('Poem Generation Time:', duration + 'ms');
    }
  }

  public trackThemeAnalysis(startTime: number): void {
    const duration = Date.now() - startTime;
    this.metrics.themeAnalysisTime = duration;
    
    if (this.config.debugMode) {
      console.log('Theme Analysis Time:', duration + 'ms');
    }
  }

  public trackUserInteraction(action: string, startTime: number): void {
    const duration = Date.now() - startTime;
    
    if (this.config.debugMode) {
      console.log(`User Interaction - ${action}:`, duration + 'ms');
    }
  }

  public trackPageLoad(startTime: number): void {
    const duration = Date.now() - startTime;
    
    if (this.config.debugMode) {
      console.log('Page Load Time:', duration + 'ms');
    }
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return {
      ...this.metrics,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  public setConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Bundle size optimization helpers
  public analyzeBundleSize(): void {
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const jsResources = resources.filter(r => r.name.includes('.js'));
    const cssResources = resources.filter(r => r.name.includes('.css'));
    
    const jsSize = jsResources.reduce((total, r) => total + (r.transferSize || 0), 0);
    const cssSize = cssResources.reduce((total, r) => total + (r.transferSize || 0), 0);
    
    console.log('Bundle Analysis:', {
      'JS Size': Math.round(jsSize / 1024) + ' KB',
      'CSS Size': Math.round(cssSize / 1024) + ' KB',
      'Total Size': Math.round((jsSize + cssSize) / 1024) + ' KB',
      'JS Resources': jsResources.length,
      'CSS Resources': cssResources.length,
    });
  }

  // Lazy loading optimization
  public trackLazyLoad(element: string, loadTime: number): void {
    if (this.config.debugMode) {
      console.log(`Lazy Load - ${element}:`, loadTime + 'ms');
    }
  }

  // Image optimization tracking
  public trackImageLoad(src: string, loadTime: number, size: number): void {
    if (this.config.debugMode) {
      console.log('Image Load:', {
        src: src.substring(src.lastIndexOf('/') + 1),
        loadTime: loadTime + 'ms',
        size: Math.round(size / 1024) + ' KB',
      });
    }
  }
}

// Export singleton instance
export const performanceMonitor = PerformanceMonitor.getInstance();

// Utility functions for performance optimization
export const performanceUtils = {
  // Debounce function for performance
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  // Intersection Observer for lazy loading
  createIntersectionObserver(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1,
      ...options,
    };

    return new IntersectionObserver(callback, defaultOptions);
  },

  // Image lazy loading helper
  lazyLoadImage(img: HTMLImageElement, src: string): void {
    const startTime = Date.now();
    
    img.onload = () => {
      const loadTime = Date.now() - startTime;
      performanceMonitor.trackImageLoad(src, loadTime, 0); // Size would need to be fetched separately
    };

    img.src = src;
  },

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = href;
    link.as = as;
    document.head.appendChild(link);
  },

  // Prefetch resources
  prefetchResource(href: string): void {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  },

  // Measure function execution time
  measureTime<T>(fn: () => T, label: string): T {
    const start = performance.now();
    const result = fn();
    const end = performance.now();
    
    console.log(`${label}: ${end - start}ms`);
    return result;
  },

  // Async measure function execution time
  async measureTimeAsync<T>(fn: () => Promise<T>, label: string): Promise<T> {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    
    console.log(`${label}: ${end - start}ms`);
    return result;
  },
};

// Initialize performance monitoring
export function initializePerformanceMonitoring(config?: Partial<PerformanceConfig>): void {
  if (config) {
    performanceMonitor.setConfig(config);
  }
  
  // Track page load time
  window.addEventListener('load', () => {
    performanceMonitor.trackPageLoad(performance.timing.navigationStart);
    
    // Analyze bundle size after load
    setTimeout(() => {
      performanceMonitor.analyzeBundleSize();
    }, 1000);
  });
}
