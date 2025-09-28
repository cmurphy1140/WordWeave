import React from 'react';
import { motion } from 'framer-motion';
import { LoadingState } from '../types';

interface ProgressBarProps {
  loading: LoadingState;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ loading, className = '' }) => {
  if (!loading.isLoading) return null;

  return (
    <motion.div
      className={`progress-bar-container ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="progress-bar-wrapper">
        {/* Progress Bar */}
        <div className="progress-bar">
          <motion.div
            className="progress-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${(loading.progress || 0) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        {/* Loading Text */}
        <motion.div
          className="progress-text"
          key={loading.loadingText}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {loading.loadingText || 'Generating poem...'}
        </motion.div>
        
        {/* Progress Percentage */}
        <div className="progress-percentage">
          {Math.round((loading.progress || 0) * 100)}%
        </div>
      </div>
      
      {/* Animated Dots */}
      <div className="progress-dots">
        {[0, 1, 2].map((index) => (
          <motion.div
            key={index}
            className="progress-dot"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.2,
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

export default ProgressBar;
