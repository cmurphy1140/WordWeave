import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { usePoem } from '../hooks/usePoem';
import LayoutManager from '../components/layouts/LayoutManager';
import { 
  ArrowLeftIcon,
  RefreshIcon,
  DownloadIcon,
  HeartIcon
} from '../components/icons';
import '../styles/generated-poem-page.css';

const GeneratedPoemPage: React.FC = () => {
  const navigate = useNavigate();
  const { poemData, clearPoem, retryGeneration } = usePoem();
  
  const [isLiked, setIsLiked] = useState(false);

  // Redirect to home if no poem data
  useEffect(() => {
    if (!poemData || !poemData.poem) {
      navigate('/');
    }
  }, [poemData, navigate]);

  // Get poem lines
  const poemLines = poemData?.poem ? 
    poemData.poem.split('\n').filter(line => line.trim().length > 0) : [];

  const handleBackToHome = () => {
    clearPoem();
    navigate('/');
  };

  const handleGenerateNew = () => {
    clearPoem();
    navigate('/');
  };

  const handleRetryGeneration = () => {
    retryGeneration();
  };

  const handleDownload = () => {
    if (!poemData?.poem) return;
    
    const element = document.createElement('a');
    const file = new Blob([poemData.poem], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'wordweave-poem.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };


  if (!poemData || !poemData.poem) {
    return null; // Will redirect to home
  }

  return (
    <motion.div
      className="generated-poem-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <motion.header
        className="poem-page-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <div className="header-content">
          <motion.button
            className="back-button"
            onClick={handleBackToHome}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowLeftIcon className="icon-sm" />
            Back to Home
          </motion.button>
          
          <div className="header-title">
            <h1 style={{ 
              fontFamily: "'Crimson Text', serif",
              fontSize: '1.5rem',
              fontWeight: '400',
              color: '#1a1a1a',
              margin: 0
            }}>
              Your Generated Poem
            </h1>
          </div>
          
          <div className="header-actions">
            <motion.button
              className={`action-button ${isLiked ? 'liked' : ''}`}
              onClick={() => setIsLiked(!isLiked)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title="Like this poem"
            >
              <HeartIcon className="icon-sm" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <motion.main
        className="poem-page-main"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Poem Display */}
        <div className="poem-display-section">
          <motion.div
            className="poem-content"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <LayoutManager
              lines={poemLines}
              className="poem-layout-manager"
              autoSwitchInterval={0}
              onLayoutChange={(layout) => {
                console.log(`Layout changed to: ${layout}`);
              }}
            />
          </motion.div>
        </div>

        {/* Poem Actions */}
        <motion.div
          className="poem-actions-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="actions-grid">
            <motion.button
              className="action-card"
              onClick={handleGenerateNew}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshIcon className="icon-md" />
              <span>Create New Poem</span>
            </motion.button>
            
            <motion.button
              className="action-card"
              onClick={handleRetryGeneration}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshIcon className="icon-md" />
              <span>Regenerate</span>
            </motion.button>
            
            <motion.button
              className="action-card"
              onClick={handleDownload}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <DownloadIcon className="icon-md" />
              <span>Download</span>
            </motion.button>
          </div>
        </motion.div>

      </motion.main>

      {/* Footer */}
      <motion.footer
        className="poem-page-footer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <p style={{ 
          fontSize: '0.9rem',
          color: '#999',
          textAlign: 'center',
          margin: 0
        }}>
          Made with care for the magic of words
        </p>
      </motion.footer>
    </motion.div>
  );
};

export default GeneratedPoemPage;
