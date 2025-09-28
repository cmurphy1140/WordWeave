# 🎭 WordWeave Text Animation Components

A comprehensive collection of React components using Framer Motion for beautiful, performant poem text animations. Each component is optimized with GPU acceleration, theme context integration, and accessibility support.

## 📦 Components

| Component | Purpose | Best For |
|-----------|---------|----------|
| **TypewriterText** | Simulates typing with adjustable speed | Dramatic reveals, interactive demos |
| **FadeInWords** | Word-by-word fade reveal | Gentle emphasis, word-focused poems |
| **StaggeredLines** | Line-by-line animations | Structured poems, stanza reveals |
| **GlowingText** | Emotion-based glow effects | Emotional poems, mood visualization |
| **MorphingText** | Smooth poem transitions | Poem switching, remix animations |

## 🚀 Quick Start

```bash
# Import components
import {
  TypewriterText,
  FadeInWords,
  StaggeredLines,
  GlowingText,
  MorphingText
} from '@/components/animations';
```

```typescript
// Basic usage
<TypewriterText 
  text="Your poem text here"
  speed={3}
  onComplete={() => console.log('Done!')}
/>

<FadeInWords 
  text="Each word appears gracefully"
  staggerDelay={0.2}
/>

<StaggeredLines 
  text={`Line one
Line two  
Line three`}
  animationType="slide"
/>

<GlowingText 
  text="Passionate poetry"
  emotionIntensity={0.8}
  enableParticles={true}
/>

<MorphingText 
  currentText="New poem"
  previousText="Old poem"
  morphType="wave"
/>
```

## ✨ Key Features

### 🎨 Theme Integration
- Automatically adapts to WordWeave theme context
- Emotion-aware animations based on poem sentiment
- Color palette integration from theme analysis
- Timing calculations from theme preferences

### ⚡ Performance Optimized
- GPU-accelerated properties only (`transform`, `opacity`, `filter`)
- React.memo for optimal re-renders
- Automatic performance tuning based on device capabilities
- Respects `prefers-reduced-motion` accessibility setting

### 🎮 Interactive Controls
- Pause/play functionality for all animations
- Adjustable speed and timing parameters
- Progress callbacks and completion events
- Real-time parameter modification

### 📱 Accessibility First
- Screen reader friendly markup
- Keyboard navigation support
- Reduced motion preference support
- Semantic HTML structure

## 📚 Documentation

