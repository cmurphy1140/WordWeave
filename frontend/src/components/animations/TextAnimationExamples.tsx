import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TypewriterText,
  FadeInWords,
  StaggeredLines,
  GlowingText,
  MorphingText
} from './index';

// Example poems for demonstrations
const SAMPLE_POEMS = {
  haiku: `Cherry blossoms fall,
Silent petals drift away—
Spring's gentle goodbye.`,
  
  free_verse: `In the quiet moments between heartbeats,
where silence holds its breath,
I find you lingering
like morning mist on distant mountains,
beautiful and ephemeral,
a whispered secret
the universe keeps.`,
  
  sonnet_excerpt: `Shall I compare thee to a summer's day?
Thou art more lovely and more temperate:
Rough winds do shake the darling buds of May,
And summer's lease hath all too short a date.`,
  
  modern: `Code flows through fingertips like digital poetry,
each function a verse, each variable a metaphor,
creating worlds from logic and dreams,
where algorithms dance with creativity.`
};

const EMOTION_LEVELS = {
  calm: 0.3,
  peaceful: 0.5,
  passionate: 0.8,
  intense: 1.0
};

// TypewriterText Usage Examples
export const TypewriterTextExamples: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentSpeed, setCurrentSpeed] = useState(3);
  const [showCursor, setShowCursor] = useState(true);

  return (
    <div className="example-section">
      <h3>TypewriterText Component Examples</h3>
      
      {/* Basic Usage */}
      <div className="example-card">
        <h4>Basic Typewriter Effect</h4>
        <TypewriterText
          text="Hello, I'm a typewriter animation with adjustable speed!"
          speed={currentSpeed}
          isPaused={!isPlaying}
          showCursor={showCursor}
          onComplete={() => console.log('Typing complete!')}
        />
        
        <div className="controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <label>
            Speed: 
            <input
              type="range"
              min="1"
              max="10"
              value={currentSpeed}
              onChange={(e) => setCurrentSpeed(Number(e.target.value))}
            />
            {currentSpeed} chars/sec
          </label>
          <label>
            <input
              type="checkbox"
              checked={showCursor}
              onChange={(e) => setShowCursor(e.target.checked)}
            />
            Show Cursor
          </label>
        </div>
      </div>

      {/* Poem Example */}
      <div className="example-card">
        <h4>Poetry Typewriter</h4>
        <TypewriterText
          text={SAMPLE_POEMS.haiku}
          speed={2}
          startDelay={500}
          className="poem-typewriter"
        />
      </div>

      {/* Code Example */}
      <div className="code-example">
        <pre>{`
<TypewriterText
  text="Your poem text here"
  speed={3} // characters per second
  startDelay={500} // ms delay before starting
  isPaused={false} // pause/play control
  showCursor={true} // show blinking cursor
  onComplete={() => console.log('Done!')}
  className="custom-typewriter"
/>
        `}</pre>
      </div>
    </div>
  );
};

// FadeInWords Usage Examples
export const FadeInWordsExamples: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [staggerDelay, setStaggerDelay] = useState(0.15);

  return (
    <div className="example-section">
      <h3>FadeInWords Component Examples</h3>
      
      {/* Basic Usage */}
      <div className="example-card">
        <h4>Word-by-Word Reveal</h4>
        <FadeInWords
          text="Each word appears one by one with beautiful fade transitions"
          staggerDelay={staggerDelay}
          isPaused={!isPlaying}
          preserveSpaces={true}
        />
        
        <div className="controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <label>
            Stagger Delay: 
            <input
              type="range"
              min="0.05"
              max="0.5"
              step="0.05"
              value={staggerDelay}
              onChange={(e) => setStaggerDelay(Number(e.target.value))}
            />
            {staggerDelay}s
          </label>
        </div>
      </div>

      {/* Poem Example */}
      <div className="example-card">
        <h4>Poetic Word Reveal</h4>
        <FadeInWords
          text={SAMPLE_POEMS.free_verse}
          staggerDelay={0.2}
          wordDuration={0.8}
          className="poem-fade-words"
        />
      </div>

      {/* Code Example */}
      <div className="code-example">
        <pre>{`
<FadeInWords
  text="Your poem text here"
  staggerDelay={0.15} // delay between words
  wordDuration={0.6} // animation duration per word
  startDelay={0} // initial delay
  preserveSpaces={true} // maintain spacing
  isPaused={false}
  onComplete={() => console.log('All words revealed!')}
/>
        `}</pre>
      </div>
    </div>
  );
};

