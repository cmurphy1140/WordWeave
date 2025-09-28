# WordWeave Text Animation Components Guide

A comprehensive collection of 5 React components using Framer Motion for beautiful poem text animations. Each component is optimized for performance with GPU-acceleration, theme context integration, and accessibility support.

## 🎯 Components Overview

### 1. TypewriterText
**Purpose**: Simulates typing effect with adjustable speed
**Best for**: Poem reveals, dramatic introductions, interactive demos

### 2. FadeInWords  
**Purpose**: Reveals text word-by-word with fade transitions
**Best for**: Gentle poem reveals, emphasis on individual words

### 3. StaggeredLines
**Purpose**: Animates poem lines with various transition types
**Best for**: Stanza-by-stanza reveals, structured poems

### 4. GlowingText
**Purpose**: Adds emotional glow effects based on sentiment intensity  
**Best for**: Emotionally charged poems, mood visualization

### 5. MorphingText
**Purpose**: Smooth transitions between different poems
**Best for**: Poem switching, remix animations, version comparisons

---

## 🚀 Quick Start

```typescript
import {
  TypewriterText,
  FadeInWords,
  StaggeredLines,
  GlowingText,
  MorphingText,
  AnimationPresets,
  AnimationUtils
} from '@/components/animations';

// Basic usage with theme integration
const PoemDisplay = ({ poem, animationType }) => {
  return (
    <div className="poem-container">
      {animationType === 'typewriter' && (
        <TypewriterText 
          text={poem.text}
          speed={3} // chars per second
          onComplete={() => console.log('Typing complete!')}
        />
      )}
    </div>
  );
};
```

---

## 📖 Detailed Component Usage

### TypewriterText Component

```typescript
interface TypewriterTextProps {
  text: string;                    // Text to animate
  speed?: number;                  // Characters per second (default: 3)
  startDelay?: number;             // Delay before starting (ms)
  onComplete?: () => void;         // Callback when done
  className?: string;              // CSS class
  isPaused?: boolean;              // Pause/play control
  showCursor?: boolean;            // Show blinking cursor
}
```

**Usage Examples:**

```typescript
// Basic typewriter
<TypewriterText 
  text="Hello, welcome to WordWeave!"
  speed={4}
/>

// With theme integration (auto-adjusts speed based on theme)
<TypewriterText 
  text={poem.text}
  onComplete={() => setAnimationComplete(true)}
/>

// Controlled animation
<TypewriterText 
  text={currentPoem}
  isPaused={isAppPaused}
  showCursor={showTypingCursor}
  startDelay={500}
/>
```

### FadeInWords Component

```typescript
interface FadeInWordsProps {
  text: string;                    // Text to animate
  staggerDelay?: number;           // Delay between words (seconds)
  wordDuration?: number;           // Animation duration per word
  startDelay?: number;             // Initial delay
  onComplete?: () => void;         // Completion callback
  className?: string;              // CSS class
  isPaused?: boolean;              // Pause control
  preserveSpaces?: boolean;        // Maintain original spacing
}
```

**Usage Examples:**

```typescript
// Gentle word reveal
<FadeInWords 
  text="Each word appears with gentle grace"
  staggerDelay={0.2}
  wordDuration={0.6}
/>

// Theme-aware timing
<FadeInWords 
  text={poem.text}
  preserveSpaces={true}
  onComplete={() => startNextAnimation()}
/>

// Interactive control
<FadeInWords 
  text={displayText}
  isPaused={userPaused}
  staggerDelay={userSpeed}
/>
```

### StaggeredLines Component

```typescript
interface StaggeredLinesProps {
  text: string;                    // Multi-line text (use \n for breaks)
  lineStagger?: number;            // Delay between lines
  lineDuration?: number;           // Animation duration per line
  startDelay?: number;             // Initial delay
  onComplete?: () => void;         // Completion callback
  className?: string;              // CSS class
  isPaused?: boolean;              // Pause control
  animationType?: 'slide' | 'fade' | 'bounce' | 'scale'; // Animation style
}
```

**Usage Examples:**

```typescript
// Haiku with slide animation
<StaggeredLines 
  text={`Cherry blossoms fall,
Silent petals drift away—
Spring's gentle goodbye.`}
  animationType="slide"
  lineStagger={0.8}
/>

// Dramatic poem reveal
<StaggeredLines 
  text={dramaticPoem}
  animationType="bounce"
  lineDuration={1.2}
  onComplete={() => showPoemActions()}
/>

// Theme-responsive animation
<StaggeredLines 
  text={poem.text}
  // lineStagger auto-calculated from theme
  className="poem-stanzas"
