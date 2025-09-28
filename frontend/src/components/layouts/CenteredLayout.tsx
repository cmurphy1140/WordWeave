import React from 'react';
import { motion } from 'framer-motion';

interface CenteredLayoutProps {
  lines: string[];
  layoutId: string;
  className?: string;
}

const CenteredLayout: React.FC<CenteredLayoutProps> = ({ lines, layoutId, className = '' }) => {
  return (
    <motion.div
      layoutId={layoutId}
      className={`centered-layout ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="centered-container">
        {lines.map((line, index) => (
          <motion.div
            key={`centered-line-${index}`}
            className="centered-line"
            layoutId={`line-${index}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ 
              duration: 0.2, 
              delay: index * 0.05, // Reduced delay
              ease: "easeOut"
            }}
            style={{
              textAlign: 'center',
              margin: '0.5rem 0',
              fontSize: '1.2rem',
              lineHeight: '1.6',
              maxWidth: '600px',
              marginLeft: 'auto',
              marginRight: 'auto'
            }}
          >
            {line}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default CenteredLayout;
