import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';

interface GlowingTextProps {
  text: string;
  emotionIntensity?: number;
  glowColor?: string;
  pulseSpeed?: number;
  className?: string;
  isPaused?: boolean;
  maxGlowRadius?: number;
  enableParticles?: boolean;
}

const GlowingText: React.FC<GlowingTextProps> = memo(({
  text,
  emotionIntensity,
  glowColor,
  pulseSpeed,
  className = '',
  isPaused = false,
  maxGlowRadius = 20,
  enableParticles = false
}) => {
  const { themeAnalysis } = useTheme();

  // Get emotion intensity from theme analysis or prop
  const intensity = emotionIntensity ?? themeAnalysis?.emotion?.intensity ?? 0.5;
  
  // Get effective glow color
  const effectiveGlowColor = glowColor || 
    themeAnalysis?.colors?.palette?.[0]?.hex || 
    'var(--theme-primary)';

  // Calculate glow properties based on intensity
  const glowRadius = Math.min(maxGlowRadius, intensity * maxGlowRadius);
  const glowOpacity = Math.max(0.3, Math.min(1, intensity));
  const effectivePulseSpeed = pulseSpeed || Math.max(0.8, 3 - (intensity * 2));

  // Create glow animation variants
  const glowVariants = useMemo(() => ({
    idle: {
      textShadow: `
        0 0 ${glowRadius * 0.5}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.8 * 255).toString(16)},
        0 0 ${glowRadius}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.6 * 255).toString(16)},
        0 0 ${glowRadius * 1.5}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.4 * 255).toString(16)}
      `,
      filter: `brightness(${1 + intensity * 0.3}) saturate(${1 + intensity * 0.5})`,
    },
    pulse: {
      textShadow: [
        `0 0 ${glowRadius * 0.3}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.6 * 255).toString(16)},
         0 0 ${glowRadius * 0.8}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.4 * 255).toString(16)},
         0 0 ${glowRadius * 1.2}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.2 * 255).toString(16)}`,
        `0 0 ${glowRadius * 0.8}px ${effectiveGlowColor}${Math.round(glowOpacity * 255).toString(16)},
         0 0 ${glowRadius * 1.5}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.8 * 255).toString(16)},
         0 0 ${glowRadius * 2}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.6 * 255).toString(16)}`,
        `0 0 ${glowRadius * 0.3}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.6 * 255).toString(16)},
         0 0 ${glowRadius * 0.8}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.4 * 255).toString(16)},
         0 0 ${glowRadius * 1.2}px ${effectiveGlowColor}${Math.round(glowOpacity * 0.2 * 255).toString(16)}`
      ],
      filter: [
        `brightness(${1 + intensity * 0.2}) saturate(${1 + intensity * 0.3})`,
        `brightness(${1 + intensity * 0.5}) saturate(${1 + intensity * 0.8})`,
        `brightness(${1 + intensity * 0.2}) saturate(${1 + intensity * 0.3})`
      ],
      transition: {
        duration: effectivePulseSpeed,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }), [glowRadius, effectiveGlowColor, glowOpacity, intensity, effectivePulseSpeed]);

  // Note: words splitting available for future character-level effects
  // const words = useMemo(() => text.split(' '), [text]);

  return (
    <div className={`glowing-text ${className}`}>
      <motion.div
        className="glow-container"
        variants={glowVariants}
        initial="idle"
        animate={isPaused ? "idle" : "pulse"}
          style={{
            position: 'relative',
            display: 'inline-block',
            willChange: 'filter, text-shadow',
            color: effectiveGlowColor,
            WebkitTextFillColor: 'transparent',
            WebkitTextStroke: `1px ${effectiveGlowColor}`,
            fontWeight: 'bold'
          } as React.CSSProperties}
      >
        {/* Main text */}
        <span 
          className="main-text"
          style={{
            WebkitTextFillColor: effectiveGlowColor,
            WebkitTextStroke: 'none'
          }}
        >
          {text}
        </span>

        {/* Overlay for extra glow effect */}
        <motion.span
          className="glow-overlay"
          animate={{
            opacity: isPaused ? 0 : [0.5, 1, 0.5]
          }}
          transition={{
            duration: effectivePulseSpeed * 0.7,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            color: effectiveGlowColor,
            filter: `blur(${glowRadius * 0.1}px)`,
            mixBlendMode: 'screen',
            pointerEvents: 'none',
            willChange: 'opacity'
          }}
        >
          {text}
        </motion.span>

        {/* Floating particles effect */}
        {enableParticles && intensity > 0.7 && (
          <div className="glow-particles">
            {Array.from({ length: Math.floor(intensity * 8) }, (_, i) => (
              <motion.div
                key={i}
                className="glow-particle"
                initial={{
                  opacity: 0,
                  scale: 0,
                  x: Math.random() * 100 - 50,
                  y: Math.random() * 50 - 25
                }}
                animate={{
                  opacity: [0, 0.8, 0],
                  scale: [0, 1, 0],
                  x: Math.random() * 200 - 100,
                  y: Math.random() * 100 - 50
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut"
                }}
                style={{
                  position: 'absolute',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: effectiveGlowColor,
                  filter: `blur(1px)`,
                  pointerEvents: 'none',
                  willChange: 'transform, opacity'
                }}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Intensity indicator */}
      <motion.div
        className="intensity-bar"
        initial={{ width: 0 }}
        animate={{ width: `${intensity * 100}%` }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          height: '2px',
          backgroundColor: effectiveGlowColor,
          marginTop: '8px',
          borderRadius: '1px',
          filter: `drop-shadow(0 0 4px ${effectiveGlowColor})`,
          opacity: 0.7
        }}
      />
    </div>
  );
});

GlowingText.displayName = 'GlowingText';

export default GlowingText;