/>
```

### GlowingText Component

```typescript
interface GlowingTextProps {
  text: string;                    // Text to glow
  emotionIntensity?: number;       // 0-1 intensity level
  glowColor?: string;              // Hex or CSS color
  pulseSpeed?: number;             // Pulse cycle duration
  className?: string;              // CSS class
  isPaused?: boolean;              // Pause glow effect
  maxGlowRadius?: number;          // Maximum glow size
  enableParticles?: boolean;       // Floating particles effect
}
```

**Usage Examples:**

```typescript
// Emotion-based glow
<GlowingText 
  text="Passionate love burns eternal"
  emotionIntensity={0.9}
  glowColor="#ff6b6b"
  enableParticles={true}
/>

// Theme-integrated emotional display
<GlowingText 
  text={poem.text}
  // emotionIntensity from theme analysis
  // glowColor from theme palette
/>

// Interactive intensity
<GlowingText 
  text={selectedLine}
  emotionIntensity={userEmotionLevel}
  isPaused={!isPlaying}
  pulseSpeed={2.5}
/>
```

### MorphingText Component

```typescript
interface MorphingTextProps {
  currentText: string;             // Current text to display
  previousText?: string;           // Previous text for smooth transition
  morphDuration?: number;          // Transition duration
  morphType?: 'slide' | 'fade' | 'flip' | 'wave' | 'spiral'; // Transition style
  className?: string;              // CSS class
  isPaused?: boolean;              // Pause morphing
  preserveHeight?: boolean;        // Maintain container height
  onMorphComplete?: () => void;    // Completion callback
}
```

**Usage Examples:**

```typescript
// Smooth poem switching
<MorphingText 
  currentText={selectedPoem.text}
  previousText={previousPoem?.text}
  morphType="wave"
  morphDuration={1.5}
/>

// Poem remix animation
<MorphingText 
  currentText={remixedPoem}
  previousText={originalPoem}
  morphType="spiral"
  onMorphComplete={() => celebrateRemix()}
/>

// Theme-responsive morphing
<MorphingText 
  currentText={currentVersion}
  previousText={previousVersion}
  // morphDuration from theme timing
  preserveHeight={true}
/>
```

---

## 🎨 Theme Integration

All components automatically integrate with WordWeave's theme context:

```typescript
// Theme values automatically applied:
// - Animation timing from themeAnalysis.animation.timing
// - Colors from themeAnalysis.colors.palette
// - Emotion intensity from themeAnalysis.emotion.intensity
// - Easing curves from themeAnalysis.animation.timing.easing

// Override theme values when needed:
<TypewriterText 
  text={poem}
  speed={5} // Overrides theme-calculated speed
/>
```

---

## 🎭 Animation Presets

Use predefined presets for consistent theming:

```typescript
import { AnimationPresets, AnimationUtils } from '@/components/animations';

// Apply preset to multiple components
const preset = AnimationPresets.ROMANTIC;

<FadeInWords 
  text={lovePoem}
  staggerDelay={preset.staggerDelay / 1000}
  wordDuration={preset.duration}
/>

// Auto-select preset based on emotion
const emotionPreset = AnimationUtils.getPresetForEmotion(
  poem.emotion, 
  poem.emotionIntensity
);
```

Available presets:
- `CALM`: Slow, gentle animations
- `ENERGETIC`: Fast, dynamic effects  
- `DRAMATIC`: Bold, impactful transitions
- `MYSTICAL`: Ethereal, mysterious animations
- `ROMANTIC`: Soft, flowing movements
- `PLAYFUL`: Bouncy, cheerful effects

---

## ⚡ Performance Optimization

### GPU Acceleration
All components use only GPU-accelerated properties:
- `transform` (translate, scale, rotate)
- `opacity`
- `filter` (blur, brightness)
- `will-change` for optimization hints

### Automatic Performance Tuning

```typescript
import { AnimationPerformance } from '@/components/animations';

// Get optimal settings for user's device
const settings = AnimationPerformance.getOptimalSettings();

<GlowingText 
  text={poem}
  enableParticles={settings.enableParticles}
  // Other components auto-adjust based on device capabilities
/>

