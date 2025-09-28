import React, { useState } from 'react';
import '../styles/color-system.css';

interface ColorSystemDemoProps {
  initialEmotion?: 'joy' | 'melancholy' | 'passion' | 'mystery' | 'serenity';
  showAnimations?: boolean;
  showGradients?: boolean;
}

const ColorSystemDemo: React.FC<ColorSystemDemoProps> = ({
  initialEmotion = 'joy',
  showAnimations = true,
  showGradients = true
}) => {
  const [currentEmotion, setCurrentEmotion] = useState(initialEmotion);
  const [animationEnabled, setAnimationEnabled] = useState(showAnimations);
  const [gradientType, setGradientType] = useState<'linear' | 'radial' | 'mesh' | 'animated'>('linear');

  const emotions = [
    { key: 'joy', label: 'Joy', description: 'Golden Radiance - Warm, uplifting, celebratory' },
    { key: 'melancholy', label: 'Melancholy', description: 'Deep Contemplation - Reflective, introspective, peaceful' },
    { key: 'passion', label: 'Passion', description: 'Crimson Fire - Intense, romantic, powerful' },
    { key: 'mystery', label: 'Mystery', description: 'Purple Enigma - Mysterious, mystical, intriguing' },
    { key: 'serenity', label: 'Serenity', description: 'Calm Waters - Peaceful, tranquil, healing' }
  ];

  const gradientTypes = [
    { key: 'linear', label: 'Linear', description: 'Emotional intensity mapping' },
    { key: 'radial', label: 'Radial', description: 'Emanating from emotional core' },
    { key: 'mesh', label: 'Mesh', description: 'Complex emotional nuances' },
    { key: 'animated', label: 'Animated', description: 'Colors shifting over time' }
  ];

  const samplePoems = {
    joy: `Golden sunlight dances bright,
Bringing warmth and pure delight,
Laughter echoes through the air,
Joy and happiness everywhere.`,

    melancholy: `Gentle rain falls soft and slow,
Memories of long ago,
Quiet thoughts and peaceful dreams,
Nothing's quite as it seems.`,

    passion: `Fire burns within my soul,
Passion makes me feel whole,
Love ignites with every beat,
Making life feel so complete.`,

    mystery: `Shadows dance in moonlit night,
Secrets hidden from our sight,
Magic whispers in the breeze,
Mysteries among the trees.`,

    serenity: `Calm waters flow so free,
Peaceful as the endless sea,
Gentle waves and soft embrace,
Serenity in every place.`
  };

  const getGradientClass = () => {
    if (!showGradients) return '';
    return `gradient-${currentEmotion}-${gradientType}`;
  };

  const getAnimationClasses = () => {
    if (!animationEnabled) return '';
    return `hue-shift-${currentEmotion} saturation-breath-${currentEmotion}`;
  };

  const getTransitionClass = () => {
    switch (currentEmotion) {
      case 'joy': return 'color-transition-joyful';
      case 'passion': return 'color-transition-passionate';
      case 'mystery': return 'color-transition-mystical';
      case 'serenity': return 'color-transition-serene';
      default: return 'color-transition-emotional';
    }
  };

  const getWaveEffectClass = () => {
    return `wave-effect-${currentEmotion}`;
  };

  return (
    <div className={`color-system-demo emotion-${currentEmotion} ${getGradientClass()} ${getAnimationClasses()} ${getTransitionClass()}`}>
      {/* Header */}
      <header className="demo-header">
        <h1>VerseCanvas Color System</h1>
        <p>Experience emotions through adaptive color palettes and dynamic visual treatments</p>
      </header>

      {/* Controls */}
      <div className="demo-controls">
        <div className="control-section">
          <h3>Emotional Palette</h3>
          <div className="emotion-buttons">
            {emotions.map(emotion => (
              <button
                key={emotion.key}
                className={`emotion-button ${currentEmotion === emotion.key ? 'active' : ''}`}
                onClick={() => setCurrentEmotion(emotion.key as any)}
                title={emotion.description}
              >
                {emotion.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>Gradient Type</h3>
          <div className="gradient-buttons">
            {gradientTypes.map(type => (
              <button
                key={type.key}
                className={`gradient-button ${gradientType === type.key ? 'active' : ''}`}
                onClick={() => setGradientType(type.key as any)}
                title={type.description}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="control-section">
          <h3>Animations</h3>
          <label className="animation-toggle">
            <input
              type="checkbox"
              checked={animationEnabled}
              onChange={(e) => setAnimationEnabled(e.target.checked)}
            />
            <span>Enable Animations</span>
          </label>
        </div>
      </div>

      {/* Color Palette Display */}
      <div className="color-palette-section">
        <h3>Current Palette</h3>
        <div className="color-swatches">
          <div className="color-swatch primary" title="Primary Color">
            <span className="color-label">Primary</span>
          </div>
          <div className="color-swatch secondary" title="Secondary Color">
            <span className="color-label">Secondary</span>
          </div>
          <div className="color-swatch accent" title="Accent Color">
            <span className="color-label">Accent</span>
          </div>
          <div className="color-swatch surface" title="Surface Color">
            <span className="color-label">Surface</span>
          </div>
          <div className="color-swatch text" title="Text Color">
            <span className="color-label">Text</span>
          </div>
        </div>
      </div>

      {/* Poem Display */}
      <div className="poem-section">
        <h3>Sample Poem</h3>
        <div className={`poem-container ${getWaveEffectClass()}`}>
          {samplePoems[currentEmotion].split('\n').map((line, index) => (
            <div key={index} className="poem-line">
              {line}
            </div>
          ))}
        </div>
      </div>

      {/* Gradient Examples */}
      {showGradients && (
        <div className="gradient-examples">
          <h3>Gradient Examples</h3>
          <div className="gradient-grid">
            <div className="gradient-sample gradient-joy-linear" title="Joy Linear">
              <span>Joy Linear</span>
            </div>
            <div className="gradient-sample gradient-melancholy-radial" title="Melancholy Radial">
              <span>Melancholy Radial</span>
            </div>
            <div className="gradient-sample gradient-passion-mesh" title="Passion Mesh">
              <span>Passion Mesh</span>
            </div>
            <div className="gradient-sample gradient-mystery-animated" title="Mystery Animated">
              <span>Mystery Animated</span>
            </div>
            <div className="gradient-sample gradient-serenity-linear" title="Serenity Linear">
              <span>Serenity Linear</span>
            </div>
          </div>
        </div>
      )}

      {/* Semantic Tokens Display */}
      <div className="semantic-tokens-section">
        <h3>Semantic Tokens</h3>
        <div className="token-examples">
          <div className="token-example">
            <div className="token-button primary">Primary Button</div>
            <div className="token-button secondary">Secondary Button</div>
            <div className="token-button accent">Accent Button</div>
          </div>
          <div className="token-example">
            <div className="token-card">
              <h4>Card Title</h4>
              <p>This is sample text using semantic color tokens.</p>
            </div>
          </div>
          <div className="token-example">
            <div className="token-input">
              <input type="text" placeholder="Input field with semantic colors" />
            </div>
          </div>
        </div>
      </div>

      {/* CSS Variables Display */}
      <div className="css-variables-section">
        <h3>CSS Variables</h3>
        <div className="variables-grid">
          <div className="variable-item">
            <code>--color-primary</code>
            <div className="variable-color primary"></div>
          </div>
          <div className="variable-item">
            <code>--color-secondary</code>
            <div className="variable-color secondary"></div>
          </div>
          <div className="variable-item">
            <code>--color-accent</code>
            <div className="variable-color accent"></div>
          </div>
          <div className="variable-item">
            <code>--color-surface</code>
            <div className="variable-color surface"></div>
          </div>
          <div className="variable-item">
            <code>--color-text</code>
            <div className="variable-color text"></div>
          </div>
        </div>
      </div>

      <style>{`
        .color-system-demo {
          min-height: 100vh;
          padding: 2rem;
          font-family: 'Inter', sans-serif;
          transition: all 0.8s ease;
        }

        .demo-header {
          text-align: center;
          margin-bottom: 3rem;
          padding: 2rem;
          border-radius: 20px;
          background: var(--color-surface-1);
          border: 2px solid var(--color-border-primary);
        }

        .demo-header h1 {
          font-size: 2.5rem;
          margin-bottom: 1rem;
          color: var(--color-primary);
          font-weight: 700;
        }

        .demo-header p {
          font-size: 1.2rem;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
        }

        .demo-controls {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
          padding: 2rem;
          background: var(--color-surface-2);
          border-radius: 15px;
        }

        .control-section h3 {
          font-size: 1.3rem;
          margin-bottom: 1rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .emotion-buttons,
        .gradient-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .emotion-button,
        .gradient-button {
          padding: 0.75rem 1.5rem;
          border: 2px solid var(--color-border-subtle);
          background: var(--color-surface-1);
          color: var(--color-text-primary);
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }

        .emotion-button:hover,
        .gradient-button:hover {
          background: var(--color-primary-hover);
          transform: translateY(-2px);
        }

        .emotion-button.active,
        .gradient-button.active {
          background: var(--color-primary);
          color: var(--color-surface-1);
          border-color: var(--color-primary);
          transform: scale(1.05);
        }

        .animation-toggle {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 8px;
          transition: background 0.3s ease;
        }

        .animation-toggle:hover {
          background: var(--color-surface-3);
        }

        .animation-toggle input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--color-primary);
        }

        .color-palette-section,
        .poem-section,
        .gradient-examples,
        .semantic-tokens-section,
        .css-variables-section {
          margin-bottom: 3rem;
          padding: 2rem;
          background: var(--color-surface-1);
          border-radius: 15px;
          border: 1px solid var(--color-border-subtle);
        }

        .color-palette-section h3,
        .poem-section h3,
        .gradient-examples h3,
        .semantic-tokens-section h3,
        .css-variables-section h3 {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--color-primary);
          font-weight: 600;
        }

        .color-swatches {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .color-swatch {
          width: 120px;
          height: 120px;
          border-radius: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          border: 2px solid var(--color-border-subtle);
          transition: transform 0.3s ease;
        }

        .color-swatch:hover {
          transform: scale(1.1);
        }

        .color-swatch.primary { background: var(--color-primary); }
        .color-swatch.secondary { background: var(--color-secondary); }
        .color-swatch.accent { background: var(--color-accent); }
        .color-swatch.surface { background: var(--color-surface); }
        .color-swatch.text { background: var(--color-text); }

        .color-label {
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 5px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .poem-container {
          max-width: 600px;
          margin: 0 auto;
        }

        .poem-line {
          font-size: 1.3rem;
          line-height: 1.8;
          margin-bottom: 1rem;
          padding: 0.5rem;
          border-radius: 8px;
          color: var(--color-text-primary);
          transition: all 0.6s ease;
        }

        .gradient-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .gradient-sample {
          height: 100px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
          transition: transform 0.3s ease;
        }

        .gradient-sample:hover {
          transform: scale(1.05);
        }

        .token-examples {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .token-button {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
          margin-right: 1rem;
        }

        .token-button.primary {
          background: var(--color-primary);
          color: var(--color-surface-1);
        }

        .token-button.secondary {
          background: var(--color-secondary);
          color: var(--color-surface-1);
        }

        .token-button.accent {
          background: var(--color-accent);
          color: var(--color-text-primary);
        }

        .token-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px var(--color-shadow-md);
        }

        .token-card {
          padding: 1.5rem;
          border-radius: 10px;
          background: var(--color-surface-2);
          border: 1px solid var(--color-border-subtle);
        }

        .token-card h4 {
          color: var(--color-primary);
          margin-bottom: 0.5rem;
        }

        .token-card p {
          color: var(--color-text-secondary);
        }

        .token-input input {
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--color-border-subtle);
          border-radius: 8px;
          background: var(--color-surface-1);
          color: var(--color-text-primary);
          font-size: 1rem;
        }

        .token-input input:focus {
          outline: none;
          border-color: var(--color-border-focus);
          box-shadow: 0 0 0 3px var(--color-shadow-sm);
        }

        .variables-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .variable-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--color-surface-2);
          border-radius: 8px;
          border: 1px solid var(--color-border-subtle);
        }

        .variable-item code {
          font-family: 'Monaco', 'Menlo', monospace;
          font-size: 0.9rem;
          color: var(--color-text-primary);
          flex: 1;
        }

        .variable-color {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          border: 2px solid var(--color-border-subtle);
        }

        .variable-color.primary { background: var(--color-primary); }
        .variable-color.secondary { background: var(--color-secondary); }
        .variable-color.accent { background: var(--color-accent); }
        .variable-color.surface { background: var(--color-surface); }
        .variable-color.text { background: var(--color-text); }

        @media (max-width: 768px) {
          .color-system-demo {
            padding: 1rem;
          }

          .demo-header h1 {
            font-size: 2rem;
          }

          .demo-controls {
            grid-template-columns: 1fr;
          }

          .color-swatches {
            justify-content: center;
          }

          .gradient-grid {
            grid-template-columns: 1fr;
          }

          .variables-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ColorSystemDemo;
