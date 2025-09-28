import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SparklesIcon, XIcon } from './icons/MinimalistIcons';

interface WordInput {
  value: string;
  placeholder: string;
  label: string;
}

interface MinimalistPoemInputProps {
  onSubmit: (words: string[]) => Promise<void>;
  loading?: boolean;
  className?: string;
}

const MinimalistPoemInput: React.FC<MinimalistPoemInputProps> = ({ 
  onSubmit, 
  loading = false, 
  className = '' 
}) => {
  const [words, setWords] = useState<WordInput[]>([
    { value: '', placeholder: 'Ocean', label: 'First word' },
    { value: '', placeholder: 'Dreams', label: 'Second word' },
    { value: '', placeholder: 'Journey', label: 'Third word' }
  ]);

  const [focused, setFocused] = useState<number | null>(null);
  const [showClearAll, setShowClearAll] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Update showClearAll when words change
  useEffect(() => {
    const hasWords = words.some(word => word.value.trim() !== '');
    setShowClearAll(hasWords);
  }, [words]);

  const updateWord = (index: number, value: string) => {
    setWords(prev => prev.map((word, i) => 
      i === index ? { ...word, value } : word
    ));
  };

  const clearAll = () => {
    setWords(prev => prev.map(word => ({ ...word, value: '' })));
    inputRefs.current[0]?.focus();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const wordValues = words.map(w => w.value.trim()).filter(Boolean);
    
    if (wordValues.length === 0) {
      inputRefs.current[0]?.focus();
      return;
    }

    await onSubmit(wordValues);
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (index < words.length - 1) {
        inputRefs.current[index + 1]?.focus();
      } else {
        handleSubmit(e);
      }
    } else if (e.key === 'Backspace' && words[index].value === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const canSubmit = words.some(word => word.value.trim() !== '') && !loading;

  return (
    <motion.div
      className={`minimalist-poem-input ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      style={{
        maxWidth: '600px',
        margin: '0 auto'
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          textAlign: 'center',
          marginBottom: 'var(--space-10)'
        }}
      >
        <h1 
          className="text-4xl font-light text-primary"
          style={{ 
            marginBottom: 'var(--space-4)',
            background: 'linear-gradient(135deg, var(--color-primary-700), var(--color-primary-500))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          WordWeave
        </h1>
        <p 
          className="text-lg text-secondary"
          style={{ 
            maxWidth: '400px',
            margin: '0 auto',
            lineHeight: 'var(--leading-relaxed)'
          }}
        >
          Transform words into poetry. Enter 1-3 inspiring words to create your unique poem.
        </p>
      </motion.div>

      {/* Input Form */}
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-2xl)',
          padding: 'var(--space-8)',
          border: '1px solid var(--border-light)',
          boxShadow: 'var(--shadow-lg)',
          position: 'relative'
        }}
      >
        {/* Clear All Button */}
        <AnimatePresence>
          {showClearAll && (
            <motion.button
              type="button"
              onClick={clearAll}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                position: 'absolute',
                top: 'var(--space-4)',
                right: 'var(--space-4)',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                zIndex: 1
              }}
              aria-label="Clear all words"
            >
              <XIcon size={16} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Word Inputs */}
        <div 
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-6)',
            marginBottom: 'var(--space-8)'
          }}
        >
          {words.map((word, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (index * 0.1), duration: 0.4 }}
              style={{ position: 'relative' }}
            >
              <label
                htmlFor={`word-${index}`}
                style={{
                  display: 'block',
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--font-medium)',
                  color: 'var(--text-secondary)',
                  marginBottom: 'var(--space-2)',
                  letterSpacing: 'var(--tracking-wide)'
                }}
              >
                {word.label}
              </label>
              
              <motion.div
                style={{
                  position: 'relative',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--surface-background)',
                  border: `2px solid ${focused === index ? 'var(--color-primary-400)' : 'var(--border-light)'}`,
                  transition: 'border-color var(--transition-fast)'
                }}
                whileFocus={{ scale: 1.01 }}
              >
                <input
                  ref={el => inputRefs.current[index] = el}
                  id={`word-${index}`}
                  type="text"
                  value={word.value}
                  onChange={(e) => updateWord(index, e.target.value)}
                  onFocus={() => setFocused(index)}
                  onBlur={() => setFocused(null)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  placeholder={word.placeholder}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: 'var(--space-4) var(--space-5)',
                    border: 'none',
                    borderRadius: 'var(--radius-xl)',
                    background: 'transparent',
                    fontSize: 'var(--text-lg)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    fontWeight: 'var(--font-medium)',
                    letterSpacing: 'var(--tracking-wide)'
                  }}
                  autoComplete="off"
                  spellCheck="false"
                />
                
                {/* Input highlight */}
                {focused === index && (
                  <motion.div
                    layoutId="input-highlight"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: 'var(--radius-xl)',
                      background: 'linear-gradient(135deg, var(--color-primary-100), var(--color-primary-50))',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Generate Button */}
        <motion.button
          type="submit"
          disabled={!canSubmit}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          whileHover={canSubmit ? { scale: 1.02, y: -1 } : {}}
          whileTap={canSubmit ? { scale: 0.98 } : {}}
          style={{
            width: '100%',
            padding: 'var(--space-4) var(--space-6)',
            background: canSubmit 
              ? 'linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))'
              : 'var(--color-gray-300)',
            color: canSubmit ? 'white' : 'var(--color-gray-500)',
            border: 'none',
            borderRadius: 'var(--radius-xl)',
            fontSize: 'var(--text-lg)',
            fontWeight: 'var(--font-semibold)',
            cursor: canSubmit ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 'var(--space-3)',
            minHeight: '56px',
            boxShadow: canSubmit ? 'var(--shadow-md)' : 'none',
            transition: 'all var(--transition-base)',
            letterSpacing: 'var(--tracking-wide)'
          }}
        >
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: 'linear' 
              }}
            >
              <SparklesIcon size={20} />
            </motion.div>
          ) : (
            <>
              <SparklesIcon size={20} />
              Generate Poem
            </>
          )}
        </motion.button>
      </motion.form>

      {/* Inspirational Examples */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        style={{
          marginTop: 'var(--space-8)',
          textAlign: 'center'
        }}
      >
        <p 
          style={{
            fontSize: 'var(--text-sm)',
            color: 'var(--text-tertiary)',
            marginBottom: 'var(--space-4)'
          }}
        >
          Try these inspiring combinations:
        </p>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
          justifyContent: 'center'
        }}>
          {[
            ['Ocean', 'Dreams', 'Infinite'],
            ['Moonlight', 'Whispers', 'Secret'],
            ['Forest', 'Ancient', 'Wisdom'],
            ['Stars', 'Journey', 'Hope']
          ].map((combo, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                combo.forEach((word, i) => {
                  if (i < words.length) updateWord(i, word);
                });
                inputRefs.current[0]?.focus();
              }}
              disabled={loading}
              style={{
                padding: 'var(--space-2) var(--space-4)',
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border-light)',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-secondary)',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: loading ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--surface-card)';
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'var(--surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-light)';
                }
              }}
            >
              {combo.join(' • ')}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MinimalistPoemInput;