// Monitor performance
AnimationPerformance.monitorFPS((fps) => {
  if (fps < 30) {
    // Reduce animation complexity
    setReduceMotion(true);
  }
});
```

### Reduced Motion Support
Components respect `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  /* Animations automatically simplified */
}
```

---

## 🎪 Complex Integration Examples

### Sequential Animation Chain

```typescript
const SequentialPoemReveal = ({ poem }) => {
  const [stage, setStage] = useState(0);
  
  return (
    <div className="sequential-reveal">
      {stage === 0 && (
        <TypewriterText 
          text={poem.title}
          onComplete={() => setStage(1)}
        />
      )}
      
      {stage === 1 && (
        <StaggeredLines 
          text={poem.text}
          onComplete={() => setStage(2)}
        />
      )}
      
      {stage === 2 && (
        <GlowingText 
          text={poem.emotionalLine}
          emotionIntensity={poem.emotion.intensity}
        />
      )}
    </div>
  );
};
```

### Interactive Animation Controller

```typescript
const AnimatedPoemDisplay = ({ poem, userPreferences }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [animationType, setAnimationType] = useState(userPreferences.animation);
  
  const renderAnimation = () => {
    switch(animationType) {
      case 'typewriter':
        return <TypewriterText text={poem.text} isPaused={isPaused} />;
      case 'fadeWords':
        return <FadeInWords text={poem.text} isPaused={isPaused} />;
      case 'staggerLines':
        return <StaggeredLines text={poem.text} isPaused={isPaused} />;
      case 'glow':
        return <GlowingText text={poem.text} isPaused={isPaused} />;
      default:
        return <div>{poem.text}</div>;
    }
  };
  
  return (
    <div className="interactive-poem">
      <div className="animation-controls">
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? 'Play' : 'Pause'}
        </button>
        <select 
          value={animationType} 
          onChange={(e) => setAnimationType(e.target.value)}
        >
          <option value="typewriter">Typewriter</option>
          <option value="fadeWords">Fade Words</option>
          <option value="staggerLines">Stagger Lines</option>
          <option value="glow">Glowing</option>
        </select>
      </div>
      
      <div className="poem-content">
        {renderAnimation()}
      </div>
    </div>
  );
};
```

### Poem Comparison with Morphing

```typescript
const PoemComparison = ({ originalPoem, variations }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isComparing, setIsComparing] = useState(false);
  
  const currentPoem = variations[currentIndex];
  const previousPoem = variations[currentIndex - 1] || originalPoem;
  
  return (
    <div className="poem-comparison">
      <MorphingText 
        currentText={currentPoem.text}
        previousText={isComparing ? previousPoem.text : undefined}
        morphType="wave"
        onMorphComplete={() => setIsComparing(false)}
      />
      
      <div className="comparison-controls">
        <button 
          onClick={() => {
            setIsComparing(true);
            setCurrentIndex((prev) => (prev + 1) % variations.length);
          }}
        >
          Next Variation
        </button>
      </div>
    </div>
  );
};
```

---

## 🎨 Styling and Customization

### CSS Classes
Each component accepts custom CSS classes:

```css
.poem-typewriter {
  font-family: 'Courier New', monospace;
  font-size: 1.2rem;
  color: var(--theme-primary);
}

.emotional-glow {
  text-align: center;
  padding: 2rem;
  background: radial-gradient(circle, transparent, rgba(0,0,0,0.1));
}

.staggered-poem {
  line-height: 1.8;
  max-width: 600px;
  margin: 0 auto;
}
```

### CSS Variables
Components respect CSS custom properties:

```css
:root {
  --theme-primary: #667eea;
  --theme-accent: #764ba2;
  --spacing-scale: 1rem;
  --animation-duration-base: 1s;
}
```

---

## 🐛 Troubleshooting

### Common Issues

1. **Animations not starting**
   ```typescript
   // Ensure text prop is not empty
   <TypewriterText text={poem?.text || ''} />
   ```

2. **Performance issues**
   ```typescript
   // Use React.memo for parent components
   const MemoizedPoemDisplay = React.memo(({ poem }) => (
     <FadeInWords text={poem.text} />
   ));
   ```

3. **Theme not applying**
   ```typescript
   // Ensure component is wrapped in ThemeProvider
   <ThemeProvider>
     <GlowingText text={poem} />
   </ThemeProvider>
   ```

### Debug Mode
Enable debug logging:

```typescript
// Add to component props for debugging
<TypewriterText 
  text={poem}
  onComplete={() => console.log('Animation complete')}
/>
```

---

## 📱 Accessibility

All components support accessibility features:
- Respects `prefers-reduced-motion`
- Semantic HTML structure
- Screen reader friendly
- Keyboard navigation support
- Focus management

```typescript
// Accessibility-aware usage
<StaggeredLines 
  text={poem}
  className="screen-reader-friendly"
  aria-label="Animated poem display"
/>
```

---

## 🔧 Advanced Configuration

### Custom Easing Functions

```typescript
// Define custom easing in CSS
.custom-ease {
  --animation-easing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

<FadeInWords 
  text={poem}
  className="custom-ease"
/>
```

### Performance Monitoring

```typescript
import { AnimationPerformance } from '@/components/animations';

// Monitor and optimize based on performance
const PoemApp = () => {
  const [performanceMode, setPerformanceMode] = useState('normal');
  
  useEffect(() => {
    AnimationPerformance.monitorFPS((fps) => {
      if (fps < 30) setPerformanceMode('reduced');
    });
  }, []);
  
  return (
    <GlowingText 
      text={poem}
      enableParticles={performanceMode !== 'reduced'}
    />
  );
};
```

---

This guide covers all essential usage patterns for WordWeave's text animation components. Each component is designed to work seamlessly together and integrate with your application's theme and performance requirements.
