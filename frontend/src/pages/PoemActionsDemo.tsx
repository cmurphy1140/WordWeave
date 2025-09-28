import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PoemActions from '../components/PoemActions';
import { PoemData } from '../types';
import '../styles/poem-actions.css';

const PoemActionsDemo: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Mock poem data for demo
  const mockPoemData: PoemData = {
    poem: `In gardens where the silence grows,
Between the shadow and the rose,
A whisper calls from distant dreams,
Where nothing is quite what it seems.

The moonlight dances on the leaves,
While autumn gently breathes and grieves,
Each moment holds a secret story,
Written in twilight's fading glory.`,
    metadata: {
      id: 'demo-poem-1',
      wordCount: 45,
      emotion: 'mystical',
      generationTime: 2.1,
      sentiment: 'contemplative and serene'
    },
    analysis: {
      visualRecommendations: {
        colors: {
          primary: '#4c1d95',
          secondary: '#7c3aed',
          accent: '#a855f7',
          background: '#faf5ff',
          gradient: ['#4c1d95', '#7c3aed', '#a855f7']
        },
        typography: {
          fontFamily: 'serif',
          fontSize: 'medium',
          fontWeight: 'normal',
          lineHeight: 1.8,
          letterSpacing: 'normal'
        },
        effects: {
          blur: false,
          glow: true,
          shadow: true,
          gradient: true
        }
      },
      themes: ['nature', 'mystery', 'twilight'],
      emotions: ['contemplative', 'mystical', 'serene'],
      confidence: 0.92
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className={`poem-actions-demo ${theme}`} style={{
      minHeight: '100vh',
      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
      color: theme === 'dark' ? '#f1f5f9' : '#1e293b',
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
      }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}
        >
          <h1 style={{
            fontSize: '3rem',
            fontWeight: '300',
            marginBottom: '1rem',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Sleek Poem Actions
          </h1>
          <p style={{
            fontSize: '1.2rem',
            opacity: 0.7,
            marginBottom: '2rem'
          }}>
            Beautiful SVG icons replace emojis for a modern, professional look
          </p>
          
          <button
            onClick={toggleTheme}
            style={{
              padding: '10px 20px',
              border: '1px solid',
              borderColor: theme === 'dark' ? '#374151' : '#e2e8f0',
              background: 'transparent',
              color: 'inherit',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              transition: 'all 0.2s ease'
            }}
          >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Theme
          </button>
        </motion.div>

        {/* Mock Poem Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          style={{
            background: theme === 'dark' 
              ? 'linear-gradient(135deg, rgba(51, 65, 85, 0.3), rgba(30, 41, 59, 0.5))'
              : 'linear-gradient(135deg, rgba(248, 250, 252, 0.8), rgba(255, 255, 255, 0.9))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: theme === 'dark'
              ? '0 20px 40px rgba(0, 0, 0, 0.3)'
              : '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}
        >
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            Sample Generated Poem
          </h2>
          
          <div style={{
            fontFamily: '"Crimson Text", Georgia, serif',
            fontSize: '1.2rem',
            lineHeight: '1.8',
            textAlign: 'center',
            marginBottom: '32px',
            padding: '24px',
            background: theme === 'dark' 
              ? 'rgba(0, 0, 0, 0.2)' 
              : 'rgba(255, 255, 255, 0.5)',
            borderRadius: '12px',
            whiteSpace: 'pre-line'
          }}>
            {mockPoemData.poem}
          </div>

          {/* This is where our new PoemActions component shines! */}
          <PoemActions 
            poemData={mockPoemData}
            onSave={() => console.log('Save clicked')}
            onShare={() => console.log('Share clicked')}
            onRegenerate={() => console.log('Regenerate clicked')}
            onEdit={() => console.log('Edit clicked')}
          />
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{
            marginTop: '60px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px'
          }}
        >
          <div style={{
            background: theme === 'dark' 
              ? 'rgba(51, 65, 85, 0.3)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>✨ SVG Icons</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Clean, scalable vector icons replace emojis for a professional appearance across all devices and screen resolutions.
            </p>
          </div>

          <div style={{
            background: theme === 'dark' 
              ? 'rgba(51, 65, 85, 0.3)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>🎨 Modern Design</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Glassmorphism effects, smooth animations, and thoughtful hover states create an engaging user experience.
            </p>
          </div>

          <div style={{
            background: theme === 'dark' 
              ? 'rgba(51, 65, 85, 0.3)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>📱 Responsive</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Adaptive layout and touch-friendly interactions work beautifully on mobile, tablet, and desktop.
            </p>
          </div>

          <div style={{
            background: theme === 'dark' 
              ? 'rgba(51, 65, 85, 0.3)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>♿ Accessible</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Proper focus management, keyboard navigation, and screen reader support ensure inclusivity.
            </p>
          </div>

          <div style={{
            background: theme === 'dark' 
              ? 'rgba(51, 65, 85, 0.3)'
              : 'rgba(248, 250, 252, 0.8)',
            borderRadius: '16px',
            padding: '24px',
            border: `1px solid ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}`
          }}>
            <h3 style={{ marginBottom: '16px', color: '#667eea' }}>⚡ Interactive</h3>
            <p style={{ opacity: 0.8, lineHeight: '1.6' }}>
              Smart state management with visual feedback - like buttons, bookmarks, and copy confirmations.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PoemActionsDemo;
