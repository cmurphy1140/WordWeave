import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { LayoutStyle } from '../../types';
import CenteredLayout from './CenteredLayout';
import BookLayout from './BookLayout';
import SpiralLayout from './SpiralLayout';
import ScatteredLayout from './ScatteredLayout';

interface LayoutManagerProps {
  lines: string[];
  className?: string;
  autoSwitchInterval?: number;
  onLayoutChange?: (layout: LayoutStyle) => void;
}

const LayoutManager: React.FC<LayoutManagerProps> = ({ 
  lines, 
  className = '',
  autoSwitchInterval = 0, // Disabled auto-switching by default
  onLayoutChange
}) => {
  const [currentLayout, setCurrentLayout] = useState<LayoutStyle>('centered');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const layouts: LayoutStyle[] = useMemo(() => ['centered', 'book', 'spiral', 'scattered'], []);

  // Auto-switch layouts
  useEffect(() => {
    if (autoSwitchInterval > 0) {
      const interval = setInterval(() => {
        if (!isTransitioning && lines.length > 0) {
          setCurrentLayout(prev => {
            const currentIndex = layouts.indexOf(prev);
            const nextIndex = (currentIndex + 1) % layouts.length;
            return layouts[nextIndex];
          });
        }
      }, autoSwitchInterval);

      return () => clearInterval(interval);
    }
  }, [autoSwitchInterval, isTransitioning, lines.length, layouts]);

  // Handle manual layout switching
  const switchLayout = useCallback((newLayout: LayoutStyle) => {
    if (newLayout !== currentLayout && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentLayout(newLayout);
      onLayoutChange?.(newLayout);
      
      // Reset transition state after animation
      setTimeout(() => setIsTransitioning(false), 300); // Reduced from 600
    }
  }, [currentLayout, isTransitioning, onLayoutChange]);

  // Handle swipe gestures
  const handlePanEnd = useCallback((event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (Math.abs(info.offset.x) > threshold) {
      const currentIndex = layouts.indexOf(currentLayout);
      let nextIndex: number;
      
      if (info.offset.x > 0) {
        // Swipe right - previous layout
        nextIndex = currentIndex === 0 ? layouts.length - 1 : currentIndex - 1;
      } else {
        // Swipe left - next layout
        nextIndex = (currentIndex + 1) % layouts.length;
      }
      
      switchLayout(layouts[nextIndex]);
    }
  }, [currentLayout, layouts, switchLayout]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        const currentIndex = layouts.indexOf(currentLayout);
        const prevIndex = currentIndex === 0 ? layouts.length - 1 : currentIndex - 1;
        switchLayout(layouts[prevIndex]);
      } else if (event.key === 'ArrowRight') {
        const currentIndex = layouts.indexOf(currentLayout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        switchLayout(layouts[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentLayout, layouts, switchLayout]);

  // Render the appropriate layout component
  const renderLayout = () => {
    const layoutProps = {
      lines,
      layoutId: 'poem-layout',
      className
    };

    switch (currentLayout) {
      case 'centered':
        return <CenteredLayout {...layoutProps} />;
      case 'book':
        return <BookLayout {...layoutProps} />;
      case 'spiral':
        return <SpiralLayout {...layoutProps} />;
      case 'scattered':
        return <ScatteredLayout {...layoutProps} />;
      default:
        return <CenteredLayout {...layoutProps} />;
    }
  };

  if (lines.length === 0) {
    return null;
  }

  return (
    <div className={`layout-manager ${className}`}>
      {/* Layout Controls */}
      <div className="layout-controls">
        {layouts.map((layout) => (
          <motion.button
            key={layout}
            className={`layout-button ${currentLayout === layout ? 'active' : ''}`}
            onClick={() => switchLayout(layout)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            disabled={isTransitioning}
          >
            {layout.charAt(0).toUpperCase() + layout.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Layout Container with Gesture Support */}
      <motion.div
        className="layout-container"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onPanEnd={handlePanEnd}
        style={{ 
          width: '100%', 
          height: '100%',
          cursor: 'grab'
        }}
        whileDrag={{ cursor: 'grabbing' }}
      >
        <AnimatePresence mode="wait">
          {renderLayout()}
        </AnimatePresence>
      </motion.div>

      {/* Layout Indicator */}
      <div className="layout-indicator">
        <div className="indicator-dots">
          {layouts.map((layout, index) => (
            <motion.div
              key={layout}
              className={`indicator-dot ${currentLayout === layout ? 'active' : ''}`}
              animate={{
                scale: currentLayout === layout ? 1.2 : 1,
                opacity: currentLayout === layout ? 1 : 0.5
              }}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LayoutManager;
