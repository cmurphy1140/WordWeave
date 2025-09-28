import React, { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ParticleEffectsProps {
  type: string;
  density: number;
  speed: number;
}

interface Particle {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
  duration: number;
  character: string;
}

const ParticleEffects: React.FC<ParticleEffectsProps> = ({ type, density, speed }) => {
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  // Update window size
  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  // Particle configuration based on type
  const getParticleConfig = (particleType: string) => {
    const configs = {
      sparkles: {
        characters: ['✦', '✧', '✩', '✪'],
        baseSize: { min: 8, max: 16 },
        baseDuration: { min: 3, max: 6 },
        movement: 'float'
      },
      stars: {
        characters: ['⭐', '🌟', '✦', '✧', '★'],
        baseSize: { min: 6, max: 14 },
        baseDuration: { min: 4, max: 8 },
        movement: 'twinkle'
      },
      leaves: {
        characters: ['🍃', '🍂', '🌿', '🍀'],
        baseSize: { min: 10, max: 18 },
        baseDuration: { min: 5, max: 10 },
        movement: 'fall'
      },
      snow: {
        characters: ['❄️', '❅', '❆', '⋄'],
        baseSize: { min: 8, max: 16 },
        baseDuration: { min: 6, max: 12 },
        movement: 'snow'
      },
      bubbles: {
        characters: ['⚪', '○', '◯', '●'],
        baseSize: { min: 6, max: 20 },
        baseDuration: { min: 4, max: 8 },
        movement: 'rise'
      },
      light_rays: {
        characters: ['☀', '◐', '◑', '◒'],
        baseSize: { min: 12, max: 24 },
        baseDuration: { min: 3, max: 6 },
        movement: 'glow'
      },
      dust: {
        characters: ['·', '•', '∘', '◦'],
        baseSize: { min: 4, max: 8 },
        baseDuration: { min: 8, max: 15 },
        movement: 'drift'
      },
      fireflies: {
        characters: ['✫', '✬', '✭', '✮'],
        baseSize: { min: 6, max: 12 },
        baseDuration: { min: 4, max: 8 },
        movement: 'dance'
      }
    };

    return configs[particleType as keyof typeof configs] || configs.sparkles;
  };

  // Generate particles based on density
  const particles = useMemo(() => {
    if (windowSize.width === 0) return [];
    
    const config = getParticleConfig(type);
    const particleCount = Math.floor(density * 50); // Max 50 particles
    const generatedParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const character = config.characters[Math.floor(Math.random() * config.characters.length)];
      const size = config.baseSize.min + Math.random() * (config.baseSize.max - config.baseSize.min);
      const duration = (config.baseDuration.min + Math.random() * (config.baseDuration.max - config.baseDuration.min)) / speed;
      
      generatedParticles.push({
        id: `particle-${i}`,
        x: Math.random() * windowSize.width,
        y: Math.random() * windowSize.height,
        size,
        delay: Math.random() * 2,
        duration,
        character
      });
    }

    return generatedParticles;
  }, [type, density, speed, windowSize]);

  // Get animation properties based on movement type
  const getMovementAnimation = (movementType: string, particle: Particle) => {
    const animations = {
      float: {
        y: [particle.y, particle.y - 20, particle.y + 10, particle.y],
        x: [particle.x, particle.x + Math.sin(particle.id.length) * 30],
        scale: [1, 1.2, 0.8, 1],
        opacity: [0.3, 1, 0.7, 0.3]
      },
      twinkle: {
        scale: [0, 1, 1.5, 1, 0],
        opacity: [0, 1, 1, 1, 0],
        rotate: [0, 180, 360]
      },
      fall: {
        y: [particle.y - 100, windowSize.height + 100],
        x: [particle.x, particle.x + Math.sin(particle.y / 100) * 50],
        rotate: [0, 360],
        opacity: [0, 1, 1, 0]
      },
      snow: {
        y: [particle.y - 50, windowSize.height + 50],
        x: [
          particle.x, 
          particle.x + Math.sin(particle.y / 50) * 30,
          particle.x - Math.sin(particle.y / 50) * 30,
          particle.x
        ],
        opacity: [0, 1, 1, 0]
      },
      rise: {
        y: [particle.y + 100, particle.y - 200],
        x: [particle.x, particle.x + Math.random() * 40 - 20],
        scale: [0.5, 1, 1.2, 0],
        opacity: [0, 0.8, 0.8, 0]
      },
      glow: {
        scale: [0.8, 1.5, 1.2, 0.8],
        opacity: [0.3, 1, 0.8, 0.3],
        filter: [
          'brightness(1) blur(0px)',
          'brightness(1.5) blur(2px)',
          'brightness(1.2) blur(1px)',
          'brightness(1) blur(0px)'
        ]
      },
      drift: {
        y: [particle.y, particle.y + Math.random() * 100 - 50],
        x: [particle.x, particle.x + Math.random() * 200 - 100],
        opacity: [0, 0.6, 0.4, 0]
      },
      dance: {
        x: [
          particle.x,
          particle.x + 30,
          particle.x - 20,
          particle.x + 40,
          particle.x
        ],
        y: [
          particle.y,
          particle.y - 30,
          particle.y + 20,
          particle.y - 40,
          particle.y
        ],
        scale: [0.8, 1.2, 1, 1.5, 0.8],
        opacity: [0.5, 1, 0.8, 1, 0.5]
      }
    };

    return animations[movementType as keyof typeof animations] || animations.float;
  };

  const config = getParticleConfig(type);

  return (
    <div className="particle-effects">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className={`particle particle-${type}`}
            style={{
              position: 'fixed',
              left: particle.x,
              top: particle.y,
              fontSize: particle.size,
              pointerEvents: 'none',
              zIndex: 1,
              userSelect: 'none'
            }}
            initial={{
              opacity: 0,
              scale: 0
            }}
            animate={getMovementAnimation(config.movement, particle)}
            exit={{
              opacity: 0,
              scale: 0
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              repeatType: 'loop',
              ease: config.movement === 'twinkle' ? 'easeInOut' : 'linear'
            }}
          >
            {particle.character}
          </motion.div>
        ))}
      </AnimatePresence>
      
      {/* Background patterns for certain particle types */}
      {type === 'light_rays' && (
        <motion.div
          className="light-rays-background"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            background: [
              'radial-gradient(circle at 20% 20%, rgba(255,255,0,0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 30%, rgba(255,255,0,0.2) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 70%, rgba(255,255,0,0.1) 0%, transparent 50%)'
            ]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
      
      {type === 'dust' && (
        <motion.div
          className="dust-background"
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'radial-gradient(ellipse at center, rgba(139,69,19,0.1) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />
      )}
    </div>
  );
};

export default ParticleEffects;

