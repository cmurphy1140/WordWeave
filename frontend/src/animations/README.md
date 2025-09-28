# WordWeave Micro-Interactions Library

A cohesive collection of poetry-themed micro-interactions that enhance user experience through meaningful, delightful animations.

## Overview

The WordWeave Micro-Interactions Library provides a comprehensive set of animations designed specifically for poetry-themed applications. Each interaction reinforces the poetic nature of the content while providing clear feedback and enhancing user engagement.

## Features

- **Button Interactions**: Generate, Share, Save, and Remix buttons with unique poetry-themed animations
- **Feedback Animations**: Success, Error, Loading, and Processing states with contextual animations
- **Hover Effects**: Subtle interactions for words, cards, links, and images
- **Transition Choreography**: Smooth entrance/exit patterns and state changes
- **After Effects Prototypes**: Detailed specifications for creating Lottie animations
- **CSS Fallbacks**: Pure CSS implementations for browsers without JavaScript support
- **React Components**: Ready-to-use React components with Framer Motion

## Installation

```bash
npm install framer-motion lottie-react
```

## Quick Start

```tsx
import { 
  GenerateButton, 
  SuccessFeedback, 
  WordHover,
  MicroInteractionProvider 
} from './components/MicroInteractions';

function App() {
  return (
    <MicroInteractionProvider theme={{
      primary: '#2d5a3d',
      secondary: '#4a7c59',
      accent: '#7aa874',
      background: '#1a3d2e'
    }}>
      <GenerateButton onClick={() => console.log('Generated!')}>
        Generate Poem
      </GenerateButton>
      
      <WordHover>
        Poetry comes alive
      </WordHover>
      
      <SuccessFeedback message="Poem generated successfully!" />
    </MicroInteractionProvider>
  );
}
```

## Button Interactions

### Generate Button

Creates a ripple effect with floating words that emerge from the center.

```tsx
<GenerateButton 
  onClick={handleGenerate}
  theme={{ primary: '#2d5a3d', secondary: '#4a7c59' }}
>
  Generate Poem
</GenerateButton>
```

**Animation Details:**
- Ripple expands from center with theme colors
- Floating words appear with staggered timing
- Words: "create", "inspire", "dream", "flow"
- Duration: 1.2 seconds

### Share Button

Particles explode outward then reform into a link icon.

```tsx
<ShareButton onClick={handleShare}>
  Share Poem
</ShareButton>
```

**Animation Details:**
- 6 particles explode in different directions
- Particles fade out after 0.6 seconds
- Smooth hover scale effect
- Duration: 0.6 seconds

### Save Button

Heart outline fills with poem's theme colors.

```tsx
<SaveButton 
  onClick={handleSave}
  isSaved={isSaved}
  theme={{ primary: '#2d5a3d', secondary: '#4a7c59' }}
>
  Save Poem
</SaveButton>
```

**Animation Details:**
- Heart fills with gradient colors
- Scale animation on interaction
- Persistent fill when saved
- Duration: 0.5 seconds

### Remix Button

Swirling motion that rearranges visual elements.

```tsx
<RemixButton onClick={handleRemix}>
  Remix Poem
</RemixButton>
```

**Animation Details:**
- Swirl effect rotates 360 degrees
- Scale pulsing during animation
- Hover tilt effect
- Duration: 1.5 seconds

## Feedback Animations

### Success Feedback

Sparkles cascade down like stardust.

```tsx
<SuccessFeedback 
  message="Poem saved successfully!"
  duration={2000}
  onComplete={() => console.log('Animation complete')}
/>
```