- **[Complete Usage Guide](./AnimationUsageGuide.md)** - Comprehensive documentation with examples
- **[Live Examples](./TextAnimationExamples.tsx)** - Interactive component demonstrations
- **[API Reference](#api-reference)** - Detailed prop specifications

## 🎪 Live Demo

Run the examples component to see all animations in action:

```typescript
import { TextAnimationExamples } from '@/components/animations';

// Full interactive demo
<TextAnimationExamples />

// Individual component demos
import { 
  TypewriterTextExamples,
  FadeInWordsExamples,
  StaggeredLinesExamples,
  GlowingTextExamples,
  MorphingTextExamples 
} from '@/components/animations';
```

## 🔧 Installation & Setup

These components are part of the WordWeave frontend and require:

```json
{
  "framer-motion": "^10.x",
  "react": "^18.x",
  "@emotion/react": "^11.x"
}
```

### Theme Context Setup
```typescript
import { ThemeProvider } from '@/contexts/ThemeContext';

<ThemeProvider>
  <TypewriterText text="Theme-aware animation" />
</ThemeProvider>
```

## 🎯 Common Usage Patterns

### Sequential Animation Chain
```typescript
const [stage, setStage] = useState(0);

{stage === 0 && <TypewriterText onComplete={() => setStage(1)} />}
{stage === 1 && <StaggeredLines onComplete={() => setStage(2)} />}
{stage === 2 && <GlowingText />}
```

### Theme-Responsive Animation
```typescript
// Automatically adapts timing, colors, and effects based on theme
<FadeInWords text={poem.text} />
<GlowingText text={poem.text} /> // Uses theme emotion analysis
```

### Performance-Aware Usage
```typescript
import { AnimationPerformance } from '@/components/animations';

const settings = AnimationPerformance.getOptimalSettings();
<GlowingText enableParticles={settings.enableParticles} />
```

## 📊 API Reference

### TypewriterText Props
```typescript
interface TypewriterTextProps {
  text: string;                    // Required: Text to animate
  speed?: number;                  // Characters per second (default: 3)
  startDelay?: number;             // Delay before starting (ms)
  onComplete?: () => void;         // Callback when complete
  className?: string;              // CSS class name
  isPaused?: boolean;              // Pause/play control
  showCursor?: boolean;            // Show blinking cursor (default: true)
}
```

### FadeInWords Props
```typescript
interface FadeInWordsProps {
  text: string;                    // Required: Text to animate
  staggerDelay?: number;           // Delay between words (seconds)
  wordDuration?: number;           // Animation duration per word (default: 0.6)
  startDelay?: number;             // Initial delay (ms)
  onComplete?: () => void;         // Completion callback
  className?: string;              // CSS class name
  isPaused?: boolean;              // Pause control
  preserveSpaces?: boolean;        // Maintain spacing (default: true)
}
```

### StaggeredLines Props
```typescript
interface StaggeredLinesProps {
  text: string;                    // Required: Multi-line text (\n separated)
  lineStagger?: number;            // Delay between lines (seconds)
  lineDuration?: number;           // Animation duration per line (default: 0.8)
  startDelay?: number;             // Initial delay (ms)
  onComplete?: () => void;         // Completion callback
  className?: string;              // CSS class name
  isPaused?: boolean;              // Pause control
  animationType?: 'slide' | 'fade' | 'bounce' | 'scale'; // Animation style
}
```

### GlowingText Props
```typescript
interface GlowingTextProps {
  text: string;                    // Required: Text to glow
  emotionIntensity?: number;       // 0-1 intensity level
  glowColor?: string;              // Hex or CSS color
  pulseSpeed?: number;             // Pulse cycle duration (seconds)
  className?: string;              // CSS class name
  isPaused?: boolean;              // Pause glow effect
  maxGlowRadius?: number;          // Maximum glow size (default: 20)
  enableParticles?: boolean;       // Floating particles effect
}
```

### MorphingText Props
```typescript
interface MorphingTextProps {
  currentText: string;             // Required: Current text to display
  previousText?: string;           // Previous text for smooth transition
  morphDuration?: number;          // Transition duration (seconds)
  morphType?: 'slide' | 'fade' | 'flip' | 'wave' | 'spiral'; // Transition style
  className?: string;              // CSS class name
  isPaused?: boolean;              // Pause morphing
  preserveHeight?: boolean;        // Maintain container height (default: true)
  onMorphComplete?: () => void;    // Completion callback
}
```

## 🎨 Animation Presets

Use predefined presets for consistent theming:

```typescript
import { AnimationPresets, AnimationUtils } from '@/components/animations';

// Available presets
AnimationPresets.CALM        // Slow, gentle
AnimationPresets.ENERGETIC   // Fast, dynamic
AnimationPresets.DRAMATIC    // Bold, impactful
AnimationPresets.MYSTICAL    // Ethereal, mysterious
AnimationPresets.ROMANTIC    // Soft, flowing
AnimationPresets.PLAYFUL     // Bouncy, cheerful

// Auto-select based on emotion
const preset = AnimationUtils.getPresetForEmotion(poem.emotion, 0.8);
```

## 🛠️ Utility Functions

### AnimationUtils
```typescript
// Calculate optimal timing based on text length
const timing = AnimationUtils.getOptimalTiming(poem.text, 3);

// Get preset for emotion
const preset = AnimationUtils.getPresetForEmotion('joy', 0.7);

// Create stagger configuration
const staggerConfig = AnimationUtils.createStaggerConfig(10, 2);
```

### AnimationPerformance
```typescript
// Monitor frame rate
AnimationPerformance.monitorFPS(fps => console.log(`FPS: ${fps}`));

// Check motion preference
const shouldReduce = AnimationPerformance.shouldReduceMotion();

// Get optimal settings for device
const settings = AnimationPerformance.getOptimalSettings();
```

## 🎭 Examples

### Basic Poem Display
```typescript
const PoemDisplay = ({ poem }) => (
  <div className="poem-container">
    <TypewriterText 
      text={poem.title}
      speed={4}
      onComplete={() => console.log('Title complete')}
    />
    
    <StaggeredLines 
      text={poem.text}
      animationType="slide"
      lineStagger={0.3}
    />
  </div>
);
```

### Emotional Poetry Showcase
```typescript
const EmotionalPoem = ({ poem }) => {
  const intensity = poem.emotionAnalysis?.intensity || 0.5;
  
  return (
    <GlowingText 
      text={poem.text}
      emotionIntensity={intensity}
      enableParticles={intensity > 0.7}
      glowColor={poem.emotionAnalysis?.color}
    />
  );
};
```

### Interactive Poem Morphing
```typescript
const PoemMorpher = ({ poems }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  return (
    <div>
      <MorphingText 
        currentText={poems[currentIndex].text}
        previousText={poems[currentIndex - 1]?.text}
        morphType="wave"
        onMorphComplete={() => console.log('Morph complete')}
      />
      
      <button onClick={() => setCurrentIndex(i => (i + 1) % poems.length)}>
        Next Poem
      </button>
    </div>
  );
};
```

## 🐛 Troubleshooting

### Animation Not Starting
- Ensure `text` prop is not empty or undefined
- Check that component is properly wrapped in theme provider
- Verify Framer Motion is installed and imported

### Performance Issues
- Enable performance monitoring: `AnimationPerformance.monitorFPS()`
- Use `React.memo` for parent components
- Reduce particle effects on low-end devices
- Check `prefers-reduced-motion` setting

### Theme Integration Problems
- Ensure `ThemeProvider` wraps your components
- Check that `useTheme()` hook returns valid data
- Verify theme analysis includes animation properties

## 🤝 Contributing

When adding new animation components:

1. Follow existing patterns with React.memo
2. Use only GPU-accelerated properties
3. Integrate with theme context
4. Add pause/play functionality
5. Include accessibility features
6. Write comprehensive tests
7. Update documentation

## 📄 License

Part of the WordWeave project. See main project license.

---

**Happy Animating! ✨**

These components bring your poetry to life with smooth, performant animations that respect user preferences and device capabilities. Each animation enhances the emotional impact of your poems while maintaining excellent performance and accessibility standards.
