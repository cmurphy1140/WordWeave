import React from 'react';
import { motion } from 'framer-motion';

interface BookLayoutProps {
  lines: string[];
  layoutId: string;
  className?: string;
}

const BookLayout: React.FC<BookLayoutProps> = ({ lines, layoutId, className = '' }) => {
  return (
    <motion.div
      layoutId={layoutId}
      className={`book-layout ${className}`}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 50 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <div className="book-container">
        <div className="book-page">
          <div className="book-margin-left"></div>
          <div className="book-content">
            {lines.map((line, index) => (
              <motion.div
                key={`book-line-${index}`}
                className="book-line"
                layoutId={`line-${index}`}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ 
                  duration: 0.4, 
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                style={{
                  textAlign: 'left',
                  margin: '0.8rem 0',
                  fontSize: '1.1rem',
                  lineHeight: '1.8',
                  textIndent: index === 0 ? '0' : '2rem',
                  maxWidth: '500px'
                }}
              >
                {line}
              </motion.div>
            ))}
          </div>
          <div className="book-margin-right"></div>
        </div>
      </div>
    </motion.div>
  );
};

export default BookLayout;