**Animation Details:**
- 5 sparkles with staggered timing
- Golden color (#ffd700)
- Rotation and scale effects
- Duration: 1.5 seconds per sparkle

### Error Feedback

Gentle shake with red poetry line underline.

```tsx
<ErrorFeedback 
  message="Failed to save poem"
  duration={3000}
  onComplete={() => console.log('Error animation complete')}
/>
```

**Animation Details:**
- Horizontal shake motion
- Red underline draws from left to right
- Subtle and non-intrusive
- Duration: 0.4 seconds shake, 0.6 seconds line draw

### Loading Feedback

Typing cursor that moves as if writing invisible words.

```tsx
<LoadingFeedback message="Generating poem..." />
```

**Animation Details:**
- Blinking cursor animation
- Horizontal movement simulating typing
- Continuous loop
- Duration: 1 second blink cycle, 2 seconds typing cycle

### Processing Feedback

Morphing inkblot patterns.

```tsx
<ProcessingFeedback message="Analyzing theme..." />
```

**Animation Details:**
- 3 inkblots with different morphing patterns
- Scale and opacity changes
- Organic shape transformations
- Duration: 3 seconds per cycle

## Hover Effects

### Word Hover

Subtle float with shadow lift.

```tsx
<WordHover>
  Poetry comes alive
</WordHover>
```

**Animation Details:**
- 4px upward movement
- Enhanced drop shadow
- Smooth 0.3s transition
- GPU accelerated

### Card Hover

3D tilt with gradient shift.

```tsx
<CardHover theme={{ primary: '#2d5a3d', secondary: '#4a7c59' }}>
  <div className="poem-card">
    <h3>Poem Title</h3>
    <p>Poem content...</p>
  </div>
</CardHover>
```

**Animation Details:**
- 5-degree rotation on X and Y axes
- 1.02x scale increase
- Gradient background shift
- Perspective: 1000px

### Link Hover

Underline drawn like pen stroke.

```tsx
<LinkHover href="/poems">
  View All Poems
</LinkHover>
```

**Animation Details:**
- Underline scales from 0 to 100% width
- Smooth 0.3s ease-out transition
- Left-to-right drawing effect

### Image Hover

Ken Burns effect with blur focus.

```tsx
<ImageHover 
  src="/poem-image.jpg" 
  alt="Poetry illustration" 
/>
```

**Animation Details:**
- 1.05x scale increase
- 1px blur effect
- Inner image scales to 1.1x
- Duration: 0.4 seconds

## Transition Choreography

### Waterfall List

Staggered entrance with 50ms delays.

```tsx
<WaterfallList>
  {poems.map(poem => (
    <div key={poem.id} className="poem-item">
      {poem.title}
    </div>
  ))}
</WaterfallList>
```

**Animation Details:**
- 20px upward slide
- Opacity fade in
- 50ms stagger between items
- Duration: 0.5 seconds per item

### Page Transition

Page curl effect for route changes.

```tsx
<PageTransition isVisible={isVisible}>
  <div className="page-content">
    Content here
  </div>
</PageTransition>
```

**Animation Details:**
- 90-degree Y-axis rotation
- Opacity fade
- Smooth 0.6s transition
- Exit and enter animations

## Theme Integration

The library automatically adapts to your theme colors:

```tsx
<MicroInteractionProvider theme={{
  primary: '#2d5a3d',    // Forest green
  secondary: '#4a7c59',   // Sage green
  accent: '#7aa874',      // Light green
  background: '#1a3d2e'   // Dark green
}}>
  {/* Your components */}
</MicroInteractionProvider>
```

## CSS Fallbacks

For browsers without JavaScript support, include the CSS file:

```css
@import './styles/micro-interactions.css';
```

The CSS provides identical animations using pure CSS transitions and keyframes.

## After Effects Integration

### Creating Prototypes

Use the provided specifications to create After Effects prototypes:

```typescript
import { generateButtonSpecs } from './animations/after-effects-specs';

// Follow the specifications to create:
// - Generate Button composition
// - Ripple effect layer
// - Floating words with staggered timing
// - Proper easing curves
```

### Lottie Export

Export animations as Lottie JSON files:

```typescript
import { lottieExportSpecs } from './animations/after-effects-specs';

// Export settings:
// - Format: JSON
// - Version: 5.7.4
// - Frame Rate: 60
// - Optimize for web
```

## Performance Considerations

### GPU Acceleration

All animations use GPU acceleration:

```css
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

### Reduced Motion

Respects user preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Mobile Optimization

Responsive adaptations for mobile devices:

```css
@media (max-width: 768px) {
  .generate-button:hover {
    transform: scale(1.02); /* Reduced scale */
  }
}
```

## Accessibility

### Screen Reader Support

All components include proper ARIA labels:

```tsx
<GenerateButton 
  onClick={handleGenerate}
  aria-label="Generate new poem"
>
  Generate Poem
</GenerateButton>
```

### Keyboard Navigation

Components support keyboard interaction:

```tsx
<LinkHover 
  href="/poems"
  onKeyDown={handleKeyDown}
>
  View Poems
</LinkHover>
```

### Focus Indicators

Clear focus states for all interactive elements:

```css
.micro-interaction-trigger:focus {
  outline: 2px solid var(--theme-accent);
  outline-offset: 2px;
}
```

## Customization

### Custom Themes

Create custom theme configurations:

```typescript
const mysticalTheme = {
  primary: '#6b46c1',
  secondary: '#8b5cf6',
  accent: '#a78bfa',
  background: '#1e1b4b'
};

const energeticTheme = {
  primary: '#dc2626',
  secondary: '#ef4444',
  accent: '#f87171',
  background: '#7f1d1d'
};
```

### Custom Animations

Extend the library with custom animations:

```typescript
const customVariants: Variants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};
```

## Browser Support

- **Chrome 91+** ✅ (Primary target)
- **Firefox 90+** ✅ (Tested)
- **Safari 14+** ✅ (iOS/macOS)
- **Edge 91+** ✅ (Windows)

## Examples

### Complete Poem Generator

```tsx
function PoemGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [poem, setPoem] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePoem();
      setPoem(result);
      setShowSuccess(true);
    } catch (error) {
      // Error handling
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <MicroInteractionProvider theme={currentTheme}>
      <div className="poem-generator">
        <GenerateButton onClick={handleGenerate}>
          Generate Poem
        </GenerateButton>
        
        {isGenerating && <LoadingFeedback />}
        
        {showSuccess && (
          <SuccessFeedback 
            onComplete={() => setShowSuccess(false)}
          />
        )}
        
        {poem && (
          <WaterfallList>
            {poem.lines.map((line, index) => (
              <WordHover key={index}>
                {line}
              </WordHover>
            ))}
          </WaterfallList>
        )}
      </div>
    </MicroInteractionProvider>
  );
}
```

### Interactive Poem Card

```tsx
function PoemCard({ poem }) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <CardHover theme={poem.theme}>
      <div className="poem-card">
        <h3>
          <WordHover>{poem.title}</WordHover>
        </h3>
        
        <div className="poem-content">
          {poem.lines.map((line, index) => (
            <WordHover key={index}>
              {line}
            </WordHover>
          ))}
        </div>
        
        <div className="poem-actions">
          <SaveButton 
            onClick={() => setIsSaved(!isSaved)}
            isSaved={isSaved}
            theme={poem.theme}
          >
            {isSaved ? 'Saved' : 'Save'}
          </SaveButton>
          
          <ShareButton onClick={() => sharePoem(poem)}>
            Share
          </ShareButton>
          
          <RemixButton onClick={() => remixPoem(poem)}>
            Remix
          </RemixButton>
        </div>
      </div>
    </CardHover>
  );
}
```

## Troubleshooting

### Common Issues

1. **Animations not working**
   - Check if Framer Motion is installed
   - Verify CSS file is imported
   - Check browser console for errors

2. **Performance issues**
   - Ensure GPU acceleration is enabled
   - Check for conflicting CSS animations
   - Verify reduced motion preferences

3. **Theme not applying**
   - Verify MicroInteractionProvider is wrapping components
   - Check theme object structure
   - Ensure CSS custom properties are set

### Debug Mode

Enable debug mode for development:

```tsx
<MicroInteractionProvider 
  theme={theme}
  debug={process.env.NODE_ENV === 'development'}
>
  {/* Components */}
</MicroInteractionProvider>
```

## Contributing

1. Follow the existing animation patterns
2. Maintain poetry theme consistency
3. Include CSS fallbacks
4. Test across all supported browsers
5. Update documentation

## License

MIT License - see LICENSE file for details.

---

**Transform your poetry app with delightful micro-interactions!** ✨
