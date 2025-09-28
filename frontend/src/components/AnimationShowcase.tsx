import React, { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  SparklesIcon, 
  TypewriterIcon, 
  FadeIcon, 
  ScrollIcon, 
  StarIcon, 
  MorphIcon,
  PlayIcon,
  PauseIcon,
  RefreshIcon,
  CodeIcon,
  RocketIcon
} from './icons';
import { 
  TypewriterText, 
  FadeInWords, 
  StaggeredLines, 
  GlowingText, 
  MorphingText 
} from './animations';

interface AnimationShowcaseProps {
  poem?: string;
  className?: string;
}

const AnimationShowcase: React.FC<AnimationShowcaseProps> = memo(({ 
  poem = "In moonlit gardens where silence grows,\nAncient wisdom softly flows,\nDancing shadows tell their tales,\nOf love that never, ever fails.", 
  className = '' 
}) => {
  const [currentAnimation, setCurrentAnimation] = useState<string>('typewriter');
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentPoem, setCurrentPoem] = useState(poem);
  const [previousPoem, setPreviousPoem] = useState<string>('');

  const samplePoems = useMemo(() => [
    "In moonlit gardens where silence grows,\nAncient wisdom softly flows,\nDancing shadows tell their tales,\nOf love that never, ever fails.",
    "Fierce winds whisper forgotten dreams,\nThrough crystalline mountain streams,\nEchoing hope in every stone,\nIn this magical place I call home.",
    "Gentle raindrops kiss the earth,\nCelebrating nature's rebirth,\nEmerald fields stretch far and wide,\nWhere peaceful spirits safely hide."
  ], []);

  const handleAnimationChange = useCallback((animationType: string) => {
    setCurrentAnimation(animationType);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  const handlePoemChange = useCallback(() => {
    const currentIndex = samplePoems.indexOf(currentPoem);
    const nextIndex = (currentIndex + 1) % samplePoems.length;
    setPreviousPoem(currentPoem);
    setCurrentPoem(samplePoems[nextIndex]);
  }, [currentPoem, samplePoems]);

  const renderAnimation = () => {
    const commonProps = {
      isPaused: !isPlaying,
      className: "showcase-text",
      onComplete: () => console.log(`${currentAnimation} animation completed`)
    };

    switch (currentAnimation) {
      case 'typewriter':
        return (
          <TypewriterText
            text={currentPoem}
            speed={3}
            showCursor={true}
            {...commonProps}
          />
        );
      
      case 'fadewords':
        return (
          <FadeInWords
            text={currentPoem}
            staggerDelay={0.15}
            wordDuration={0.6}
            preserveSpaces={true}
            {...commonProps}
          />
        );
      
      case 'staggered':
        return (
          <StaggeredLines
            text={currentPoem}
            lineStagger={0.3}
            lineDuration={0.8}
            animationType="slide"
            {...commonProps}
          />
        );
      
      case 'glowing':
        return (
          <GlowingText
            text={currentPoem}
            emotionIntensity={0.8}
            enableParticles={true}
            maxGlowRadius={25}
            {...commonProps}
          />
        );
      
      case 'morphing':
        return (
          <MorphingText
            currentText={currentPoem}
            previousText={previousPoem}
            morphType="wave"
            morphDuration={1.5}
            preserveHeight={true}
            {...commonProps}
          />
        );
      
      default:
        return <div className="showcase-text">{currentPoem}</div>;
    }
  };

  return (
    <div className={`animation-showcase ${className}`}>
      <motion.div
        className="showcase-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2><SparklesIcon className="icon-lg btn-icon" /> WordWeave Animation Showcase</h2>
        <p>Experience the magic of Motion-powered text animations</p>
      </motion.div>

      {/* Animation Controls */}
      <motion.div 
        className="showcase-controls"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <div className="animation-selector">
          <label>Animation Type:</label>
          <div className="button-group">
            {[
              { key: 'typewriter', label: 'Typewriter', icon: TypewriterIcon },
              { key: 'fadewords', label: 'Fade Words', icon: FadeIcon },
              { key: 'staggered', label: 'Staggered Lines', icon: ScrollIcon },
              { key: 'glowing', label: 'Glowing Text', icon: StarIcon },
              { key: 'morphing', label: 'Morphing', icon: MorphIcon }
            ].map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                className={`animation-btn ${currentAnimation === key ? 'active' : ''}`}
                onClick={() => handleAnimationChange(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="btn-icon" /> {label}
              </motion.button>
            ))}
          </div>
        </div>

        <div className="playback-controls">
          <motion.button
            className="play-pause-btn"
            onClick={handlePlayPause}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isPlaying ? <><PauseIcon className="btn-icon" /> Pause</> : <><PlayIcon className="btn-icon" /> Play</>}
          </motion.button>
          
          <motion.button
            className="poem-change-btn"
            onClick={handlePoemChange}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RefreshIcon className="btn-icon" /> Change Poem
          </motion.button>
        </div>
      </motion.div>

      {/* Animation Display Area */}
      <motion.div 
        className="showcase-display"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <div className="animation-container">
          {renderAnimation()}
        </div>
        
        {/* Animation Info */}
        <motion.div 
          className="animation-info"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <h4>Current Animation: {currentAnimation}</h4>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">GPU Accelerated:</span>
              <span className="value">Yes</span>
            </div>
            <div className="info-item">
              <span className="label">Theme Aware:</span>
              <span className="value">Yes</span>
            </div>
            <div className="info-item">
              <span className="label">Performance:</span>
              <span className="value">Optimized</span>
            </div>
            <div className="info-item">
              <span className="label">Controls:</span>
              <span className="value">⏯ Pause/Play</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Usage Examples */}
      <motion.div 
        className="usage-examples"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
          <h3><CodeIcon className="icon-md btn-icon" /> Usage Examples</h3>
        
        <div className="code-example">
          <h4>TypewriterText Component</h4>
          <pre><code>{`import { TypewriterText } from './animations';

<TypewriterText
  text="Your poem text here"
  speed={3}
  showCursor={true}
  isPaused={false}
  onComplete={() => console.log('Complete!')}
/>`}</code></pre>
        </div>

        <div className="code-example">
          <h4>FadeInWords Component</h4>
          <pre><code>{`import { FadeInWords } from './animations';

<FadeInWords
  text="Your poem text here"
  staggerDelay={0.15}
  wordDuration={0.6}
  preserveSpaces={true}
/>`}</code></pre>
        </div>

        <div className="code-example">
          <h4>StaggeredLines Component</h4>
          <pre><code>{`import { StaggeredLines } from './animations';

<StaggeredLines
  text="Line one\\nLine two\\nLine three"
  lineStagger={0.3}
  animationType="slide"
/>`}</code></pre>
        </div>

        <div className="code-example">
          <h4>GlowingText Component</h4>
          <pre><code>{`import { GlowingText } from './animations';

<GlowingText
  text="Your magical text"
  emotionIntensity={0.8}
  enableParticles={true}
  maxGlowRadius={25}
/>`}</code></pre>
        </div>

        <div className="code-example">
          <h4>MorphingText Component</h4>
          <pre><code>{`import { MorphingText } from './animations';

<MorphingText
  currentText="New poem text"
  previousText="Old poem text"
  morphType="wave"
  morphDuration={1.5}
/>`}</code></pre>
        </div>
      </motion.div>

      {/* Performance Notes */}
      <motion.div 
        className="performance-notes"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
          <h3><RocketIcon className="icon-md btn-icon" /> Performance Features</h3>
        <ul>
          <li><strong>GPU Acceleration:</strong> Uses transform, opacity, and filter properties only</li>
          <li><strong>React.memo:</strong> All components are memoized for optimal re-rendering</li>
          <li><strong>Theme Integration:</strong> Automatically adapts to emotion analysis</li>
          <li><strong>Pause/Play:</strong> Built-in animation controls for user interaction</li>
          <li><strong>Will-Change:</strong> Proper GPU hints for smooth animations</li>
          <li><strong>Cleanup:</strong> Automatic timeout cleanup and memory management</li>
        </ul>
      </motion.div>
    </div>
  );
});

AnimationShowcase.displayName = 'AnimationShowcase';

export default AnimationShowcase;