// StaggeredLines Usage Examples
export const StaggeredLinesExamples: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [animationType, setAnimationType] = useState<'slide' | 'fade' | 'bounce' | 'scale'>('slide');

  return (
    <div className="example-section">
      <h3>StaggeredLines Component Examples</h3>
      
      {/* Basic Usage */}
      <div className="example-card">
        <h4>Line-by-Line Animation</h4>
        <StaggeredLines
          text={SAMPLE_POEMS.sonnet_excerpt}
          animationType={animationType}
          isPaused={!isPlaying}
          lineStagger={0.3}
        />
        
        <div className="controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <select 
            value={animationType} 
            onChange={(e) => setAnimationType(e.target.value as any)}
          >
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="bounce">Bounce</option>
            <option value="scale">Scale</option>
          </select>
        </div>
      </div>

      {/* Multiple Poems */}
      <div className="example-card">
        <h4>Different Animation Types</h4>
        <div className="animation-grid">
          {(['slide', 'fade', 'bounce', 'scale'] as const).map(type => (
            <div key={type} className="animation-demo">
              <h5>{type.toUpperCase()}</h5>
              <StaggeredLines
                text={SAMPLE_POEMS.haiku}
                animationType={type}
                lineStagger={0.2}
                className={`demo-${type}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="code-example">
        <pre>{`
<StaggeredLines
  text="Line 1\nLine 2\nLine 3" // Use \n for line breaks
  animationType="slide" // 'slide' | 'fade' | 'bounce' | 'scale'
  lineStagger={0.2} // delay between lines
  lineDuration={0.8} // animation duration per line
  startDelay={0}
  isPaused={false}
  onComplete={() => console.log('All lines shown!')}
/>
        `}</pre>
      </div>
    </div>
  );
};

// GlowingText Usage Examples
export const GlowingTextExamples: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [emotionLevel, setEmotionLevel] = useState<keyof typeof EMOTION_LEVELS>('peaceful');
  const [enableParticles, setEnableParticles] = useState(false);

  return (
    <div className="example-section">
      <h3>GlowingText Component Examples</h3>
      
      {/* Basic Usage */}
      <div className="example-card">
        <h4>Emotion-Based Glow</h4>
        <GlowingText
          text="This text glows based on emotional intensity"
          emotionIntensity={EMOTION_LEVELS[emotionLevel]}
          isPaused={!isPlaying}
          enableParticles={enableParticles}
          glowColor="#667eea"
        />
        
        <div className="controls">
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause Glow' : 'Start Glow'}
          </button>
          <select 
            value={emotionLevel} 
            onChange={(e) => setEmotionLevel(e.target.value as any)}
          >
            <option value="calm">Calm (0.3)</option>
            <option value="peaceful">Peaceful (0.5)</option>
            <option value="passionate">Passionate (0.8)</option>
            <option value="intense">Intense (1.0)</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={enableParticles}
              onChange={(e) => setEnableParticles(e.target.checked)}
            />
            Enable Particles
          </label>
        </div>
      </div>

      {/* Different Emotions */}
      <div className="example-card">
        <h4>Emotional Spectrum</h4>
        <div className="glow-grid">
          {Object.entries(EMOTION_LEVELS).map(([emotion, intensity]) => (
            <div key={emotion} className="glow-demo">
              <h5>{emotion.toUpperCase()}</h5>
              <GlowingText
                text="Glowing poetry"
                emotionIntensity={intensity}
                glowColor={
                  emotion === 'calm' ? '#4ade80' :
                  emotion === 'peaceful' ? '#60a5fa' :
                  emotion === 'passionate' ? '#f87171' :
                  '#a855f7'
                }
                enableParticles={intensity > 0.7}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="code-example">
        <pre>{`
<GlowingText
  text="Your glowing text here"
  emotionIntensity={0.8} // 0-1 intensity level
  glowColor="#667eea" // hex or CSS color
  pulseSpeed={2} // seconds for pulse cycle
  maxGlowRadius={20} // maximum glow radius
  enableParticles={true} // floating particles effect
  isPaused={false}
/>
        `}</pre>
      </div>
    </div>
  );
};

// MorphingText Usage Examples
export const MorphingTextExamples: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [morphType, setMorphType] = useState<'slide' | 'fade' | 'flip' | 'wave' | 'spiral'>('wave');
  const [currentPoemIndex, setCurrentPoemIndex] = useState(0);
  const poemKeys = Object.keys(SAMPLE_POEMS);

  const nextPoem = useCallback(() => {
    setCurrentPoemIndex((prev) => (prev + 1) % poemKeys.length);
  }, [poemKeys.length]);

  const currentPoem = SAMPLE_POEMS[poemKeys[currentPoemIndex] as keyof typeof SAMPLE_POEMS];
  const previousPoem = currentPoemIndex > 0 ? 
    SAMPLE_POEMS[poemKeys[currentPoemIndex - 1] as keyof typeof SAMPLE_POEMS] : undefined;

  return (
    <div className="example-section">
      <h3>MorphingText Component Examples</h3>
      
      {/* Basic Usage */}
      <div className="example-card">
        <h4>Smooth Poem Transitions</h4>
        <MorphingText
          currentText={currentPoem}
          previousText={previousPoem}
          morphType={morphType}
          morphDuration={1.5}
          isPaused={!isPlaying}
          preserveHeight={true}
          onMorphComplete={() => console.log('Morph complete!')}
        />
        
        <div className="controls">
          <button onClick={nextPoem}>Switch Poem</button>
          <button onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <select 
            value={morphType} 
            onChange={(e) => setMorphType(e.target.value as any)}
          >
            <option value="wave">Wave</option>
            <option value="slide">Slide</option>
            <option value="fade">Fade</option>
            <option value="flip">Flip</option>
            <option value="spiral">Spiral</option>
          </select>
        </div>
      </div>

      {/* Morph Type Showcase */}
      <div className="example-card">
        <h4>Morph Type Comparison</h4>
        <div className="morph-grid">
          {(['wave', 'slide', 'fade', 'flip', 'spiral'] as const).map(type => (
            <div key={type} className="morph-demo">
              <h5>{type.toUpperCase()}</h5>
              <MorphingText
                currentText="New text appears"
                previousText="Old text disappears"
                morphType={type}
                morphDuration={2}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Code Example */}
      <div className="code-example">
        <pre>{`
<MorphingText
  currentText="New poem text"
  previousText="Previous poem text" // for smooth transitions
  morphType="wave" // 'slide' | 'fade' | 'flip' | 'wave' | 'spiral'
  morphDuration={1.2} // seconds for transition
  preserveHeight={true} // maintain container height
  isPaused={false}
  onMorphComplete={() => console.log('Transition complete!')}
/>
        `}</pre>
      </div>
    </div>
  );
};

// Combined Usage Example
export const CombinedAnimationExample: React.FC = () => {
  const [currentStage, setCurrentStage] = useState<'typewriter' | 'fade' | 'stagger' | 'glow' | 'morph'>('typewriter');
  
  const stages = [
    { id: 'typewriter', label: 'Typewriter', component: TypewriterText },
    { id: 'fade', label: 'Fade Words', component: FadeInWords },
    { id: 'stagger', label: 'Stagger Lines', component: StaggeredLines },
    { id: 'glow', label: 'Glow Effect', component: GlowingText },
    { id: 'morph', label: 'Morph Text', component: MorphingText }
  ];

  return (
    <div className="example-section">
      <h3>Combined Animation Showcase</h3>
      
      <div className="example-card">
        <h4>Animation Sequence Demo</h4>
        
        <div className="stage-controls">
          {stages.map(stage => (
            <button
              key={stage.id}
              onClick={() => setCurrentStage(stage.id as any)}
              className={currentStage === stage.id ? 'active' : ''}
            >
              {stage.label}
            </button>
          ))}
        </div>

        <div className="animation-showcase">
          <AnimatePresence mode="wait">
            {currentStage === 'typewriter' && (
              <motion.div key="typewriter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <TypewriterText
                  text={SAMPLE_POEMS.modern}
                  speed={4}
                  showCursor={true}
                />
              </motion.div>
            )}
            
            {currentStage === 'fade' && (
              <motion.div key="fade" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <FadeInWords
                  text={SAMPLE_POEMS.free_verse}
                  staggerDelay={0.1}
                />
              </motion.div>
            )}
            
            {currentStage === 'stagger' && (
              <motion.div key="stagger" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <StaggeredLines
                  text={SAMPLE_POEMS.sonnet_excerpt}
                  animationType="slide"
                />
              </motion.div>
            )}
            
            {currentStage === 'glow' && (
              <motion.div key="glow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <GlowingText
                  text="Passionate poetry glows with emotion"
                  emotionIntensity={0.9}
                  enableParticles={true}
                />
              </motion.div>
            )}
            
            {currentStage === 'morph' && (
              <motion.div key="morph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <MorphingText
                  currentText={SAMPLE_POEMS.haiku}
                  morphType="wave"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Integration Code Example */}
      <div className="code-example">
        <pre>{`
// Theme-aware usage - animations automatically adapt to theme
const PoemDisplay = ({ poem, animationType }) => {
  return (
    <div className="poem-container">
      {animationType === 'typewriter' && (
        <TypewriterText text={poem.text} />
      )}
      {animationType === 'fadeWords' && (
        <FadeInWords text={poem.text} />
      )}
      {animationType === 'staggerLines' && (
        <StaggeredLines text={poem.text} />
      )}
      {animationType === 'glow' && (
        <GlowingText 
          text={poem.text} 
          emotionIntensity={poem.emotion?.intensity} 
        />
      )}
      {animationType === 'morph' && (
        <MorphingText 
          currentText={poem.text}
          previousText={previousPoem?.text}
        />
      )}
    </div>
  );
};
        `}</pre>
      </div>
    </div>
  );
};

// Main Examples Component
export const TextAnimationExamples: React.FC = () => {
  return (
    <div className="text-animation-examples" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{ textAlign: 'center', marginBottom: '3rem', color: '#2d3748' }}
      >
        WordWeave Text Animation Components
      </motion.h1>

      <TypewriterTextExamples />
      <FadeInWordsExamples />
      <StaggeredLinesExamples />
      <GlowingTextExamples />
      <MorphingTextExamples />
      <CombinedAnimationExample />

      <style>{`
        .example-section {
          margin-bottom: 4rem;
          padding: 2rem;
          background: rgba(255, 255, 255, 0.8);
          border-radius: 12px;
          backdrop-filter: blur(10px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }
        
        .example-card {
          margin-bottom: 2rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
        }
        
        .controls {
          margin-top: 1rem;
          display: flex;
          gap: 1rem;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .controls button {
          padding: 0.5rem 1rem;
          border: 1px solid #667eea;
          background: transparent;
          color: #667eea;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .controls button:hover {
          background: #667eea;
          color: white;
        }
        
        .animation-grid, .glow-grid, .morph-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .animation-demo, .glow-demo, .morph-demo {
          padding: 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          background: #fafafa;
        }
        
        .stage-controls {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }
        
        .stage-controls button {
          padding: 0.5rem 1rem;
          border: 1px solid #e2e8f0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .stage-controls button.active {
          background: #667eea;
          color: white;
          border-color: #667eea;
        }
        
        .animation-showcase {
          min-height: 200px;
          padding: 2rem;
          border: 2px dashed #e2e8f0;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .code-example {
          margin-top: 1rem;
          background: #1a202c;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 6px;
          overflow-x: auto;
        }
        
        .code-example pre {
          margin: 0;
          font-family: 'Fira Code', monospace;
          font-size: 0.9rem;
        }
        
        h3 {
          color: #2d3748;
          border-bottom: 2px solid #667eea;
          padding-bottom: 0.5rem;
          margin-bottom: 1.5rem;
        }
        
        h4 {
          color: #4a5568;
          margin-bottom: 1rem;
        }
        
        h5 {
          color: #667eea;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default TextAnimationExamples;
