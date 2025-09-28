import React from 'react';
import { motion } from 'framer-motion';
import PoemInput from '../components/PoemInput';
import PoemDisplay from '../components/PoemDisplay';
import ProgressBar from '../components/ProgressBar';
import { usePoem } from '../hooks/usePoem';
import '../styles/homepage-dial.css';
import '../styles/progress-and-poem-display.css';

const HomePage: React.FC = () => {
  const { poemData, loading, error, generatePoem, clearPoem } = usePoem();

  return (
    <motion.div
      className="home-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Introduction Section - Clean like The Dial */}
      <motion.section 
        className="intro-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <h2 style={{ 
          fontFamily: "'Crimson Text', serif", 
          fontSize: '1.5rem', 
          fontWeight: '400',
          color: '#1a1a1a',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          Create Poetry with AI
        </h2>
        <p style={{
          fontSize: '1rem',
          color: '#666',
          lineHeight: '1.7',
          maxWidth: '500px',
          margin: '0 auto 3rem auto',
          textAlign: 'center'
        }}>
          Enter three words and watch as artificial intelligence weaves them into beautiful poetry, 
          complete with subtle animations that respond to the mood and theme of your creation.
        </p>
      </motion.section>

      {/* Progress Bar Section */}
      <ProgressBar loading={loading} className="home-progress-bar" />

      {/* Poem Generator Section */}
            <motion.section 
              className="generator-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        <div style={{ 
          backgroundColor: 'transparent',
          border: 'none',
          padding: '0',
          boxShadow: 'none'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ 
              fontFamily: "'Crimson Text', serif",
              fontSize: '1.25rem',
              fontWeight: '400',
              color: '#1a1a1a',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              Poem Generator
            </h3>
            <p style={{
              fontSize: '0.9rem',
              color: '#666',
              textAlign: 'center',
              marginBottom: '2rem'
            }}>
              Enter three words to begin
            </p>
          </div>
          <PoemInput 
            generatePoem={generatePoem}
            loading={loading}
            error={error}
            clearPoem={clearPoem}
          />
        </div>
      </motion.section>

      {/* Generated Poem Display Section */}
      <motion.section 
        className="poem-display-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        style={{ minHeight: '200px', position: 'relative' }}
      >
        {!poemData && !loading.isLoading && (
          <div className="poem-placeholder">
            <h3>Your Poem Will Appear Here</h3>
            <p>Enter three words above and click "Generate Poem" to see your personalized poem.</p>
          </div>
        )}
        <PoemDisplay 
          poemData={poemData} 
          loading={loading} 
          className="home-poem-display"
        />
      </motion.section>

    </motion.div>
  );
};

export default HomePage;


