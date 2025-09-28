import React, { useState } from 'react';
import { motion } from 'framer-motion';
import DynamicBackground from '../components/DynamicBackground';
import { AnimationTheme } from '../types/AnimationTypes';
import '../styles/animation-showcase.css';

const AnimationShowcasePage: React.FC = () => {
  const [currentText, setCurrentText] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<AnimationTheme>('bubbles');
  const [selectedMood, setSelectedMood] = useState<'joyful' | 'melancholic' | 'mystical' | 'modern' | 'romantic' | 'energetic'>('joyful');
  const [selectedIntensity, setSelectedIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  const sampleTexts = [
    {
      text: "Bubbles float gently in the warm summer air, carrying dreams and laughter to the sky above.",
      theme: 'bubbles' as AnimationTheme,
      mood: 'joyful' as const
    },
    {
      text: "Snow falls silently through the cold winter night, each flake a whisper of memories long forgotten.",
      theme: 'snow' as AnimationTheme,
      mood: 'melancholic' as const
    },
    {
      text: "Stars dance in the cosmic void, ancient guardians of mysteries beyond human comprehension.",
      theme: 'galaxy' as AnimationTheme,
      mood: 'mystical' as const
    },
    {
      text: "Geometric patterns emerge from the digital realm, precise algorithms painting abstract beauty.",
      theme: 'geometric' as AnimationTheme,
      mood: 'modern' as const
    },
    {
      text: "Fireflies twinkle in the twilight garden, tiny beacons of hope in the gathering darkness.",
      theme: 'fireflies' as AnimationTheme,
      mood: 'romantic' as const
    },
    {
      text: "Waves crash against the shore with relentless energy, the ocean's eternal dance of power and grace.",
      theme: 'waves' as AnimationTheme,
      mood: 'energetic' as const
    }
  ];

  const handleSampleText = (sample: typeof sampleTexts[0]) => {
    setCurrentText(sample.text);
    setSelectedTheme(sample.theme);
    setSelectedMood(sample.mood);
  };

  return (
    <div className="animation-showcase">
      <DynamicBackground 
        text={currentText}
        theme={selectedTheme}
        mood={selectedMood}
        intensity={selectedIntensity}
        autoDetect={false}
        showControls={true}
      />
      
      <motion.div 
        className="showcase-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="showcase-header">
          <h1>Dynamic Background Animation System</h1>
          <p>Experience how words come alive through interactive particle animations</p>
        </div>

        <div className="showcase-controls">
          <div className="control-section">
            <h3>Sample Texts</h3>
            <div className="sample-texts">
              {sampleTexts.map((sample, index) => (
                <button
                  key={index}
                  className={`sample-button ${currentText === sample.text ? 'active' : ''}`}
                  onClick={() => handleSampleText(sample)}
                >
                  {sample.theme.charAt(0).toUpperCase() + sample.theme.slice(1)} - {sample.mood}
                </button>
              ))}
            </div>
          </div>

          <div className="control-section">
            <h3>Custom Text</h3>
            <textarea
              value={currentText}
              onChange={(e) => setCurrentText(e.target.value)}
              placeholder="Enter your own text to see how the animation adapts..."
              className="text-input"
              rows={4}
            />
          </div>

          <div className="control-section">
            <h3>Manual Controls</h3>
            <div className="manual-controls">
              <div className="control-group">
                <label>Theme:</label>
                <select 
                  value={selectedTheme} 
                  onChange={(e) => setSelectedTheme(e.target.value as AnimationTheme)}
                >
                  <option value="bubbles">Bubbles</option>
                  <option value="snow">Snow</option>
                  <option value="galaxy">Galaxy</option>
                  <option value="geometric">Geometric</option>
                  <option value="fireflies">Fireflies</option>
                  <option value="waves">Waves</option>
                  <option value="stars">Stars</option>
                </select>
              </div>

              <div className="control-group">
                <label>Mood:</label>
                <select 
                  value={selectedMood} 
                  onChange={(e) => setSelectedMood(e.target.value as any)}
                >
                  <option value="joyful">Joyful</option>
                  <option value="melancholic">Melancholic</option>
                  <option value="mystical">Mystical</option>
                  <option value="modern">Modern</option>
                  <option value="romantic">Romantic</option>
                  <option value="energetic">Energetic</option>
                </select>
              </div>

              <div className="control-group">
                <label>Intensity:</label>
                <select 
                  value={selectedIntensity} 
                  onChange={(e) => setSelectedIntensity(e.target.value as any)}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
          </div>

          <div className="control-section">
            <h3>Features</h3>
            <ul className="features-list">
              <li>Automatic theme detection from text content</li>
              <li>7 different particle animation types</li>
              <li>Interactive mouse/touch effects</li>
              <li>Performance-adaptive particle scaling</li>
              <li>WebGL shader support for advanced effects</li>
              <li>Responsive design for all devices</li>
              <li>60fps smooth animations</li>
            </ul>
          </div>
        </div>
      </motion.div>

    </div>
  );
};

export default AnimationShowcasePage;