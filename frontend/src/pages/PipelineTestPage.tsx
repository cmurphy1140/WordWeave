import React from 'react';
import { motion } from 'framer-motion';
import PipelineTest from '../components/PipelineTest';

const PipelineTestPage: React.FC = () => {
  return (
    <motion.div
      className="pipeline-test-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6 }}
    >
      <div className="page-container">
        <motion.header 
          className="page-header"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h1>Pipeline Test</h1>
          <p>Complete frontend-to-backend testing with real-time monitoring</p>
        </motion.header>

        <motion.main
          className="page-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <PipelineTest />
        </motion.main>
      </div>
    </motion.div>
  );
};

export default PipelineTestPage;


