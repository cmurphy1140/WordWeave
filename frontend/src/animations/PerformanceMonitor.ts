interface DeviceCapabilities {
  gpu: 'high' | 'medium' | 'low' | 'unknown';
  memory: number; // in GB
  cores: number;
  isMobile: boolean;
  isLowPowerMode?: boolean;
}

interface AdaptiveConfig {
  maxParticles: number;
  targetFPS: number;
  enableWebGL: boolean;
  reducedMotion: boolean;
  qualityLevel: 'high' | 'medium' | 'low';
}

export class PerformanceMonitor {
  private frameRates: number[] = [];
  private lastFrameTime: number = 0;
  private dropFrames: number = 0;
  private deviceCapabilities: DeviceCapabilities;
  private adaptiveConfig: AdaptiveConfig;

  constructor() {
    this.deviceCapabilities = this.detectDeviceCapabilities();
    this.adaptiveConfig = this.generateAdaptiveConfig();
  }

  private detectDeviceCapabilities(): DeviceCapabilities {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') as WebGLRenderingContext | null || 
               canvas.getContext('experimental-webgl') as WebGLRenderingContext | null;
    
    let gpu: DeviceCapabilities['gpu'] = 'unknown';
    if (gl) {
      try {
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
          const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
          const rendererString = renderer ? String(renderer) : '';
          // Rough GPU classification based on common patterns
          if (/RTX|GTX|Radeon RX|Apple M[123]|A[0-9]+X/i.test(rendererString)) {
            gpu = 'high';
          } else if (/Intel|UHD|Iris|Vega/i.test(rendererString)) {
            gpu = 'medium';
          } else if (rendererString) {
            gpu = 'low';
          }
        }
      } catch (e) {
        // WebGL context creation might fail, keep 'unknown'
      }
    }

    // Estimate memory (rough heuristic)
    const memory = (navigator as any).deviceMemory || 4; // Default to 4GB if unknown
    const cores = navigator.hardwareConcurrency || 4;
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check for low power mode (iOS specific)
    let isLowPowerMode = false;
    try {
      if ('getBattery' in navigator) {
        // This is a rough heuristic - actual low power mode detection is complex
        isLowPowerMode = false; // Would need more sophisticated detection
      }
    } catch (e) {
      // getBattery might not be available
    }

    return {
      gpu,
      memory,
      cores,
      isMobile,
      isLowPowerMode
    };
  }

  private generateAdaptiveConfig(): AdaptiveConfig {
    const { gpu, memory, cores, isMobile, isLowPowerMode } = this.deviceCapabilities;
    
    // Check for user preference for reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let qualityLevel: 'high' | 'medium' | 'low' = 'medium';
    let maxParticles = 100;
    let targetFPS = 60;
    let enableWebGL = false;

    if (isMobile || isLowPowerMode || prefersReducedMotion) {
      qualityLevel = 'low';
      maxParticles = 30;
      targetFPS = 30;
      enableWebGL = false;
    } else if (gpu === 'high' && memory >= 8 && cores >= 8) {
      qualityLevel = 'high';
      maxParticles = 200;
      targetFPS = 60;
      enableWebGL = true;
    } else if (gpu === 'medium' && memory >= 4) {
      qualityLevel = 'medium';
      maxParticles = 100;
      targetFPS = 60;
      enableWebGL = true;
    } else {
      qualityLevel = 'low';
      maxParticles = 50;
      targetFPS = 30;
      enableWebGL = false;
    }

    return {
      maxParticles,
      targetFPS,
      enableWebGL,
      reducedMotion: prefersReducedMotion,
      qualityLevel
    };
  }

  public recordFrame(currentTime: number): number {
    if (this.lastFrameTime === 0) {
      this.lastFrameTime = currentTime;
      return 60; // Default assumption for first frame
    }

    const deltaTime = currentTime - this.lastFrameTime;
    const fps = 1000 / deltaTime;
    
    this.frameRates.push(fps);
    
    // Keep only last 120 frames for averaging
    if (this.frameRates.length > 120) {
      this.frameRates.shift();
    }

    // Track dropped frames
    if (fps < this.adaptiveConfig.targetFPS * 0.8) {
      this.dropFrames++;
    }

    this.lastFrameTime = currentTime;
    return fps;
  }

  public getAverageFPS(): number {
    if (this.frameRates.length === 0) return 60;
    return this.frameRates.reduce((sum, fps) => sum + fps, 0) / this.frameRates.length;
  }

  public shouldReduceQuality(): boolean {
    const avgFPS = this.getAverageFPS();
    const dropRate = this.dropFrames / Math.max(1, this.frameRates.length);
    
    return avgFPS < this.adaptiveConfig.targetFPS * 0.7 || dropRate > 0.1;
  }

  public shouldIncreaseQuality(): boolean {
    const avgFPS = this.getAverageFPS();
    const dropRate = this.dropFrames / Math.max(1, this.frameRates.length);
    
    return avgFPS > this.adaptiveConfig.targetFPS * 1.1 && dropRate < 0.05 && this.frameRates.length > 60;
  }

  public getAdaptiveParticleCount(currentCount: number): number {
    if (this.shouldReduceQuality()) {
      return Math.max(10, Math.floor(currentCount * 0.8));
    } else if (this.shouldIncreaseQuality()) {
      return Math.min(this.adaptiveConfig.maxParticles, Math.floor(currentCount * 1.1));
    }
    return currentCount;
  }

  public getDeviceCapabilities(): DeviceCapabilities {
    return { ...this.deviceCapabilities };
  }

  public getAdaptiveConfig(): AdaptiveConfig {
    return { ...this.adaptiveConfig };
  }

  public getPerformanceReport(): {
    avgFPS: number;
    dropRate: number;
    qualityRecommendation: 'increase' | 'decrease' | 'maintain';
    deviceInfo: DeviceCapabilities;
  } {
    const avgFPS = this.getAverageFPS();
    const dropRate = this.dropFrames / Math.max(1, this.frameRates.length);
    
    let qualityRecommendation: 'increase' | 'decrease' | 'maintain' = 'maintain';
    if (this.shouldReduceQuality()) {
      qualityRecommendation = 'decrease';
    } else if (this.shouldIncreaseQuality()) {
      qualityRecommendation = 'increase';
    }

    return {
      avgFPS,
      dropRate,
      qualityRecommendation,
      deviceInfo: this.getDeviceCapabilities()
    };
  }

  public reset(): void {
    this.frameRates = [];
    this.dropFrames = 0;
    this.lastFrameTime = 0;
  }
}
