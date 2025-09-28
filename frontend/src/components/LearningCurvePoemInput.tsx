import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// SVG Icons (no emoji policy)
const PenIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
    <path d="m15 5 4 4"/>
  </svg>
);

const SparklesIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z"/>
  </svg>
);

const RefreshIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
    <path d="M21 3v5h-5"/>
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
    <path d="M3 21v-5h5"/>
  </svg>
);

const AlertIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

interface LearningCurvePoemInputProps {
  onSubmit: (verb: string, adjective: string, noun: string) => Promise<void>;
  loading: boolean;
  error?: string | null;
}

// Word suggestions for inspiration
const WORD_SUGGESTIONS = {
  verbs: [
    { word: 'dance', category: 'Movement' },
    { word: 'whisper', category: 'Communication' },
    { word: 'soar', category: 'Movement' },
    { word: 'shimmer', category: 'Light' },
    { word: 'embrace', category: 'Connection' },
    { word: 'wander', category: 'Journey' },
    { word: 'bloom', category: 'Growth' },
    { word: 'sparkle', category: 'Light' },
  ],
  adjectives: [
    { word: 'ethereal', category: 'Mystical' },
    { word: 'vibrant', category: 'Energy' },
    { word: 'serene', category: 'Calm' },
    { word: 'luminous', category: 'Light' },
    { word: 'mysterious', category: 'Mystical' },
    { word: 'gentle', category: 'Soft' },
    { word: 'radiant', category: 'Light' },
    { word: 'melodic', category: 'Sound' },
  ],
  nouns: [
    { word: 'moonlight', category: 'Nature' },
    { word: 'ocean', category: 'Nature' },
    { word: 'forest', category: 'Nature' },
    { word: 'melody', category: 'Sound' },
    { word: 'dream', category: 'Abstract' },
    { word: 'shadow', category: 'Light' },
    { word: 'starlight', category: 'Nature' },
    { word: 'whisper', category: 'Sound' },
  ],
};

