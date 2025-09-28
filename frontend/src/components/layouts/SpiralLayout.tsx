import React from 'react';
import { motion } from 'framer-motion';

interface SpiralLayoutProps {
  lines: string[];
  layoutId: string;
  className?: string;
}

const SpiralLayout: React.FC<SpiralLayoutProps> = ({ lines, layoutId, className = '' }) => {
  const centerX = 400;
  const centerY = 300;
  const baseRadius = 80;
  const radiusIncrement = 60;
  const angleIncrement = Math.PI / 4; // 45 degrees

  const getSpiralPosition = (index: number) => {
    const radius = baseRadius + (index * radiusIncrement);
    const angle = index * angleIncrement;
    
    return {
      x: centerX + Math.cos(angle) * radius - 200, // Offset to center in container
      y: centerY + Math.sin(angle) * radius - 150,
      rotation: (angle * 180) / Math.PI
    };
  };

  return (
    <motion.div
      layoutId={layoutId}
      className={`spiral-layout ${className}`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.5, rotate: 180 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        overflow: 'visible'
      }}
    >
      <div className="spiral-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {lines.map((line, index) => {
          const position = getSpiralPosition(index);
          
          return (
            <motion.div
              key={`spiral-line-${index}`}
              className="spiral-line"
              layoutId={`line-${index}`}
              initial={{ 
                opacity: 0, 
                x: position.x - 100,
                y: position.y - 100,
                rotate: position.rotation - 45
              }}
              animate={{ 
                opacity: 1, 
                x: position.x,
                y: position.y,
                rotate: position.rotation
              }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
              style={{
                position: 'absolute',
                fontSize: '1rem',
                lineHeight: '1.4',
                maxWidth: '200px',
                textAlign: 'center',
                transformOrigin: 'center'
              }}
            >
              {line}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default SpiralLayout;
