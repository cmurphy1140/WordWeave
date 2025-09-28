import React, { useState } from 'react';
import TypographySystem from '../components/TypographySystem';

const TypographyDemo: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<'romantic' | 'mystical' | 'modern' | 'playful'>('romantic');
  const [selectedLayout, setSelectedLayout] = useState<'haiku' | 'narrative' | 'experimental' | 'classic'>('narrative');
  const [readingEnhancements, setReadingEnhancements] = useState({
    bionicReading: false,
    focusMode: false,
    paceIndicator: true,
    annotations: true
  });

  const samplePoems = {
    romantic: `In whispered dreams where shadows dance,
The ancient stars begin to sing,
A symphony of light and chance,
Where every word becomes a wing.

These golden moments hold so dear,
The magic that we cannot see,
But feel it drawing ever near,
In love's eternal mystery.`,

    mystical: `Through veils of time the spirits call,
Where ancient wisdom softly flows,
The universe reveals it all,
In patterns that the cosmos knows.

Mystical forces guide the way,
Through realms beyond our mortal sight,
Where dreams and reality play,
In endless dance of day and night.`,

    modern: `City lights reflect in glass,
Concrete dreams and steel resolve,
Digital age moves fast,
Problems that we must solve.

Urban rhythm, urban beat,
Technology and human touch,
Where the virtual meets the street,
Modern life demands so much.`,

    playful: `Bouncing balls and skipping stones,
Laughter echoing through the air,
Children's voices, happy tones,
Joy and wonder everywhere.

Silly songs and funny faces,
Dancing in the summer sun,
Life's a game with many places,
Fun is never truly done.`
  };

  const haikuPoems = {
    romantic: `Whispered love songs
In the moonlight's gentle glow
Hearts forever bound`,

    mystical: `Ancient spirits dance
Through veils of time and space
Mystery unfolds`,

    modern: `Digital dreams flow
Through circuits of tomorrow
Code becomes poetry`,

    playful: `Bouncing through the day
Laughter fills the air with joy
Childhood never ends`
  };

  const getCurrentPoem = () => {
    if (selectedLayout === 'haiku') {
      return haikuPoems[selectedMood];
    }
    return samplePoems[selectedMood];
  };

  return (
    <div className="typography-demo">
      <header className="demo-header">
        <h1>VerseCanvas Typography System</h1>
        <p>Experience poetry through adaptive typography that responds to mood, content, and reading preferences.</p>
      </header>

      <div className="demo-controls">
        <div className="control-section">
          <h3>Typography Mood</h3>
          <div className="control-buttons">
            {(['romantic', 'mystical', 'modern', 'playful'] as const).map(mood => (
              <button
                key={mood}
                className={`control-button ${selectedMood === mood ? 'active' : ''}`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood.charAt(0).toUpperCase() + mood.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>Layout Style</h3>
          <div className="control-buttons">
            {(['haiku', 'narrative', 'experimental', 'classic'] as const).map(layout => (
              <button
                key={layout}
                className={`control-button ${selectedLayout === layout ? 'active' : ''}`}
                onClick={() => setSelectedLayout(layout)}
              >
                {layout.charAt(0).toUpperCase() + layout.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>Reading Enhancements</h3>
          <div className="enhancement-controls">
            <label className="enhancement-toggle">
              <input
                type="checkbox"
                checked={readingEnhancements.bionicReading}
                onChange={(e) => setReadingEnhancements(prev => ({
                  ...prev,
                  bionicReading: e.target.checked
                }))}
              />
              <span>Bionic Reading</span>
            </label>
            
            <label className="enhancement-toggle">
              <input
                type="checkbox"
                checked={readingEnhancements.focusMode}
                onChange={(e) => setReadingEnhancements(prev => ({
                  ...prev,
                  focusMode: e.target.checked
                }))}
              />
              <span>Focus Mode</span>
            </label>
            
            <label className="enhancement-toggle">
              <input
                type="checkbox"
                checked={readingEnhancements.paceIndicator}
                onChange={(e) => setReadingEnhancements(prev => ({
                  ...prev,
                  paceIndicator: e.target.checked
                }))}
              />
              <span>Pace Indicator</span>
            </label>
            
            <label className="enhancement-toggle">
              <input
                type="checkbox"
                checked={readingEnhancements.annotations}
                onChange={(e) => setReadingEnhancements(prev => ({
                  ...prev,
                  annotations: e.target.checked
                }))}
              />
              <span>Annotations</span>
            </label>
          </div>
        </div>
      </div>

      <div className="demo-content">
        <TypographySystem
          poem={getCurrentPoem()}
          mood={selectedMood}
          layout={selectedLayout}
          readingEnhancements={readingEnhancements}
        />
      </div>

      <div className="demo-info">
        <div className="info-section">
          <h3>Typography Scales</h3>
          <ul>
            <li><strong>Romantic:</strong> Playfair Display, Golden Ratio (1.618), Warm Kerning</li>
            <li><strong>Mystical:</strong> Cinzel, 1.5 Ratio, Expanded Tracking</li>
            <li><strong>Modern:</strong> Inter Variable, 1.414 Ratio, Tight Leading</li>
            <li><strong>Playful:</strong> Fredoka, 1.333 Ratio, Bouncy Baseline</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Dynamic Treatments</h3>
          <ul>
            <li><strong>Rhythm:</strong> Line height adapts to poem rhythm</li>
            <li><strong>Emotion:</strong> Font size emphasizes emotional peaks</li>
            <li><strong>Contemplation:</strong> Letter spacing opens for thoughtful sections</li>
            <li><strong>Drama:</strong> Text shadows appear for dramatic moments</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Layout Variations</h3>
          <ul>
            <li><strong>Haiku:</strong> Centered, massive whitespace, vertical rhythm</li>
            <li><strong>Narrative:</strong> Book-like, justified, drop caps</li>
            <li><strong>Experimental:</strong> Concrete poetry shapes, scattered words</li>
            <li><strong>Classic:</strong> Elegant margins, hanging punctuation</li>
          </ul>
        </div>

        <div className="info-section">
          <h3>Reading Enhancements</h3>
          <ul>
            <li><strong>Bionic Reading:</strong> Bold first letters for faster reading</li>
            <li><strong>Focus Mode:</strong> Highlights current line, dims others</li>
            <li><strong>Pace Indicator:</strong> Shows reading time and speed</li>
            <li><strong>Annotations:</strong> Click lines to save favorites</li>
          </ul>
        </div>
      </div>

      <style>{`
        .typography-demo {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: 'Inter', sans-serif;
        }

        .demo-header {
          text-align: center;
          padding: 2rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .demo-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          font-weight: 700;
        }

        .demo-header p {
          font-size: 1.2rem;
          opacity: 0.9;
          max-width: 600px;
          margin: 0 auto;
        }

        .demo-controls {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(10px);
        }

        .control-section {
          margin-bottom: 2rem;
        }

        .control-section h3 {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .control-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .control-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          background: rgba(255, 255, 255, 0.1);
          color: white;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .control-button:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .control-button.active {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.6);
          transform: scale(1.05);
        }

        .enhancement-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .enhancement-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .enhancement-toggle:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .enhancement-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: #3498DB;
        }

        .demo-content {
          padding: 2rem;
          min-height: 60vh;
        }

        .demo-info {
          padding: 2rem;
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(10px);
        }

        .info-section {
          margin-bottom: 2rem;
        }

        .info-section h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #FFD700;
        }

        .info-section ul {
          list-style: none;
          padding: 0;
        }

        .info-section li {
          padding: 0.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .info-section li:last-child {
          border-bottom: none;
        }

        .info-section strong {
          color: #FFD700;
        }

        @media (max-width: 768px) {
          .demo-header h1 {
            font-size: 2rem;
          }

          .demo-header p {
            font-size: 1rem;
          }

          .control-buttons {
            flex-direction: column;
          }

          .enhancement-controls {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default TypographyDemo;
