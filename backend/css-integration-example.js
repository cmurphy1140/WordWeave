/**
 * WordWeave Theme Integration Example
 * 
 * This example shows how to integrate the theme analysis results
 * into your React frontend for dynamic CSS transformations and animations.
 */

// Example theme analysis response from the Lambda function
const exampleThemeAnalysis = {
  emotion: {
    primary: "wonder",
    intensity: 0.85,
    secondary: [
      { emotion: "serenity", intensity: 0.4 },
      { emotion: "mystery", intensity: 0.6 }
    ]
  },
  colors: {
    palette: [
      { hex: "#1a202c", weight: 0.8, role: "primary" },
      { hex: "#2d3748", weight: 0.6, role: "secondary" },
      { hex: "#4a5568", weight: 0.5, role: "accent" },
      { hex: "#718096", weight: 0.3, role: "neutral" },
      { hex: "#e2e8f0", weight: 0.2, role: "highlight" }
    ],
    dominant_temperature: "cool",
    saturation_level: "medium"
  },
  animation: {
    style: "mystical",
    timing: {
      duration: 2500,
      stagger_delay: 200,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)"
    },
    movement_type: "float",
    particles: {
      enabled: true,
      type: "sparkles",
      density: 0.4,
      speed: 0.6
    }
  },
  imagery: {
    keywords: ["moonlight", "stars", "ethereal", "silver", "cosmic"],
    category: "cosmic",
    visual_density: 0.7
  },
  typography: {
    mood: "elegant",
    font_weight: 300,
    font_scale: 1.2,
    line_height: 1.8,
    letter_spacing: 0.03,
    text_shadow: 2
  },
  layout: {
    spacing_scale: 1.3,
    border_radius: 16,
    backdrop_blur: 12,
    gradient_angle: 135,
    opacity_variations: [0.9, 0.6, 0.3]
  }
};

/**
 * React Hook for Theme Integration
 */
import { useEffect, useCallback } from 'react';

