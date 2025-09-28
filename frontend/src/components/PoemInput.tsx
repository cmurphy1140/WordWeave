import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WordInputs, LoadingState } from '../types';
import { 
  SmoothFade, 
  SmoothSlide, 
  SmoothHover,
  SmoothStagger,
  SmoothStaggerItem
} from './SmoothAnimations';
import { durations, easingCurves } from '../utils/easing';

interface PoemInputProps {
  generatePoem: (inputs: WordInputs) => Promise<void>;
  loading: LoadingState;
  error: string | null;
  clearPoem: () => void;
}

const PoemInput: React.FC<PoemInputProps> = ({ generatePoem, loading, error, clearPoem }) => {
  const [inputs, setInputs] = useState<WordInputs>({ verb: '', adjective: '', noun: '' });
  const [validationErrors, setValidationErrors] = useState<Partial<WordInputs>>({});
  const [focusedField, setFocusedField] = useState<keyof WordInputs | null>(null);

  // Handle input changes
  const handleInputChange = useCallback((field: keyof WordInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
  }, [validationErrors]);

  // Handle focus events
  const handleFocus = useCallback((field: keyof WordInputs) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Validate inputs
  const validateInputs = useCallback(() => {
    const errors: Partial<WordInputs> = {};
    
    if (!inputs.verb.trim()) {
      errors.verb = 'Please enter a verb';
    }
    
    if (!inputs.adjective.trim()) {
      errors.adjective = 'Please enter an adjective';
    }
    
    if (!inputs.noun.trim()) {
      errors.noun = 'Please enter a noun';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [inputs]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (validateInputs()) {
        await generatePoem(inputs);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  }, [inputs, validateInputs, generatePoem]);

  // Clear form
  const handleClear = useCallback(() => {
    setInputs({ verb: '', adjective: '', noun: '' });
    setValidationErrors({});
    clearPoem();
  }, [clearPoem]);

  // Check if form is valid
  const isFormValid = inputs.verb.trim() && inputs.adjective.trim() && inputs.noun.trim();

  // Input field configuration
  const inputFields: Array<{
    key: keyof WordInputs;
    label: string;
    placeholder: string;
    description: string;
  }> = [
    {
      key: 'verb',
      label: 'Verb',
      placeholder: 'dance, whisper, soar...',
      description: 'An action word that brings energy to your poem'
    },
    {
      key: 'adjective',
      label: 'Adjective',
      placeholder: 'ethereal, ancient, golden...',
      description: 'A descriptive word that adds color and mood'
    },
    {
      key: 'noun',
      label: 'Noun',
      placeholder: 'moonlight, forest, horizon...',
      description: 'A person, place, or thing that anchors your poem'
    }
  ];

  return (
    <SmoothFade
      isVisible={true}
      delay={0}
      duration={durations.normal}
      className="poem-input-container"
    >
      <motion.div
        className="poem-input-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: durations.normal,
          ease: easingCurves.material.standard
        }}
      >
        {/* Header */}
        <SmoothSlide
          direction="up"
          isVisible={true}
          delay={0.1}
          duration={durations.normal}
          className="card-header"
        >
          <h2 className="card-title">Create Your Poem</h2>
          <p className="card-subtitle">
            Enter three words to inspire a unique poem crafted just for you
          </p>
        </SmoothSlide>

        {/* Form */}
        <form onSubmit={handleSubmit} className="poem-form">
          <SmoothStagger staggerDelay={0.1} className="form-fields">
            {inputFields.map((field, index) => (
              <SmoothStaggerItem key={field.key}>
                <motion.div
                  className={`input-group ${focusedField === field.key ? 'focused' : ''}`}
                  animate={{
                    scale: focusedField === field.key ? 1.02 : 1,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: easingCurves.material.standard
                  }}
                >
                  <label htmlFor={field.key} className="input-label">
                    {field.label}
                  </label>
                  
                  <input
                    id={field.key}
                    type="text"
                    value={inputs[field.key]}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                    onFocus={() => handleFocus(field.key)}
                    onBlur={handleBlur}
                    className={`form-input ${validationErrors[field.key] ? 'input-error' : ''}`}
                    placeholder={field.placeholder}
                    disabled={loading.isLoading}
                    autoComplete="off"
                  />
                  
                  <p className="input-description">{field.description}</p>
                  
                  <AnimatePresence>
                    {validationErrors[field.key] && (
                      <motion.span
                        className="error-message"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                      >
                        {validationErrors[field.key]}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </SmoothStaggerItem>
            ))}
          </SmoothStagger>

          {/* Action Buttons */}
          <SmoothSlide
            direction="up"
            isVisible={true}
            delay={0.4}
            duration={durations.normal}
            className="form-actions"
          >
            <SmoothHover hoverType="poetic">
              <button
                type="button"
                onClick={handleClear}
                className="btn btn-secondary"
                disabled={loading.isLoading}
              >
                Clear
              </button>
            </SmoothHover>
            
            <SmoothHover hoverType="poetic">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!isFormValid || loading.isLoading}
              >
                {loading.isLoading ? (
                  <span className="loading-content">
                    <span className="loading-spinner"></span>
                    {loading.loadingText || 'Generating...'}
                  </span>
                ) : (
                  'Generate Poem'
                )}
              </button>
            </SmoothHover>
          </SmoothSlide>

          {/* Loading Progress */}
          <AnimatePresence>
            {loading.isLoading && loading.progress !== undefined && (
              <motion.div
                className="progress-container"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="progress-bar">
                  <motion.div
                    className="progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${loading.progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <p className="progress-text">
                  {loading.loadingText} ({Math.round(loading.progress)}%)
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div
                className="error-display"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.3,
                  ease: easingCurves.material.standard
                }}
              >
                <div className="error-icon">⚠️</div>
                <p className="error-text">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </SmoothFade>
  );
};

export default PoemInput;