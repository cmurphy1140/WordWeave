import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Theme, PoemData, ThemeAnalysis } from '../types';
import { analyzeTheme, withRetry } from '../utils/api';

interface ThemeContextType {
  currentTheme: Theme | null;
  themeAnalysis: ThemeAnalysis | null;
  currentPoem: PoemData | null;
  isLoadingTheme: boolean;
  themeError: string | null;
  applyTheme: (theme: Theme) => void;
  applyThemeAnalysis: (analysis: ThemeAnalysis) => void;
  generateAndApplyTheme: (poem: string) => Promise<void>;
  setCurrentPoem: (poem: PoemData | null) => void;
  clearTheme: () => void;
  getThemeCSS: () => Record<string, string>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null);
  const [themeAnalysis, setThemeAnalysis] = useState<ThemeAnalysis | null>(null);
  const [currentPoem, setCurrentPoem] = useState<PoemData | null>(null);
  const [isLoadingTheme, setIsLoadingTheme] = useState(false);
  const [themeError, setThemeError] = useState<string | null>(null);

  // Apply theme to CSS custom properties
  const applyTheme = useCallback((theme: Theme) => {
    const root = document.documentElement;
    
    // Apply color palette
    root.style.setProperty('--theme-primary', theme.colors.primary);
    root.style.setProperty('--theme-secondary', theme.colors.secondary);
    root.style.setProperty('--theme-accent', theme.colors.accent);
    root.style.setProperty('--theme-background', theme.colors.background);
    
    // Create gradient from color array
    if (theme.colors.gradient && theme.colors.gradient.length > 0) {
      const gradientString = `linear-gradient(135deg, ${theme.colors.gradient.join(', ')})`;
      root.style.setProperty('--theme-gradient', gradientString);
    }
    
    // Apply animation properties
    root.style.setProperty('--theme-animation-duration', `${theme.animations.duration}ms`);
    root.style.setProperty('--theme-stagger-delay', `${theme.animations.stagger}ms`);
    root.style.setProperty('--theme-animation-style', theme.animations.style);
    
    // Apply typography
    root.style.setProperty('--theme-font-scale', theme.typography.scale.toString());
    root.style.setProperty('--theme-typography-mood', theme.typography.mood);
    
    // Set data attributes for CSS selectors
    document.body.setAttribute('data-theme-style', theme.animations.style);
    document.body.setAttribute('data-typography-mood', theme.typography.mood);
    
    setCurrentTheme(theme);
    console.log('Applied theme:', theme.animations.style);
  }, []);

  // Apply detailed theme analysis from theme analyzer Lambda
  const applyThemeAnalysis = useCallback((analysis: ThemeAnalysis) => {
    const root = document.documentElement;
    
    // Apply color palette with weights
    if (analysis.colors?.palette) {
      analysis.colors.palette.forEach((color, index) => {
        root.style.setProperty(`--theme-color-${index + 1}`, color.hex);
        root.style.setProperty(`--theme-${color.role}`, color.hex);
        root.style.setProperty(`--theme-${color.role}-weight`, color.weight.toString());
      });
      
      // Create gradient from weighted colors
      const sortedColors = [...analysis.colors.palette]
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(c => c.hex);
      
      const gradientAngle = analysis.layout?.gradient_angle || 135;
      const gradient = `linear-gradient(${gradientAngle}deg, ${sortedColors.join(', ')})`;
      root.style.setProperty('--theme-gradient', gradient);
      
      // Apply color temperature class
      document.body.setAttribute('data-color-temperature', analysis.colors.dominant_temperature);
    }
    
    // Apply detailed animation settings
    if (analysis.animation) {
      const anim = analysis.animation;
      root.style.setProperty('--theme-animation-duration', `${anim.timing.duration}ms`);
      root.style.setProperty('--theme-stagger-delay', `${anim.timing.stagger_delay}ms`);
      root.style.setProperty('--theme-animation-easing', anim.timing.easing);
      root.style.setProperty('--theme-movement-type', anim.movement_type);
      
      // Particle effects
      if (anim.particles.enabled) {
        root.style.setProperty('--theme-particle-density', anim.particles.density.toString());
        root.style.setProperty('--theme-particle-speed', anim.particles.speed.toString());
        document.body.setAttribute('data-particles-enabled', 'true');
        document.body.setAttribute('data-particle-type', anim.particles.type);
      } else {
        document.body.removeAttribute('data-particles-enabled');
        document.body.removeAttribute('data-particle-type');
      }
      
      document.body.setAttribute('data-animation-style', anim.style);
      document.body.setAttribute('data-movement-type', anim.movement_type);
    }
    
    // Apply typography settings
    if (analysis.typography) {
      const typo = analysis.typography;
      root.style.setProperty('--theme-font-weight', typo.font_weight.toString());
      root.style.setProperty('--theme-font-scale', typo.font_scale.toString());
      root.style.setProperty('--theme-line-height', typo.line_height.toString());
      root.style.setProperty('--theme-letter-spacing', `${typo.letter_spacing}em`);
      
      if (typo.text_shadow > 0) {
        const shadow = `0 ${typo.text_shadow}px ${typo.text_shadow * 2}px rgba(0,0,0,0.3)`;
        root.style.setProperty('--theme-text-shadow', shadow);
      } else {
        root.style.setProperty('--theme-text-shadow', 'none');
      }
      
      document.body.setAttribute('data-typography-mood', typo.mood);
    }
    
    // Apply layout settings
    if (analysis.layout) {
      const layout = analysis.layout;
      root.style.setProperty('--theme-spacing-scale', layout.spacing_scale.toString());
      root.style.setProperty('--theme-border-radius', `${layout.border_radius}px`);
      root.style.setProperty('--theme-backdrop-blur', `${layout.backdrop_blur}px`);
      
      // Apply opacity variations
      if (layout.opacity_variations) {
        layout.opacity_variations.forEach((opacity, index) => {
          root.style.setProperty(`--theme-opacity-${index + 1}`, opacity.toString());
        });
      }
    }
    
    // Apply emotion-based modifiers
    if (analysis.emotion) {
      document.body.setAttribute('data-emotion', analysis.emotion.primary);
      document.body.setAttribute('data-emotion-intensity', 
        Math.round(analysis.emotion.intensity * 10).toString());
      
      // Apply emotion-based CSS filters
      const intensity = analysis.emotion.intensity;
      switch (analysis.emotion.primary) {
        case 'joy':
          root.style.setProperty('--theme-brightness', (1 + intensity * 0.2).toString());
          root.style.setProperty('--theme-saturation', (1 + intensity * 0.1).toString());
          break;
        case 'melancholy':
        case 'sadness':
          root.style.setProperty('--theme-brightness', (1 - intensity * 0.2).toString());
          root.style.setProperty('--theme-saturation', (1 - intensity * 0.3).toString());
          break;
        case 'wonder':
        case 'mystery':
          root.style.setProperty('--theme-contrast', (1 + intensity * 0.1).toString());
          break;
        default:
          root.style.setProperty('--theme-brightness', '1');
          root.style.setProperty('--theme-saturation', '1');
          root.style.setProperty('--theme-contrast', '1');
      }
    }
    
    setThemeAnalysis(analysis);
    console.log('Applied detailed theme analysis:', analysis.emotion.primary, analysis.animation.style);
  }, []);

  // Generate and apply theme from poem text
  const generateAndApplyTheme = useCallback(async (poem: string) => {
    if (!poem.trim()) return;
    
    setIsLoadingTheme(true);
    setThemeError(null);
    
    try {
      const analysis = await withRetry(() => analyzeTheme(poem));
      applyThemeAnalysis(analysis);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to analyze theme';
      setThemeError(errorMessage);
      console.error('Theme analysis failed:', error);
      
      // Apply fallback theme
      applyFallbackTheme();
    } finally {
      setIsLoadingTheme(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applyThemeAnalysis]);

  // Fallback theme for errors
  const applyFallbackTheme = useCallback(() => {
    const fallbackTheme: Theme = {
      colors: {
        primary: '#6b7280',
        secondary: '#9ca3af',
        accent: '#d1d5db',
        background: '#f3f4f6',
        gradient: ['#6b7280', '#9ca3af', '#d1d5db'],
      },
      animations: {
        style: 'calm',
        duration: 2000,
        stagger: 150,
      },
      typography: {
        mood: 'modern',
        scale: 1.0,
      },
    };
    
    applyTheme(fallbackTheme);
  }, [applyTheme]);

  // Clear theme and reset to default
  const clearTheme = useCallback(() => {
    const root = document.documentElement;
    
    // Remove CSS custom properties
    const themeProperties = [
      '--theme-primary', '--theme-secondary', '--theme-accent', '--theme-background',
      '--theme-gradient', '--theme-animation-duration', '--theme-stagger-delay',
      '--theme-animation-style', '--theme-font-scale', '--theme-typography-mood',
      '--theme-brightness', '--theme-saturation', '--theme-contrast'
    ];
    
    themeProperties.forEach(prop => root.style.removeProperty(prop));
    
    // Remove data attributes
    const dataAttributes = [
      'data-theme-style', 'data-typography-mood', 'data-animation-style',
      'data-movement-type', 'data-emotion', 'data-emotion-intensity',
      'data-color-temperature', 'data-particles-enabled', 'data-particle-type'
    ];
    
    dataAttributes.forEach(attr => document.body.removeAttribute(attr));
    
    setCurrentTheme(null);
    setThemeAnalysis(null);
    setCurrentPoem(null);
    setThemeError(null);
  }, []);

  // Get current theme as CSS object
  const getThemeCSS = useCallback((): Record<string, string> => {
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const themeCSS: Record<string, string> = {};
    
    // Extract theme-related CSS properties
    const themeProps = [
      '--theme-primary', '--theme-secondary', '--theme-accent',
      '--theme-background', '--theme-gradient', '--theme-animation-duration',
      '--theme-stagger-delay', '--theme-font-scale'
    ];
    
    themeProps.forEach(prop => {
      const value = computedStyle.getPropertyValue(prop);
      if (value) {
        themeCSS[prop] = value;
      }
    });
    
    return themeCSS;
  }, []);

  // Initialize with default theme
  useEffect(() => {
    if (!currentTheme && !themeAnalysis) {
      applyFallbackTheme();
    }
  }, [currentTheme, themeAnalysis, applyFallbackTheme]);

  // Auto-generate theme when poem changes
  useEffect(() => {
    if (currentPoem?.poem) {
      generateAndApplyTheme(currentPoem.poem);
    }
  }, [currentPoem?.poem, generateAndApplyTheme]);

  const value: ThemeContextType = {
    currentTheme,
    themeAnalysis,
    currentPoem,
    isLoadingTheme,
    themeError,
    applyTheme,
    applyThemeAnalysis,
    generateAndApplyTheme,
    setCurrentPoem,
    clearTheme,
    getThemeCSS,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};