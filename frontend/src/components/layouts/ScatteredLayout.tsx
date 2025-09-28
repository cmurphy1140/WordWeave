import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface ScatteredLayoutProps {
  lines: string[];
  layoutId: string;
  className?: string;
}

const ScatteredLayout: React.FC<ScatteredLayoutProps> = ({ lines, layoutId, className = '' }) => {
  // Generate scattered positions for each line
  const scatteredPositions = useMemo(() => {
    return lines.map((_, index) => {
      const angle = (index / lines.length) * Math.PI * 2;
      const radius = 150 + (Math.random() * 100);
      const centerX = 400;
      const centerY = 300;
      
      // Add some randomness to the radius
      const randomRadius = radius + (Math.random() - 0.5) * 50;
      
      return {
        x: centerX + Math.cos(angle) * randomRadius - 150,
        y: centerY + Math.sin(angle) * randomRadius - 100,
        rotation: (Math.random() - 0.5) * 30, // Random rotation between -15 and 15 degrees
        scale: 0.8 + Math.random() * 0.4 // Random scale between 0.8 and 1.2
      };
    });
  }, [lines]);

  return (
    <motion.div
      layoutId={layoutId}
      className={`scattered-layout ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      style={{
        position: 'relative',
        width: '100%',
        height: '600px',
        overflow: 'visible'
      }}
    >
      <div className="scattered-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {lines.map((line, index) => {
          const position = scatteredPositions[index];
          
          return (
            <motion.div
              key={`scattered-line-${index}`}
              className="scattered-line"
              layoutId={`line-${index}`}
              initial={{ 
                opacity: 0, 
                x: position.x - 200,
                y: position.y - 200,
                rotate: position.rotation + 180,
                scale: 0.1
              }}
              animate={{ 
                opacity: 1, 
                x: position.x,
                y: position.y,
                rotate: position.rotation,
                scale: position.scale
              }}
              transition={{ 
                duration: 0.8, 
                delay: index * 0.05,
                ease: "easeOut",
                type: "spring",
                stiffness: 100,
                damping: 15
              }}
              style={{
                position: 'absolute',
                fontSize: '0.9rem',
                lineHeight: '1.3',
                maxWidth: '180px',
                textAlign: 'center',
                transformOrigin: 'center',
                padding: '0.5rem',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.1)'
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

export default ScatteredLayout;