export const useThemeAnalysis = () => {
  const applyThemeToCSS = useCallback((themeData) => {
    const root = document.documentElement;
    
    // Apply color palette
    if (themeData.colors?.palette) {
      themeData.colors.palette.forEach((color, index) => {
        root.style.setProperty(`--theme-color-${index + 1}`, color.hex);
        root.style.setProperty(`--theme-${color.role}`, color.hex);
        root.style.setProperty(`--theme-${color.role}-weight`, color.weight.toString());
      });
      
      // Create gradient from palette
      const gradientColors = themeData.colors.palette
        .sort((a, b) => b.weight - a.weight)
        .slice(0, 3)
        .map(c => c.hex);
      
      const gradientAngle = themeData.layout?.gradient_angle || 135;
      const gradient = `linear-gradient(${gradientAngle}deg, ${gradientColors.join(', ')})`;
      root.style.setProperty('--theme-gradient', gradient);
    }
    
    // Apply typography settings
    if (themeData.typography) {
      const typo = themeData.typography;
      root.style.setProperty('--theme-font-weight', typo.font_weight.toString());
      root.style.setProperty('--theme-font-scale', typo.font_scale.toString());
      root.style.setProperty('--theme-line-height', typo.line_height.toString());
      root.style.setProperty('--theme-letter-spacing', `${typo.letter_spacing}em`);
      
      if (typo.text_shadow > 0) {
        root.style.setProperty('--theme-text-shadow', 
          `0 ${typo.text_shadow}px ${typo.text_shadow * 2}px rgba(0,0,0,0.3)`);
      }
    }
    
    // Apply layout parameters
    if (themeData.layout) {
      const layout = themeData.layout;
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
    
    // Apply animation parameters
    if (themeData.animation) {
      const anim = themeData.animation;
      root.style.setProperty('--theme-animation-duration', `${anim.timing.duration}ms`);
      root.style.setProperty('--theme-stagger-delay', `${anim.timing.stagger_delay}ms`);
      root.style.setProperty('--theme-animation-easing', anim.timing.easing);
      root.style.setProperty('--theme-animation-style', anim.style);
      
      // Set data attribute for CSS selectors
      document.body.setAttribute('data-animation-style', anim.style);
      document.body.setAttribute('data-movement-type', anim.movement_type);
    }
    
    // Apply emotion-based modifiers
    if (themeData.emotion) {
      document.body.setAttribute('data-emotion', themeData.emotion.primary);
      document.body.setAttribute('data-emotion-intensity', 
        Math.round(themeData.emotion.intensity * 10).toString());
    }
    
  }, []);
  
  return { applyThemeToCSS };
};

/**
 * CSS Custom Properties Integration
 * Add this to your main CSS file
 */
const cssTemplate = `
:root {
  /* Default values - will be overridden by theme analysis */
  --theme-primary: #4a5568;
  --theme-secondary: #718096;
  --theme-accent: #a0aec0;
  --theme-neutral: #cbd5e0;
  --theme-highlight: #e2e8f0;
  
  --theme-gradient: linear-gradient(135deg, var(--theme-primary), var(--theme-secondary));
  
  --theme-font-weight: 400;
  --theme-font-scale: 1.0;
  --theme-line-height: 1.6;
  --theme-letter-spacing: 0em;
  --theme-text-shadow: none;
  
  --theme-spacing-scale: 1.0;
  --theme-border-radius: 8px;
  --theme-backdrop-blur: 4px;
  
  --theme-animation-duration: 2000ms;
  --theme-stagger-delay: 150ms;
  --theme-animation-easing: ease-out;
  
  --theme-opacity-1: 0.9;
  --theme-opacity-2: 0.6;
  --theme-opacity-3: 0.3;
}

/* Emotion-based styling */
body[data-emotion="joy"] {
  --theme-brightness: 1.2;
  --theme-saturation: 1.1;
}

body[data-emotion="melancholy"] {
  --theme-brightness: 0.8;
  --theme-saturation: 0.7;
}

body[data-emotion="wonder"] {
  --theme-brightness: 1.0;
  --theme-saturation: 1.0;
  filter: brightness(var(--theme-brightness, 1.0)) saturate(var(--theme-saturation, 1.0));
}

/* Animation style variations */
body[data-animation-style="mystical"] .poem-line {
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

body[data-animation-style="energetic"] .poem-line {
  animation-timing-function: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

body[data-animation-style="dramatic"] .poem-line {
  animation-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

body[data-animation-style="calm"] .poem-line {
  animation-timing-function: cubic-bezier(0.25, 0.25, 0, 1);
}

/* Movement type animations */
body[data-movement-type="float"] .poem-line {
  animation: float var(--theme-animation-duration) var(--theme-animation-easing) infinite alternate;
}

body[data-movement-type="fade"] .poem-line {
  animation: fadeInUp var(--theme-animation-duration) var(--theme-animation-easing) forwards;
}

body[data-movement-type="wave"] .poem-line {
  animation: wave var(--theme-animation-duration) var(--theme-animation-easing) infinite;
}

/* Responsive typography scaling */
.poem-text {
  font-weight: var(--theme-font-weight);
  font-size: calc(1rem * var(--theme-font-scale));
  line-height: var(--theme-line-height);
  letter-spacing: var(--theme-letter-spacing);
  text-shadow: var(--theme-text-shadow, none);
}

/* Dynamic backgrounds */
.poem-container {
  background: var(--theme-gradient);
  border-radius: var(--theme-border-radius);
  backdrop-filter: blur(var(--theme-backdrop-blur));
}

/* Staggered animations for poem lines */
.poem-line:nth-child(1) { animation-delay: calc(0 * var(--theme-stagger-delay)); }
.poem-line:nth-child(2) { animation-delay: calc(1 * var(--theme-stagger-delay)); }
.poem-line:nth-child(3) { animation-delay: calc(2 * var(--theme-stagger-delay)); }
/* ... continue for more lines */

/* Keyframe animations */
@keyframes float {
  0% { transform: translateY(0px); }
  100% { transform: translateY(-10px); }
}

@keyframes fadeInUp {
  0% { 
    opacity: 0; 
    transform: translateY(30px); 
  }
  100% { 
    opacity: 1; 
    transform: translateY(0); 
  }
}

@keyframes wave {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-5px) rotate(1deg); }
  75% { transform: translateY(5px) rotate(-1deg); }
}
`;

/**
 * React Component Example
 */
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const PoemDisplay = ({ poem, onThemeChange }) => {
  const [themeData, setThemeData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { applyThemeToCSS } = useThemeAnalysis();
  
  useEffect(() => {
    if (poem) {
      analyzeTheme(poem);
    }
  }, [poem]);
  
  const analyzeTheme = async (poemText) => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetch('YOUR_THEME_ANALYZER_ENDPOINT/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ poem: poemText })
      });
      
      const result = await response.json();
      
      if (result.success) {
        setThemeData(result.data);
        applyThemeToCSS(result.data);
        onThemeChange?.(result.data);
      }
    } catch (error) {
      console.error('Theme analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  if (!poem) return null;
  
  const poemLines = poem.split('\n').filter(line => line.trim());
  
  return (
    <div className="poem-container">
      {isAnalyzing && (
        <div className="analysis-indicator">
          Analyzing theme...
        </div>
      )}
      
      <div className="poem-text">
        {poemLines.map((line, index) => (
          <motion.div
            key={index}
            className="poem-line"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: (themeData?.animation.timing.duration || 2000) / 1000,
              delay: index * (themeData?.animation.timing.stagger_delay || 150) / 1000,
              ease: "easeOut"
            }}
          >
            {line}
          </motion.div>
        ))}
      </div>
      
      {themeData?.animation.particles.enabled && (
        <ParticleEffect 
          type={themeData.animation.particles.type}
          density={themeData.animation.particles.density}
          speed={themeData.animation.particles.speed}
        />
      )}
    </div>
  );
};

export default PoemDisplay;
`;

/**
 * Particle Effects Component Example
 */
const ParticleEffect = ({ type, density, speed }) => {
  const particleCount = Math.floor(50 * density);
  
  const getParticleChar = (type) => {
    const particles = {
      sparkles: '✨',
      stars: '⭐',
      leaves: '🍃',
      snow: '❄️',
      bubbles: '⚪',
      fireflies: '💫'
    };
    return particles[type] || '✨';
  };
  
  return (
    <div className="particle-container">
      {Array.from({ length: particleCount }, (_, i) => (
        <motion.span
          key={i}
          className="particle"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 20,
            opacity: 0
          }}
          animate={{
            y: -20,
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 3 / speed,
            delay: Math.random() * 2,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {getParticleChar(type)}
        </motion.span>
      ))}
    </div>
  );
};
`;

console.log("WordWeave Theme Integration Example");
console.log("Copy the CSS and React components above to integrate theme analysis into your frontend.");
