import React, { useState, useEffect } from 'react';
import { DynamicBackground } from './DynamicBackground';
import { AnimationTheme } from '../types/AnimationTypes';

interface MinimalistAnimationDemoProps {
  className?: string;
}

export const MinimalistAnimationDemo: React.FC<MinimalistAnimationDemoProps> = ({
  className = ''
}) => {
  const [currentTheme, setCurrentTheme] = useState<AnimationTheme>('bubbles');
  const [sampleTexts] = useState([
    'A gentle rain falls softly on the window, each droplet carrying stories of distant clouds',
    'Bubbles of joy dance in the morning light, shimmering with childlike wonder',
    'Stars whisper ancient secrets across the vast cosmic tapestry of night',
    'Geometric patterns emerge from the digital realm, precise and endlessly beautiful',
    'Snowflakes drift silently earthward, each one a unique crystal masterpiece'
  ]);
  const [currentText, setCurrentText] = useState(sampleTexts[0]);
  const [showControls, setShowControls] = useState(false);

  useEffect(() => {
    // Cycle through sample texts for demonstration
    const interval = setInterval(() => {
      setCurrentText(prev => {
        const currentIndex = sampleTexts.indexOf(prev);
        return sampleTexts[(currentIndex + 1) % sampleTexts.length];
      });
    }, 8000);

    return () => clearInterval(interval);
  }, [sampleTexts]);

  const themeOptions: { value: AnimationTheme; label: string; description: string }[] = [
    { value: 'bubbles', label: 'Bubbles', description: 'Joyful floating spheres' },
    { value: 'rain', label: 'Rain', description: 'Melancholic falling drops' },
    { value: 'snow', label: 'Snow', description: 'Gentle winter crystals' },
    { value: 'galaxy', label: 'Galaxy', description: 'Mystical cosmic particles' },
    { value: 'geometric', label: 'Geometric', description: 'Modern abstract shapes' },
    { value: 'fireflies', label: 'Fireflies', description: 'Romantic glowing lights' },
    { value: 'waves', label: 'Waves', description: 'Dynamic flowing motion' },
    { value: 'stars', label: 'Stars', description: 'Twinkling celestial points' }
  ];

  return (
    <div className={`minimalist-animation-demo ${className}`}>
      {/* Background Animation */}
      <DynamicBackground 
        text={currentText}
        theme={currentTheme}
        autoDetect={!showControls} // Auto-detect when controls are hidden
        showControls={showControls}
        className="demo-background"
      />
      
      {/* Content Overlay */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        padding: '40px',
        maxWidth: '800px',
        margin: '0 auto',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderRadius: '20px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
        marginTop: '80px'
      }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontWeight: '300',
          marginBottom: '1rem',
          color: '#333',
          textAlign: 'center'
        }}>
          Minimalist Background Animations
        </h2>
        
        <p style={{
          fontSize: '1.1rem',
          lineHeight: '1.6',
          color: '#666',
          textAlign: 'center',
          marginBottom: '2rem',
          fontStyle: 'italic'
        }}>
          "{currentText}"
        </p>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <button
            onClick={() => setShowControls(!showControls)}
            style={{
              padding: '12px 24px',
              backgroundColor: showControls ? '#667eea' : 'transparent',
              color: showControls ? 'white' : '#667eea',
              border: '2px solid #667eea',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {showControls ? 'Hide Controls' : 'Show Controls'}
          </button>
        </div>

        {!showControls && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginTop: '2rem'
          }}>
            {themeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setCurrentTheme(option.value)}
                onMouseEnter={(e) => {
                  if (currentTheme !== option.value) {
                    e.currentTarget.style.borderColor = '#667eea';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentTheme !== option.value) {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                  }
                }}
                style={{
                  padding: '16px',
                  backgroundColor: currentTheme === option.value ? 'rgba(102, 126, 234, 0.1)' : 'transparent',
                  border: currentTheme === option.value ? '2px solid #667eea' : '2px solid #e2e8f0',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  color: currentTheme === option.value ? '#667eea' : '#333',
                  marginBottom: '4px'
                }}>
                  {option.label}
                </div>
                <div style={{
                  fontSize: '0.9rem',
                  color: '#666'
                }}>
                  {option.description}
                </div>
              </button>
            ))}
          </div>
        )}

        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          backgroundColor: 'rgba(248, 250, 252, 0.8)',
          borderRadius: '12px',
          fontSize: '0.9rem',
          color: '#666'
        }}>
          <h3 style={{ marginBottom: '1rem', color: '#333', fontSize: '1.2rem', fontWeight: '600' }}>
            Features:
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', lineHeight: '1.6' }}>
            <li><strong>Auto-detection:</strong> Themes automatically match your text content</li>
            <li><strong>Performance-adaptive:</strong> Particle count adjusts based on your device capabilities</li>
            <li><strong>Interactive:</strong> Click or touch to create ripple effects</li>
            <li><strong>Minimalist design:</strong> Subtle, non-distracting visual effects</li>
            <li><strong>WebGL acceleration:</strong> Smooth 60fps when supported</li>
            <li><strong>Responsive:</strong> Scales beautifully on all screen sizes</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MinimalistAnimationDemo;
