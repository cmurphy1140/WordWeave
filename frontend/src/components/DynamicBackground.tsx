import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AnimationManager } from '../animations/AnimationManager';
import { AnimationTheme, AnimationThemeConfig, PerformanceMetrics } from '../types/AnimationTypes';

interface DynamicBackgroundProps {
  text?: string;
  theme?: AnimationTheme;
  mood?: 'joyful' | 'melancholic' | 'mystical' | 'modern' | 'romantic' | 'energetic';
  intensity?: 'low' | 'medium' | 'high';
  autoDetect?: boolean;
  showControls?: boolean;
  className?: string;
}

export const DynamicBackground: React.FC<DynamicBackgroundProps> = ({
  text = '',
  theme,
  mood = 'joyful',
  intensity = 'medium',
  autoDetect = true,
  showControls = false,
  className = ''
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationManagerRef = useRef<AnimationManager | null>(null);
  const [currentTheme, setCurrentTheme] = useState<AnimationThemeConfig>({
    theme: theme || 'bubbles',
    mood,
    intensity
  });
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize animation manager
  useEffect(() => {
    if (!canvasRef.current) return;

    try {
      animationManagerRef.current = new AnimationManager(canvasRef.current);
      
      // Auto-detect theme from text if enabled
      if (autoDetect && text) {
        const detectedTheme = AnimationManager.detectThemeFromText(text);
        setCurrentTheme(detectedTheme);
        animationManagerRef.current.setTheme(detectedTheme.theme, detectedTheme.mood, detectedTheme.intensity);
      } else if (theme) {
        animationManagerRef.current.setTheme(theme, mood, intensity);
      }

      setIsAnimating(true);
    } catch (error) {
      console.error('Failed to initialize animation manager:', error);
    }

    return () => {
      if (animationManagerRef.current) {
        animationManagerRef.current.destroy();
      }
    };
  }, [autoDetect, text, theme, mood, intensity]);

  // Update theme when props change
  useEffect(() => {
    if (!animationManagerRef.current) return;

    if (autoDetect && text) {
      const detectedTheme = AnimationManager.detectThemeFromText(text);
      setCurrentTheme(detectedTheme);
      animationManagerRef.current.setTheme(detectedTheme.theme, detectedTheme.mood, detectedTheme.intensity);
    } else if (theme) {
      const newTheme = { theme, mood, intensity };
      setCurrentTheme(newTheme);
      animationManagerRef.current.setTheme(theme, mood, intensity);
    }
  }, [text, theme, mood, intensity, autoDetect]);

  // Performance monitoring
  useEffect(() => {
    if (!animationManagerRef.current) return;

    const interval = setInterval(() => {
      const metrics = animationManagerRef.current?.getPerformanceMetrics();
      if (metrics) {
        setPerformanceMetrics(metrics);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleThemeChange = useCallback((newTheme: AnimationTheme) => {
    if (animationManagerRef.current) {
      animationManagerRef.current.setTheme(newTheme, currentTheme.mood, currentTheme.intensity);
      setCurrentTheme(prev => ({ ...prev, theme: newTheme }));
    }
  }, [currentTheme.mood, currentTheme.intensity]);

  const handleMoodChange = useCallback((newMood: string) => {
    if (animationManagerRef.current) {
      animationManagerRef.current.setTheme(currentTheme.theme, newMood as any, currentTheme.intensity);
      setCurrentTheme(prev => ({ ...prev, mood: newMood as any }));
    }
  }, [currentTheme.theme, currentTheme.intensity]);

  const handleIntensityChange = useCallback((newIntensity: string) => {
    if (animationManagerRef.current) {
      animationManagerRef.current.setTheme(currentTheme.theme, currentTheme.mood, newIntensity as any);
      setCurrentTheme(prev => ({ ...prev, intensity: newIntensity as any }));
    }
  }, [currentTheme.theme, currentTheme.mood]);

  const toggleAnimation = useCallback(() => {
    if (!animationManagerRef.current) return;

    if (isAnimating) {
      animationManagerRef.current.stop();
      setIsAnimating(false);
    } else {
      animationManagerRef.current.start();
      setIsAnimating(true);
    }
  }, [isAnimating]);

  return (
    <div className={`dynamic-background ${className}`}>
      <canvas
        ref={canvasRef}
        className="background-canvas"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          pointerEvents: 'none'
        }}
      />
      
      {showControls && (
        <div className="animation-controls" style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          fontSize: '12px',
          zIndex: 1000,
          minWidth: '200px'
        }}>
          <h4 style={{ margin: '0 0 10px 0', fontSize: '14px' }}>Animation Controls</h4>
          
          <div style={{ marginBottom: '10px' }}>
            <label>Theme:</label>
            <select 
              value={currentTheme.theme} 
              onChange={(e) => handleThemeChange(e.target.value as AnimationTheme)}
              style={{ marginLeft: '5px', padding: '2px' }}
            >
              <option value="bubbles">Bubbles</option>
              <option value="snow">Snow</option>
              <option value="rain">Rain</option>
              <option value="galaxy">Galaxy</option>
              <option value="geometric">Geometric</option>
              <option value="fireflies">Fireflies</option>
              <option value="waves">Waves</option>
              <option value="stars">Stars</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Mood:</label>
            <select 
              value={currentTheme.mood} 
              onChange={(e) => handleMoodChange(e.target.value)}
              style={{ marginLeft: '5px', padding: '2px' }}
            >
              <option value="joyful">Joyful</option>
              <option value="melancholic">Melancholic</option>
              <option value="mystical">Mystical</option>
              <option value="modern">Modern</option>
              <option value="romantic">Romantic</option>
              <option value="energetic">Energetic</option>
            </select>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label>Intensity:</label>
            <select 
              value={currentTheme.intensity} 
              onChange={(e) => handleIntensityChange(e.target.value)}
              style={{ marginLeft: '5px', padding: '2px' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <button 
            onClick={toggleAnimation}
            style={{
              background: isAnimating ? '#ff4444' : '#44ff44',
              color: 'white',
              border: 'none',
              padding: '5px 10px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {isAnimating ? 'Stop' : 'Start'}
          </button>

          {performanceMetrics && (
            <div style={{ fontSize: '10px', opacity: 0.7 }}>
              <div>FPS: {performanceMetrics.fps}</div>
              <div>Particles: {performanceMetrics.particleCount}</div>
              <div>Performance: {performanceMetrics.isLowPerformance ? 'Low' : 'Good'}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicBackground;
