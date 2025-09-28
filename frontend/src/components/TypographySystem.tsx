import React, { useState, useEffect } from 'react';
import '../styles/typography-system.css';

interface TypographySystemProps {
  poem: string;
  mood: 'romantic' | 'mystical' | 'modern' | 'playful';
  layout: 'haiku' | 'narrative' | 'experimental' | 'classic';
  readingEnhancements?: {
    bionicReading?: boolean;
    focusMode?: boolean;
    paceIndicator?: boolean;
    annotations?: boolean;
  };
}

const TypographySystem: React.FC<TypographySystemProps> = ({
  poem,
  mood,
  layout,
  readingEnhancements = {}
}) => {
  const [currentLine, setCurrentLine] = useState(0);
  const [annotatedLines, setAnnotatedLines] = useState<Set<number>>(new Set());
  const [readingTime, setReadingTime] = useState(0);
  const [readingSpeed, setReadingSpeed] = useState<'slow' | 'medium' | 'fast'>('medium');

  const poemLines = poem.split('\n').filter(line => line.trim().length > 0);

  // Calculate reading time based on word count
  useEffect(() => {
    const wordCount = poem.split(/\s+/).length;
    const wordsPerMinute = readingSpeed === 'slow' ? 150 : readingSpeed === 'medium' ? 200 : 250;
    setReadingTime(Math.ceil(wordCount / wordsPerMinute));
  }, [poem, readingSpeed]);

  // Focus mode: cycle through lines
  useEffect(() => {
    if (readingEnhancements.focusMode) {
      const interval = setInterval(() => {
        setCurrentLine(prev => (prev + 1) % poemLines.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [poemLines.length, readingEnhancements.focusMode]);

  const handleLineClick = (index: number) => {
    if (readingEnhancements.annotations) {
      setAnnotatedLines(prev => {
        const newSet = new Set(prev);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        return newSet;
      });
    }
  };

  const getTypographyClass = () => {
    switch (mood) {
      case 'romantic': return 'typography-romantic';
      case 'mystical': return 'typography-mystical';
      case 'modern': return 'typography-modern';
      case 'playful': return 'typography-playful';
      default: return 'typography-modern';
    }
  };

  const getLayoutClass = () => {
    return `poem-layout-${layout}`;
  };

  const getLineClasses = (index: number) => {
    const classes = ['poem-line'];
    
    // Add typography class
    classes.push(getTypographyClass());
    
    // Add rhythm classes based on line length
    const lineLength = poemLines[index].length;
    if (lineLength < 30) classes.push('rhythm-fast');
    else if (lineLength < 60) classes.push('rhythm-medium');
    else classes.push('rhythm-slow');
    
    // Add emotion classes based on content
    const line = poemLines[index].toLowerCase();
    if (line.includes('love') || line.includes('heart') || line.includes('kiss')) {
      classes.push('emotion-peak');
    } else if (line.includes('dream') || line.includes('hope') || line.includes('light')) {
      classes.push('emotion-high');
    } else if (line.includes('dark') || line.includes('shadow') || line.includes('night')) {
      classes.push('emotion-low');
    } else {
      classes.push('emotion-medium');
    }
    
    // Add contemplative/urgent classes
    if (line.includes('...') || line.includes('silence') || line.includes('still')) {
      classes.push('contemplative');
    } else if (line.includes('!') || line.includes('urgent') || line.includes('quick')) {
      classes.push('urgent');
    }
    
    // Add dramatic/mystical shadow classes
    if (line.includes('storm') || line.includes('thunder') || line.includes('fire')) {
      classes.push('dramatic');
    } else if (line.includes('magic') || line.includes('mystery') || line.includes('ancient')) {
      classes.push('mystical-shadow');
    }
    
    // Focus mode
    if (readingEnhancements.focusMode) {
      if (index === currentLine) {
        classes.push('focused');
      }
    }
    
    // Annotations
    if (readingEnhancements.annotations && annotatedLines.has(index)) {
      classes.push('annotated');
    }
    
    return classes.join(' ');
  };

  const renderBionicText = (text: string) => {
    if (!readingEnhancements.bionicReading) return text;
    
    return text.split(' ').map((word, wordIndex) => {
      if (word.length <= 3) return word;
      
      const boldLength = Math.ceil(word.length / 2);
      const boldPart = word.substring(0, boldLength);
      const normalPart = word.substring(boldLength);
      
      return (
        <span key={wordIndex}>
          <span className="bionic-bold">{boldPart}</span>
          {normalPart}
          {wordIndex < text.split(' ').length - 1 ? ' ' : ''}
        </span>
      );
    });
  };

  return (
    <div className={`typography-system ${getLayoutClass()}`}>
      {/* Skip Link for Accessibility */}
      <a href="#poem-content" className="skip-link">
        Skip to poem content
      </a>

      {/* Reading Progress Bar */}
      {readingEnhancements.focusMode && (
        <div className="reading-progress">
          <div 
            className="reading-progress-bar"
            style={{ width: `${((currentLine + 1) / poemLines.length) * 100}%` }}
          />
        </div>
      )}

      {/* Pace Indicator */}
      {readingEnhancements.paceIndicator && (
        <div className={`pace-indicator ${readingSpeed}`}>
          <div className="reading-time">{readingTime} min read</div>
          <div className="reading-speed">
            {readingSpeed === 'slow' ? 'Slow' : readingSpeed === 'medium' ? 'Medium' : 'Fast'} pace
          </div>
          <div className="pace-visualization">
            <div 
              className="pace-bar"
              style={{ 
                width: readingSpeed === 'slow' ? '30%' : readingSpeed === 'medium' ? '60%' : '90%' 
              }}
            />
          </div>
        </div>
      )}

      {/* Bionic Reading Toggle */}
      {readingEnhancements.bionicReading && (
        <button 
          className="bionic-reading-toggle"
          onClick={() => {
            // Toggle bionic reading
            const element = document.querySelector('.typography-system');
            element?.classList.toggle('bionic-reading');
          }}
        >
          Bionic Reading
        </button>
      )}

      {/* Poem Content */}
      <div id="poem-content" className="poem-content">
        {poemLines.map((line, index) => (
          <div
            key={index}
            className={getLineClasses(index)}
            onClick={() => handleLineClick(index)}
            role={readingEnhancements.annotations ? "button" : undefined}
            tabIndex={readingEnhancements.annotations ? 0 : undefined}
            aria-label={readingEnhancements.annotations ? `Annotate line ${index + 1}` : undefined}
          >
            {renderBionicText(line)}
          </div>
        ))}
      </div>

      {/* Annotation Panel */}
      {readingEnhancements.annotations && (
        <div className={`annotation-panel ${annotatedLines.size > 0 ? 'open' : ''}`}>
          <h3>Annotated Lines</h3>
          {Array.from(annotatedLines).map(lineIndex => (
            <div key={lineIndex} className="annotation-item">
              <div className="annotation-text">
                Line {lineIndex + 1}: {poemLines[lineIndex]}
              </div>
              <div className="annotation-note">
                Clicked on {new Date().toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="typography-controls">
        <div className="control-group">
          <label htmlFor="reading-speed">Reading Speed:</label>
          <select 
            id="reading-speed"
            value={readingSpeed}
            onChange={(e) => setReadingSpeed(e.target.value as 'slow' | 'medium' | 'fast')}
          >
            <option value="slow">Slow (150 WPM)</option>
            <option value="medium">Medium (200 WPM)</option>
            <option value="fast">Fast (250 WPM)</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TypographySystem;
