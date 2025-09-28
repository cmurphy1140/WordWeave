import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  InitialLoadingSequence,
  GenerationLoading,
  PoemSkeleton,
  ContentSkeleton,
  ErrorState
} from './LoadingStates';

type DemoSection = 'initial' | 'generation' | 'skeleton' | 'error' | 'showcase';
type GenerationPhase = 'gathering' | 'weaving' | 'painting' | 'revealing';
type ErrorType = '404' | '500' | 'network' | 'timeout' | 'generic';

interface DemoControlsProps {
  currentSection: DemoSection;
  onSectionChange: (section: DemoSection) => void;
}

const DemoControls: React.FC<DemoControlsProps> = ({ currentSection, onSectionChange }) => {
  const sections = [
    { id: 'initial', label: 'Initial Loading', icon: '🚀' },
    { id: 'generation', label: 'Generation States', icon: '✨' },
    { id: 'skeleton', label: 'Skeleton Screens', icon: '💀' },
    { id: 'error', label: 'Error States', icon: '❌' },
    { id: 'showcase', label: 'Full Showcase', icon: '🎭' }
  ] as const;

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      background: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      borderRadius: '12px',
      padding: '1rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
      zIndex: 1001,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', fontWeight: '600' }}>
        Demo Controls
      </h3>
      {sections.map(section => (
        <motion.button
          key={section.id}
          onClick={() => onSectionChange(section.id as DemoSection)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            padding: '0.5rem 0.75rem',
            border: 'none',
            borderRadius: '8px',
            background: currentSection === section.id ? '#667eea' : 'transparent',
            color: currentSection === section.id ? 'white' : '#4a5568',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease'
          }}
        >
          <span>{section.icon}</span>
          {section.label}
        </motion.button>
      ))}
    </div>
  );
};

const InitialLoadingDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      <InitialLoadingSequence 
        isVisible={isActive}
        onComplete={() => console.log('Initial loading complete!')}
      >
        <div style={{ 
          padding: '1rem', 
          background: 'rgba(255, 255, 255, 0.8)', 
          borderRadius: '8px', 
          margin: '1rem 0' 
        }}>
          <p>Welcome to WordWeave!</p>
        </div>
        <div style={{ 
          padding: '0.75rem 1.5rem', 
          background: 'linear-gradient(45deg, #667eea, #764ba2)', 
          color: 'white', 
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer'
        }}>
          Get Started
        </div>
      </InitialLoadingSequence>
    </div>
  );
};

const GenerationDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [currentPhase, setCurrentPhase] = useState<GenerationPhase>('gathering');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const phases: GenerationPhase[] = ['gathering', 'weaving', 'painting', 'revealing'];
    let phaseIndex = 0;
    let progressValue = 0;

    const interval = setInterval(() => {
      progressValue += 5;
      setProgress(progressValue);

      if (progressValue >= 100) {
        progressValue = 0;
        phaseIndex = (phaseIndex + 1) % phases.length;
        setCurrentPhase(phases[phaseIndex]);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
    }}>
      <GenerationLoading
        currentPhase={isActive ? currentPhase : null}
        progress={progress}
      />
    </div>
  );
};

const SkeletonDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [variant, setVariant] = useState<'card' | 'list' | 'grid'>('card');

  useEffect(() => {
    if (!isActive) return;

    const variants: Array<'card' | 'list' | 'grid'> = ['card', 'list', 'grid'];
    let variantIndex = 0;

    const interval = setInterval(() => {
      variantIndex = (variantIndex + 1) % variants.length;
      setVariant(variants[variantIndex]);
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div style={{
      minHeight: '100vh',
      padding: '2rem',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div style={{ flex: 1 }}>
        <PoemSkeleton isVisible={isActive} linesCount={6} />
      </div>
      
      <div style={{ 
        background: 'rgba(255, 255, 255, 0.1)', 
        borderRadius: '12px', 
        padding: '1.5rem',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ color: 'white', marginBottom: '1rem', textAlign: 'center' }}>
          Content Skeleton - {variant.toUpperCase()}
        </h3>
        <ContentSkeleton isVisible={isActive} variant={variant} />
      </div>
    </div>
  );
};

const ErrorDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [errorType, setErrorType] = useState<ErrorType>('404');

  useEffect(() => {
    if (!isActive) return;

    const types: ErrorType[] = ['404', '500', 'network', 'timeout', 'generic'];
    let typeIndex = 0;

    const interval = setInterval(() => {
      typeIndex = (typeIndex + 1) % types.length;
      setErrorType(types[typeIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      padding: '2rem'
    }}>
      <ErrorState
        type={errorType}
        isVisible={isActive}
        onRetry={() => console.log(`Retrying ${errorType} error...`)}
      />
    </div>
  );
};

const ShowcaseDemo: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const [stage, setStage] = useState<'initial' | 'generation' | 'skeleton' | 'success'>('initial');

  useEffect(() => {
    if (!isActive) return;

    const stages = ['initial', 'generation', 'skeleton', 'success'] as const;
    let stageIndex = 0;

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        stageIndex = (stageIndex + 1) % stages.length;
        setStage(stages[stageIndex]);
      }, 4000);

      return () => clearInterval(interval);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isActive]);

  const renderStage = () => {
    switch (stage) {
      case 'initial':
        return (
          <InitialLoadingSequence 
            isVisible={true}
            onComplete={() => setStage('generation')}
          >
            <div style={{ 
              padding: '1rem', 
              background: 'rgba(255, 255, 255, 0.8)', 
              borderRadius: '8px' 
            }}>
              Starting your poetic journey...
            </div>
          </InitialLoadingSequence>
        );
      
      case 'generation':
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          }}>
            <GenerationLoading
              currentPhase="weaving"
              progress={65}
            />
          </div>
        );
      
      case 'skeleton':
        return (
          <div style={{
            minHeight: '100vh',
            padding: '2rem',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
          }}>
            <PoemSkeleton isVisible={true} linesCount={8} />
          </div>
        );
      
      case 'success':
        return (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            textAlign: 'center',
            fontSize: '2rem',
            fontWeight: 'bold'
          }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              ✨ Your poem is ready! ✨
            </motion.div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return <>{renderStage()}</>;
};

export const LoadingStatesDemo: React.FC = () => {
  const [currentSection, setCurrentSection] = useState<DemoSection>('initial');

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'initial':
        return <InitialLoadingDemo isActive={true} />;
      case 'generation':
        return <GenerationDemo isActive={true} />;
      case 'skeleton':
        return <SkeletonDemo isActive={true} />;
      case 'error':
        return <ErrorDemo isActive={true} />;
      case 'showcase':
        return <ShowcaseDemo isActive={true} />;
      default:
        return <InitialLoadingDemo isActive={true} />;
    }
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <DemoControls
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />
      
      <main style={{ minHeight: '100vh' }}>
        {renderCurrentSection()}
      </main>
    </div>
  );
};

export default LoadingStatesDemo;
