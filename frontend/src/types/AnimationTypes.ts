export interface Vector2D {
  x: number;
  y: number;
}

export interface Particle {
  position: Vector2D;
  velocity: Vector2D;
  size: number;
  opacity: number;
  color: string;
  life: number;
  maxLife: number;
  rotation: number;
  rotationSpeed: number;
  data?: any; // For custom particle data
}

export interface AnimationConfig {
  particleCount: number;
  colors: string[];
  speed: number;
  size: {
    min: number;
    max: number;
  };
  opacity: {
    min: number;
    max: number;
  };
  life: {
    min: number;
    max: number;
  };
  interactive: boolean;
  webgl: boolean;
}

export interface MouseInteraction {
  position: Vector2D;
  isActive: boolean;
  strength: number;
}

export interface PerformanceMetrics {
  fps: number;
  particleCount: number;
  renderTime: number;
  isLowPerformance: boolean;
}

export type AnimationTheme = 
  | 'bubbles' 
  | 'snow'
  | 'rain' 
  | 'galaxy' 
  | 'geometric' 
  | 'fireflies' 
  | 'waves' 
  | 'stars';

export interface AnimationThemeConfig {
  theme: AnimationTheme;
  mood: 'joyful' | 'melancholic' | 'mystical' | 'modern' | 'romantic' | 'energetic';
  intensity: 'low' | 'medium' | 'high';
}

export interface CanvasSize {
  width: number;
  height: number;
}
