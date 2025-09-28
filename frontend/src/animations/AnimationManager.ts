import { 
  AnimationTheme, 
  AnimationThemeConfig, 
  AnimationConfig, 
  PerformanceMetrics 
} from '../types/AnimationTypes';
import { BaseAnimation } from './BaseAnimation';
import { BubbleAnimation } from './BubbleAnimation';
import { SnowAnimation } from './SnowAnimation';
import { RainAnimation } from './RainAnimation';
import { GalaxyAnimation } from './GalaxyAnimation';
import { GeometricAnimation } from './GeometricAnimation';
import { WebGLRenderer } from './WebGLRenderer';

export class AnimationManager {
  private canvas: HTMLCanvasElement;
  private currentAnimation: BaseAnimation | null = null;
  private webglRenderer: WebGLRenderer | null = null;
  private config: AnimationConfig;
  private themeConfig: AnimationThemeConfig;
  private isWebGLSupported: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.isWebGLSupported = this.checkWebGLSupport();
    
    this.config = this.getDefaultConfig();
    this.themeConfig = {
      theme: 'bubbles',
      mood: 'joyful',
      intensity: 'medium'
    };

    this.setupCanvas();
  }

  private checkWebGLSupport(): boolean {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch (e) {
      return false;
    }
  }

  private setupCanvas(): void {
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'none';
    this.canvas.style.zIndex = '-1';
  }

  private getDefaultConfig(): AnimationConfig {
    return {
      particleCount: 100,
      colors: ['#4A90E2', '#7ED321', '#F5A623', '#D0021B', '#9013FE'],
      speed: 1,
      size: { min: 2, max: 8 },
      opacity: { min: 0.3, max: 0.8 },
      life: { min: 3000, max: 8000 },
      interactive: true,
      webgl: this.isWebGLSupported
    };
  }

  private getThemeConfig(theme: AnimationTheme, mood: string, intensity: string): Partial<AnimationConfig> {
    const configs: Record<AnimationTheme, Partial<AnimationConfig>> = {
      bubbles: {
        particleCount: intensity === 'high' ? 150 : intensity === 'medium' ? 100 : 50,
        colors: ['#87CEEB', '#B0E0E6', '#E0F6FF', '#F0F8FF'],
        speed: mood === 'joyful' ? 1.2 : 0.8,
        size: { min: 5, max: 25 },
        opacity: { min: 0.3, max: 0.8 }
      },
      snow: {
        particleCount: intensity === 'high' ? 200 : intensity === 'medium' ? 120 : 60,
        colors: ['#FFFFFF', '#F8F8FF', '#E6E6FA'],
        speed: mood === 'melancholic' ? 0.5 : 1,
        size: { min: 1, max: 4 },
        opacity: { min: 0.4, max: 0.9 }
      },
      rain: {
        particleCount: intensity === 'high' ? 150 : intensity === 'medium' ? 100 : 50,
        colors: ['rgba(220, 230, 240, 0.3)', 'rgba(200, 210, 220, 0.4)', 'rgba(180, 190, 200, 0.5)'],
        speed: mood === 'melancholic' ? 0.7 : 1.2,
        size: { min: 1, max: 3 },
        opacity: { min: 0.2, max: 0.6 }
      },
      galaxy: {
        particleCount: intensity === 'high' ? 300 : intensity === 'medium' ? 200 : 100,
        colors: ['#4B0082', '#8A2BE2', '#9370DB', '#BA55D3'],
        speed: mood === 'mystical' ? 0.3 : 0.8,
        size: { min: 1, max: 3 },
        opacity: { min: 0.3, max: 0.8 }
      },
      geometric: {
        particleCount: intensity === 'high' ? 80 : intensity === 'medium' ? 50 : 30,
        colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7'],
        speed: mood === 'modern' ? 1.5 : 1,
        size: { min: 8, max: 20 },
        opacity: { min: 0.4, max: 0.8 }
      },
      fireflies: {
        particleCount: intensity === 'high' ? 120 : intensity === 'medium' ? 80 : 40,
        colors: ['#FFFF00', '#FFD700', '#FFA500'],
        speed: mood === 'romantic' ? 0.6 : 1.2,
        size: { min: 2, max: 6 },
        opacity: { min: 0.5, max: 1 }
      },
      waves: {
        particleCount: intensity === 'high' ? 100 : intensity === 'medium' ? 60 : 30,
        colors: ['#00CED1', '#20B2AA', '#48CAE4'],
        speed: mood === 'energetic' ? 1.8 : 1,
        size: { min: 3, max: 10 },
        opacity: { min: 0.3, max: 0.7 }
      },
      stars: {
        particleCount: intensity === 'high' ? 250 : intensity === 'medium' ? 150 : 75,
        colors: ['#FFFFFF', '#F0F8FF', '#E6E6FA'],
        speed: mood === 'mystical' ? 0.2 : 0.8,
        size: { min: 1, max: 2 },
        opacity: { min: 0.6, max: 1 }
      }
    };

    return configs[theme] || {};
  }

  public setTheme(theme: AnimationTheme, mood: string = 'joyful', intensity: string = 'medium'): void {
    this.themeConfig = { theme, mood: mood as any, intensity: intensity as any };
    
    // Stop current animation
    if (this.currentAnimation) {
      this.currentAnimation.destroy();
    }

    // Create new animation based on theme
    const themeConfig = this.getThemeConfig(theme, mood, intensity);
    this.config = { ...this.config, ...themeConfig };

    this.createAnimation();
  }

  private createAnimation(): void {
    switch (this.themeConfig.theme) {
      case 'bubbles':
        this.currentAnimation = new BubbleAnimation(this.canvas, this.config);
        break;
      case 'snow':
        this.currentAnimation = new SnowAnimation(this.canvas, this.config);
        break;
      case 'rain':
        this.currentAnimation = new RainAnimation(this.canvas, this.config);
        break;
      case 'galaxy':
        this.currentAnimation = new GalaxyAnimation(this.canvas, this.config);
        break;
      case 'geometric':
        this.currentAnimation = new GeometricAnimation(this.canvas, this.config);
        break;
      default:
        this.currentAnimation = new BubbleAnimation(this.canvas, this.config);
    }

    // Initialize WebGL renderer if supported and enabled
    if (this.config.webgl && this.isWebGLSupported) {
      try {
        this.webglRenderer = new WebGLRenderer(this.canvas);
      } catch (e) {
        console.warn('WebGL initialization failed, falling back to Canvas2D:', e);
        this.config.webgl = false;
      }
    }

    this.currentAnimation.start();
  }

  public start(): void {
    if (this.currentAnimation) {
      this.currentAnimation.start();
    }
  }

  public stop(): void {
    if (this.currentAnimation) {
      this.currentAnimation.stop();
    }
  }

  public updateConfig(newConfig: Partial<AnimationConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (this.currentAnimation) {
      this.currentAnimation.updateConfig(newConfig);
    }
  }

  public getPerformanceMetrics(): PerformanceMetrics | null {
    return this.currentAnimation?.getPerformanceMetrics() || null;
  }

  public getCurrentTheme(): AnimationThemeConfig {
    return { ...this.themeConfig };
  }

  public destroy(): void {
    if (this.currentAnimation) {
      this.currentAnimation.destroy();
    }
    if (this.webglRenderer) {
      this.webglRenderer.destroy();
    }
  }

  // Static method to detect theme from text content
  public static detectThemeFromText(text: string): AnimationThemeConfig {
    const lowerText = text.toLowerCase();
    
    // Joyful/playful keywords
    const joyfulKeywords = ['happy', 'joy', 'laugh', 'smile', 'bright', 'sunny', 'cheerful', 'playful', 'bubble', 'dance'];
    // Melancholic keywords
    const melancholicKeywords = ['sad', 'tear', 'cry', 'lonely', 'dark', 'cold', 'winter', 'snow', 'rain', 'grey', 'storm', 'drip', 'pour'];
    // Mystical keywords
    const mysticalKeywords = ['magic', 'mystery', 'star', 'moon', 'night', 'dream', 'spirit', 'cosmic', 'galaxy', 'universe'];
    // Modern/technical keywords
    const modernKeywords = ['tech', 'digital', 'modern', 'geometric', 'sharp', 'edge', 'precise', 'system', 'data'];
    // Romantic keywords
    const romanticKeywords = ['love', 'heart', 'romance', 'firefly', 'twilight', 'gentle', 'soft', 'warm'];
    // Energetic keywords
    const energeticKeywords = ['energy', 'power', 'fast', 'dynamic', 'wave', 'flow', 'movement', 'speed'];

    let mood: 'joyful' | 'melancholic' | 'mystical' | 'modern' | 'romantic' | 'energetic' = 'joyful';
    let theme: AnimationTheme = 'bubbles';
    let intensity: 'low' | 'medium' | 'high' = 'medium';

    // Detect mood
    if (joyfulKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'joyful';
      theme = 'bubbles';
    } else if (melancholicKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'melancholic';
      // Choose between snow and rain for melancholic mood
      if (['rain', 'storm', 'drip', 'pour', 'tear', 'cry'].some(keyword => lowerText.includes(keyword))) {
        theme = 'rain';
      } else {
        theme = 'snow';
      }
    } else if (mysticalKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'mystical';
      theme = 'galaxy';
    } else if (modernKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'modern';
      theme = 'geometric';
    } else if (romanticKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'romantic';
      theme = 'fireflies';
    } else if (energeticKeywords.some(keyword => lowerText.includes(keyword))) {
      mood = 'energetic';
      theme = 'waves';
    }

    // Detect intensity based on text length and punctuation
    const exclamationCount = (text.match(/!/g) || []).length;
    const wordCount = text.split(/\s+/).length;

    if (exclamationCount > 2 || wordCount > 100) {
      intensity = 'high';
    } else if (exclamationCount === 0 && wordCount < 30) {
      intensity = 'low';
    } else {
      intensity = 'medium';
    }

    return { theme, mood, intensity };
  }
}