const LearningCurvePoemInput: React.FC<LearningCurvePoemInputProps> = ({
  onSubmit,
  loading,
  error
}) => {
  const [verb, setVerb] = useState('');
  const [adjective, setAdjective] = useState('');
  const [noun, setNoun] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [focusedField, setFocusedField] = useState<'verb' | 'adjective' | 'noun' | null>(null);

  // Auto-focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      const firstInput = document.querySelector('.word-input') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Check if form is valid
  const isFormValid = verb.trim() && adjective.trim() && noun.trim();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || loading) return;

    try {
      await onSubmit(verb.trim(), adjective.trim(), noun.trim());
    } catch (error) {
      console.error('Failed to generate poem:', error);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (word: string, type: 'verb' | 'adjective' | 'noun') => {
    switch (type) {
      case 'verb':
        setVerb(word);
        break;
      case 'adjective':
        setAdjective(word);
        break;
      case 'noun':
        setNoun(word);
        break;
    }
    setFocusedField(null);
  };

  // Generate random words
  const handleRandomize = () => {
    const randomVerb = WORD_SUGGESTIONS.verbs[Math.floor(Math.random() * WORD_SUGGESTIONS.verbs.length)];
    const randomAdjective = WORD_SUGGESTIONS.adjectives[Math.floor(Math.random() * WORD_SUGGESTIONS.adjectives.length)];
    const randomNoun = WORD_SUGGESTIONS.nouns[Math.floor(Math.random() * WORD_SUGGESTIONS.nouns.length)];

    setVerb(randomVerb.word);
    setAdjective(randomAdjective.word);
    setNoun(randomNoun.word);
  };

  const getSuggestionsForField = (field: 'verb' | 'adjective' | 'noun') => {
    return WORD_SUGGESTIONS[`${field}s` as keyof typeof WORD_SUGGESTIONS];
  };

  return (
    <div className="poem-input-container">
      {/* Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        className="poem-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="form-instructions"
        >
          <p className="text-body-md text-secondary">
            Enter three words to create your unique poem
          </p>
        </motion.div>

        {/* Word Inputs */}
        <div className="word-inputs-grid">
          {/* Verb Input */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="word-input-group"
          >
            <label className="form-label">
              <span className="label-text">Verb</span>
              <span className="label-description">An action word</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={verb}
                onChange={(e) => setVerb(e.target.value)}
                onFocus={() => setFocusedField('verb')}
                onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                placeholder="dance, whisper, soar..."
                className="input input-lg word-input"
                disabled={loading}
                maxLength={20}
              />
              {focusedField === 'verb' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="suggestions-dropdown"
                >
                  {getSuggestionsForField('verb').map((suggestion, index) => (
                    <button
                      key={suggestion.word}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.word, 'verb')}
                      className="suggestion-item"
                    >
                      <span className="suggestion-word">{suggestion.word}</span>
                      <span className="suggestion-category">{suggestion.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Adjective Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="word-input-group"
          >
            <label className="form-label">
              <span className="label-text">Adjective</span>
              <span className="label-description">A describing word</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={adjective}
                onChange={(e) => setAdjective(e.target.value)}
                onFocus={() => setFocusedField('adjective')}
                onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                placeholder="ethereal, vibrant, serene..."
                className="input input-lg word-input"
                disabled={loading}
                maxLength={20}
              />
              {focusedField === 'adjective' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="suggestions-dropdown"
                >
                  {getSuggestionsForField('adjective').map((suggestion, index) => (
                    <button
                      key={suggestion.word}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.word, 'adjective')}
                      className="suggestion-item"
                    >
                      <span className="suggestion-word">{suggestion.word}</span>
                      <span className="suggestion-category">{suggestion.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Noun Input */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="word-input-group"
          >
            <label className="form-label">
              <span className="label-text">Noun</span>
              <span className="label-description">A person, place, or thing</span>
            </label>
            <div className="input-wrapper">
              <input
                type="text"
                value={noun}
                onChange={(e) => setNoun(e.target.value)}
                onFocus={() => setFocusedField('noun')}
                onBlur={() => setTimeout(() => setFocusedField(null), 150)}
                placeholder="moonlight, ocean, dream..."
                className="input input-lg word-input"
                disabled={loading}
                maxLength={20}
              />
              {focusedField === 'noun' && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="suggestions-dropdown"
                >
                  {getSuggestionsForField('noun').map((suggestion, index) => (
                    <button
                      key={suggestion.word}
                      type="button"
                      onClick={() => handleSuggestionClick(suggestion.word, 'noun')}
                      className="suggestion-item"
                    >
                      <span className="suggestion-word">{suggestion.word}</span>
                      <span className="suggestion-category">{suggestion.category}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="form-actions"
        >
          {/* Randomize Button */}
          <button
            type="button"
            onClick={handleRandomize}
            disabled={loading}
            className="btn btn-ghost"
          >
            <RefreshIcon size={16} />
            Surprise Me
          </button>

          {/* Generate Button */}
          <button
            type="submit"
            disabled={!isFormValid || loading}
            className="btn btn-primary btn-lg generate-button"
          >
            {loading ? (
              <>
                <div className="loading-spinner" />
                Creating...
              </>
            ) : (
              <>
                <SparklesIcon size={16} />
                Create Poem
              </>
            )}
          </button>
        </motion.div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="alert alert-error"
            >
              <AlertIcon size={16} />
              <span>{error}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.form>

      {/* Examples Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="examples-section"
      >
        <button
          onClick={() => setShowSuggestions(!showSuggestions)}
          className="examples-toggle"
        >
          Need inspiration? View examples
        </button>

        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="examples-content"
            >
              <div className="examples-grid">
                <div className="example-category">
                  <h4 className="text-caption text-tertiary">Verbs</h4>
                  <div className="example-words">
                    {WORD_SUGGESTIONS.verbs.slice(0, 4).map((word) => (
                      <button
                        key={word.word}
                        onClick={() => setVerb(word.word)}
                        className="example-word"
                      >
                        {word.word}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="example-category">
                  <h4 className="text-caption text-tertiary">Adjectives</h4>
                  <div className="example-words">
                    {WORD_SUGGESTIONS.adjectives.slice(0, 4).map((word) => (
                      <button
                        key={word.word}
                        onClick={() => setAdjective(word.word)}
                        className="example-word"
                      >
                        {word.word}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="example-category">
                  <h4 className="text-caption text-tertiary">Nouns</h4>
                  <div className="example-words">
                    {WORD_SUGGESTIONS.nouns.slice(0, 4).map((word) => (
                      <button
                        key={word.word}
                        onClick={() => setNoun(word.word)}
                        className="example-word"
                      >
                        {word.word}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LearningCurvePoemInput;