import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { 
  getAccessibleAnimation,
  easingCurves,
  durations,
  hoverAnimations
} from '../utils/easing';

// Enhanced AnimatePresence with smooth transitions
interface SmoothAnimatePresenceProps {
  children: React.ReactNode;
  mode?: 'wait' | 'sync' | 'popLayout';
  initial?: boolean;
  onExitComplete?: () => void;
  className?: string;
}

export const SmoothAnimatePresence: React.FC<SmoothAnimatePresenceProps> = ({
  children,
  mode = 'wait',
  initial = false,
  onExitComplete,
  className = '',
}) => {
  return (
    <div className={className}>
      <AnimatePresence
        mode={mode}
        initial={initial}
        onExitComplete={onExitComplete}
      >
        {children}
      </AnimatePresence>
    </div>
  );
};

// Smooth fade transition component
interface SmoothFadeProps {
  children: React.ReactNode;
  isVisible: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

export const SmoothFade: React.FC<SmoothFadeProps> = ({
  children,
  isVisible,
  delay = 0,
  duration = durations.normal,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  const animation = getAccessibleAnimation(
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: {
        duration,
        delay,
        ease: easingCurves.smooth.gentle,
      },
    },
    prefersReducedMotion ?? false
  );

  return (
    <SmoothAnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          {...animation}
        >
          {children}
        </motion.div>
      )}
    </SmoothAnimatePresence>
  );
};

// Smooth slide transition component
interface SmoothSlideProps {
  children: React.ReactNode;
  isVisible: boolean;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
  delay?: number;
  duration?: number;
  className?: string;
}

export const SmoothSlide: React.FC<SmoothSlideProps> = ({
  children,
  isVisible,
  direction = 'up',
  distance = 20,
  delay = 0,
  duration = durations.normal,
  className = '',
}) => {
  const prefersReducedMotion = useReducedMotion();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className={className}>{children}</div>;
  }

  const getDirectionValues = () => {
    switch (direction) {
      case 'up':
        return { y: distance };
      case 'down':
        return { y: -distance };
      case 'left':
        return { x: distance };
      case 'right':
        return { x: -distance };
      default:
        return { y: distance };
    }
  };

  const animation = getAccessibleAnimation(
    {
      initial: { opacity: 0, ...getDirectionValues() },
      animate: { opacity: 1, x: 0, y: 0 },
      exit: { opacity: 0, ...getDirectionValues() },
      transition: {
        duration,
        delay,
        ease: easingCurves.smooth.gentle,
      },
    },
    prefersReducedMotion ?? false
  );

  return (
    <SmoothAnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          {...animation}
        >
          {children}
        </motion.div>
      )}
    </SmoothAnimatePresence>
  );
};

// Smooth stagger container for lists
interface SmoothStaggerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}

export const SmoothStagger: React.FC<SmoothStaggerProps> = ({
  children,
  className = '',
  staggerDelay = 0.1,
  delay = 0,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const animation = getAccessibleAnimation(
    {
      initial: { opacity: 0 },
      animate: {
        opacity: 1,
        transition: {
          staggerChildren: staggerDelay,
          delayChildren: delay,
        },
      },
      exit: {
        opacity: 0,
        transition: {
          staggerChildren: staggerDelay,
          staggerDirection: -1,
        },
      },
    },
    prefersReducedMotion ?? false
  );

  return (
    <motion.div
      className={className}
      {...animation}
    >
      {children}
    </motion.div>
  );
};

// Smooth stagger item for individual elements
interface SmoothStaggerItemProps {
  children: React.ReactNode;
  className?: string;
  duration?: number;
}

export const SmoothStaggerItem: React.FC<SmoothStaggerItemProps> = ({
  children,
  className = '',
  duration = durations.normal,
}) => {
  const prefersReducedMotion = useReducedMotion();

  const animation = getAccessibleAnimation(
    {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -20 },
      transition: {
        duration,
        ease: easingCurves.smooth.gentle,
      },
    },
    prefersReducedMotion ?? false
  );

  return (
    <motion.div
      className={className}
      {...animation}
    >
      {children}
    </motion.div>
  );
};

// Smooth hover component with enhanced interactions
interface SmoothHoverProps {
  children: React.ReactNode;
  hoverType?: 'gentle' | 'smooth' | 'poetic';
  className?: string;
  onClick?: () => void;
}

export const SmoothHover: React.FC<SmoothHoverProps> = ({
  children,
  hoverType = 'gentle',
  className = '',
  onClick,
}) => {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div className={className} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={className}
      onClick={onClick}
      {...hoverAnimations[hoverType]}
    >
      {children}
    </motion.div>
  );
};
