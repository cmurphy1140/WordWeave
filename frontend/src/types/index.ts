// WordWeave TypeScript type definitions

export interface WordInputs {
  verb: string;
  adjective: string;
  noun: string;
  words?: string[]; // Optional array of input words
}

export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    gradient: string[];
  };
  animations: {
    style: 'calm' | 'energetic' | 'dramatic' | 'mystical';
    duration: number;
    stagger: number;
  };
  typography: {
    mood: 'modern' | 'classic' | 'playful' | 'elegant';
    scale: number;
  };
}

export interface PoemMetadata {
  id: string;
  wordCount: number;
  sentiment: string;
  emotion: string;
  generationTime: number;
  words?: string[]; // Source words used for generation
  style?: string; // Poetry style (e.g., 'Free Verse', 'Haiku')
  mood?: string; // Mood of the poem
}

export interface PoemData {
  poem: string;
  theme: Theme;
  metadata: PoemMetadata;
  analysis?: PoemAnalysis;
}

export interface PoemAnalysis {
  themes?: string[]; // Top-level themes array for easy access
  themeAnalysis: {
    emotional_tone: {
      primary: string;
      secondary?: string;
      intensity: 'high' | 'medium' | 'low';
      scores: Record<string, number>;
    };
    themes: string[];
    literary_devices: string[];
    word_analysis: {
      original: WordInputs;
      enhanced: WordInputs;
      transformation_quality: 'minimal' | 'moderate' | 'significant';
    };
  };
  visualRecommendations: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      gradient: string[];
    };
    typography: {
      fontFamily: string;
      fontWeight: string;
      letterSpacing: string;
      lineHeight: number;
      fontSize: string;
    };
    animations: {
      duration: number;
      easing: string;
      stagger: number;
      style: string;
    };
    layout: {
      style: string;
      alignment: string;
      spacing: string;
    };
    effects: {
      blur: boolean;
      glow: boolean;
      shadow: boolean;
      gradient: boolean;
    };
  };
  poetryMetrics: {
    readabilityScore: number;
    emotionalImpact: number;
    creativityIndex: number;
    coherenceScore: number;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  cached?: boolean;
}

export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
  progress?: number;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

// Word suggestion types
export interface WordSuggestion {
  word: string;
  category: 'common' | 'creative' | 'poetic';
}

export interface WordOptions {
  verbs: WordSuggestion[];
  adjectives: WordSuggestion[];
  nouns: WordSuggestion[];
}

// Animation configuration
export interface AnimationConfig {
  staggerChildren: number;
  delayChildren: number;
  transition: {
    duration: number;
    ease: string | number[];
  };
}

// Theme analysis result (from theme analyzer Lambda)
export interface ThemeAnalysis {
  emotion: {
    primary: string;
    intensity: number;
    secondary: Array<{
      emotion: string;
      intensity: number;
    }>;
  };
  colors: {
    palette: Array<{
      hex: string;
      weight: number;
      role: 'primary' | 'secondary' | 'accent' | 'neutral' | 'highlight';
    }>;
    dominant_temperature: 'warm' | 'cool' | 'neutral';
    saturation_level: 'high' | 'medium' | 'low';
  };
  animation: {
    style: 'calm' | 'energetic' | 'dramatic' | 'mystical';
    timing: {
      duration: number;
      stagger_delay: number;
      easing: string;
    };
    movement_type: string;
    particles: {
      enabled: boolean;
      type: string;
      density: number;
      speed: number;
    };
  };
  imagery: {
    keywords: string[];
    category: string;
    visual_density: number;
  };
  typography: {
    mood: 'modern' | 'classic' | 'playful' | 'elegant';
    font_weight: number;
    font_scale: number;
    line_height: number;
    letter_spacing: number;
    text_shadow: number;
  };
  layout: {
    spacing_scale: number;
    border_radius: number;
    backdrop_blur: number;
    gradient_angle: number;
    opacity_variations: number[];
  };
  metadata: {
    analysis_confidence: number;
    processing_notes: string;
    analysis_timestamp: string;
  };
}

// Layout system types
export type LayoutStyle = 'centered' | 'book' | 'spiral' | 'scattered';

export interface LayoutConfig {
  style: LayoutStyle;
  responsive: boolean;
  gestureControls: boolean;
  autoSwitch: boolean;
  transitionDuration: number;
}

export interface LayoutTransition {
  from: LayoutStyle;
  to: LayoutStyle;
  duration: number;
  easing: string;
}

