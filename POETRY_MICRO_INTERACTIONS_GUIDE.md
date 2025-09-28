# Poetry Micro-Interactions Library

A cohesive library of micro-interactions that reinforce the poetry theme in WordWeave, designed to create delightful and meaningful user experiences.

## 🎭 Overview

This library provides a comprehensive set of micro-interactions organized into four main categories:
- **Button Interactions**: Generate, Share, Save, Remix with unique animations
- **Feedback Animations**: Success, Error, Loading, Processing states
- **Hover Effects**: Words, Cards, Links, Images with poetry-inspired animations
- **Transition Choreography**: Waterfall, Page Curl, and staggered animations

## 🚀 Quick Start

```tsx
import { 
  PoetryButton, 
  PoetryFeedback, 
  WordHover, 
  CardHover, 
  LinkHover,
  WaterfallTransition,
  PageCurlTransition 
} from './components/PoetryMicroInteractions';
import './styles/poetry-micro-interactions.css';
```

## 🎯 Button Interactions

### Generate Button
Creates a ripple effect that forms words when clicked.

```tsx
<PoetryButton 
  type="generate" 
  onClick={handleGenerate}
>
  Generate Poem
</PoetryButton>
```

**Animation**: Ripple effect with scale and opacity transitions
**Duration**: 600ms
**Easing**: easeOut

### Share Button
Exploding particles that reform as a link.

```tsx
<PoetryButton 
  type="share" 
  onClick={handleShare}
>
  Share Poem
</PoetryButton>
```

**Animation**: 6 particles exploding outward in 60-degree increments
**Duration**: 800ms
**Easing**: easeOut

### Save Button
Heart that fills with poem's colors.

```tsx
<PoetryButton 
  type="save" 
  onClick={handleSave}
>
  Save Poem
</PoetryButton>
```

**Animation**: Heart scale and opacity fill
**Duration**: 400ms
**Easing**: easeOut

### Remix Button
Swirl that shuffles elements.

```tsx
<PoetryButton 
  type="remix" 
  onClick={handleRemix}
>
  Remix Poem
</PoetryButton>
```

**Animation**: Scale and rotation with swirl effect
**Duration**: 600ms
**Easing**: easeInOut

## 📢 Feedback Animations

### Success Feedback
Sparkles cascading like stardust.

```tsx
<PoetryFeedback 
  type="success" 
  message="Poem saved successfully!"
  isVisible={showSuccess}
/>
```

**Animation**: Sparkle twinkle with scale and opacity
**Duration**: 2s infinite loop
**Visual**: Radial gradient sparkle with twinkle effect

### Error Feedback
Gentle shake with red poetry line.

```tsx
<PoetryFeedback 
  type="error" 
  message="Failed to save poem"
  isVisible={showError}
/>
```

**Animation**: Horizontal shake pattern
**Duration**: 500ms
**Pattern**: [-10px, 10px, -10px, 10px, 0px]

### Loading Feedback
Typing cursor writing invisible words.

```tsx
<PoetryFeedback 
  type="loading" 
  message="Generating your poem..."
  isVisible={isLoading}
/>
```

**Animation**: Cursor blink effect
**Duration**: 1s infinite loop
**Pattern**: Opacity [1, 0, 1]

### Processing Feedback
Morphing inkblot patterns.

```tsx
<PoetryFeedback 
  type="processing" 
  message="Analyzing poem theme..."
  isVisible={isProcessing}
/>
```

**Animation**: Inkblot pulse with scale and opacity
**Duration**: 2s infinite loop
**Pattern**: Scale [1, 1.2, 1], Opacity [0.8, 1, 0.8]

## ✨ Hover Effects

### Word Hover
Subtle float with shadow lift.

```tsx
<WordHover>
  <span>ethereal</span>
</WordHover>
```

**Animation**: Y-axis lift (-2px) with enhanced shadow
**Duration**: 200ms
**Background**: Gradient from rgba(102, 126, 234, 0.1) to rgba(102, 126, 234, 0.2)

### Card Hover
Tilt with gradient shift.

```tsx
<CardHover>
  <div className="poem-card">
    <h3>Poem Title</h3>
    <p>Poem content...</p>
  </div>
</CardHover>
```

**Animation**: 3D rotation (rotateX: 5°, rotateY: 5°)
**Duration**: 300ms
**Perspective**: 1000px

### Link Hover
Underline drawn like pen stroke.

```tsx
<LinkHover href="/poems">
  View All Poems
</LinkHover>
```

**Animation**: ScaleX from 0 to 1
**Duration**: 300ms
**Easing**: easeOut
**Transform Origin**: left

### Image Hover
Ken Burns with blur focus.

```tsx
<div className="image-hover">
  <img src="poem-image.jpg" alt="Poetry illustration" />
</div>
```

**Animation**: Scale (1.05) with blur (1px)
**Duration**: 300ms
**Effect**: Ken Burns style with subtle blur

## 🎬 Transition Choreography

### Waterfall Transition
Element entrance timing with 50ms stagger.

```tsx
<WaterfallTransition delay={0}>
  <h2>Poem Title</h2>
</WaterfallTransition>
<WaterfallTransition delay={0.05}>
  <p>First line</p>
</WaterfallTransition>
<WaterfallTransition delay={0.1}>
  <p>Second line</p>
</WaterfallTransition>
```

**Animation**: Opacity (0→1) + Y-axis (20px→0)
**Duration**: 400ms
**Easing**: easeOut
**Stagger**: 50ms between elements

### Page Curl Transition
Page curl effect for route changes.

```tsx
<PageCurlTransition isVisible={showPage}>
  <div className="page-content">
    <h1>New Page</h1>
    <p>Content here...</p>
  </div>
</PageCurlTransition>
```

**Animation**: rotateY (0°→90°) + scale (1→0.8)
**Duration**: 500ms
**Easing**: easeInOut
**Perspective**: 1000px

## 🎨 Design Tokens

### Color Palette
```css
/* Primary Colors */
--poetry-primary: #667eea;
--poetry-secondary: #764ba2;
--poetry-accent: #f093fb;

/* Button Gradients */
--generate-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--share-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--save-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--remix-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);

/* Feedback Colors */
--success-bg: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
--error-bg: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
--loading-bg: linear-gradient(135deg, #d1ecf1 0%, #bee5eb 100%);
--processing-bg: linear-gradient(135deg, #e2e3e5 0%, #d6d8db 100%);
```

### Timing Functions
```css
--timing-fast: 0.1s;
--timing-normal: 0.2s;
--timing-slow: 0.3s;
--timing-slower: 0.5s;

--easing-ease-out: cubic-bezier(0.25, 0.46, 0.45, 0.94);
--easing-ease-in-out: cubic-bezier(0.42, 0, 0.58, 1);
--easing-bounce: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Reduced padding and font sizes
- Simplified animations
- Touch-friendly button sizes (44px minimum)

## ♿ Accessibility Features

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  .poetry-button,
  .word-hover,
  .card-hover,
  .link-hover,
  .image-hover {
    transition: none;
  }
  
  .sparkle,
  .cursor,
  .inkblot {
    animation: none;
  }
  
  .ripple-effect,
  .particle {
    display: none;
  }
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .poetry-button {
    border: 2px solid currentColor;
  }
  
  .poetry-feedback {
    border-width: 2px;
  }
  
  .link-hover .underline {
    height: 3px;
  }
}
```

### Dark Mode Support
```css
@media (prefers-color-scheme: dark) {
  .poetry-feedback--success {
    background: linear-gradient(135deg, #1e3a1e 0%, #2d4a2d 100%);
    color: #a8e6a8;
    border-color: #2d4a2d;
  }
  /* ... other dark mode styles */
}
```

## 🎭 Animation Principles

### 1. Purposeful Motion
Every animation serves a functional purpose:
- **Feedback**: Confirms user actions
- **Guidance**: Directs attention
- **Delight**: Creates emotional connection

### 2. Poetry-Inspired Timing
Animations follow poetic rhythms:
- **Iambic**: Short-long patterns (0.1s-0.2s)
- **Trochaic**: Long-short patterns (0.3s-0.1s)
- **Anapestic**: Short-short-long (0.1s-0.1s-0.3s)

### 3. Conservation of Motion
Elements transform smoothly without jarring changes:
- Scale and opacity transitions
- Color morphing with gradients
- Spatial relationships maintained

### 4. Emotional Resonance
Animations reflect poem emotions:
- **Joy**: Bouncy, bright, quick
- **Melancholy**: Slow, gentle, muted
- **Mystery**: Elusive, shimmering, unpredictable
- **Serenity**: Smooth, flowing, calm

## 🔧 Customization

### Custom Button Types
```tsx
const customPreset = {
  initial: { scale: 1, opacity: 0.8 },
  hover: { scale: 1.05, opacity: 1 },
  tap: { scale: 0.95 }
};

<PoetryButton 
  type="custom" 
  preset={customPreset}
  onClick={handleCustom}
>
  Custom Action
</PoetryButton>
```

### Custom Feedback Messages
```tsx
<PoetryFeedback 
  type="success" 
  message="Your poem has been woven into the digital tapestry!"
  isVisible={showCustomSuccess}
/>
```

### Custom Hover Effects
```tsx
const customHover = {
  initial: { rotate: 0 },
  hover: { rotate: 180, transition: { duration: 0.5 } }
};

<motion.div variants={customHover}>
  <span>Custom hover effect</span>
</motion.div>
```

## 📊 Performance Considerations

### GPU Acceleration
All animations use transform and opacity properties for optimal performance:
```css
.poetry-button {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}
```

### Reduced Motion Support
Animations are disabled for users who prefer reduced motion:
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Memory Management
- Animations are cleaned up on component unmount
- Event listeners are properly removed
- No memory leaks from continuous animations

## 🧪 Testing

### Unit Tests
```tsx
import { render, fireEvent } from '@testing-library/react';
import { PoetryButton } from './PoetryMicroInteractions';

test('PoetryButton triggers onClick', () => {
  const handleClick = jest.fn();
  const { getByText } = render(
    <PoetryButton onClick={handleClick}>Test</PoetryButton>
  );
  
  fireEvent.click(getByText('Test'));
  expect(handleClick).toHaveBeenCalled();
});
```

### Animation Tests
```tsx
test('Ripple effect triggers on generate button', () => {
  const { getByText } = render(
    <PoetryButton type="generate">Generate</PoetryButton>
  );
  
  fireEvent.click(getByText('Generate'));
  expect(document.querySelector('.ripple-effect')).toBeInTheDocument();
});
```

## 🚀 Future Enhancements

### Planned Features
1. **Sound Effects**: Audio feedback for interactions
2. **Haptic Feedback**: Vibration patterns for mobile
3. **Gesture Support**: Swipe and pinch interactions
4. **AI-Driven Animations**: Dynamic timing based on poem sentiment
5. **Collaborative Animations**: Shared animations between users

### Integration Ideas
- **Voice Commands**: Animate based on voice input
- **Eye Tracking**: Animations triggered by gaze
- **Biometric Feedback**: Heart rate affects animation speed
- **Weather Integration**: Animations reflect current weather

## 📚 Resources

### Design Inspiration
- **Material Design**: Motion principles
- **Apple HIG**: Human interface guidelines
- **Framer Motion**: Animation library documentation
- **Poetry Analysis**: Understanding emotional rhythms

### Tools
- **Framer**: Prototyping animations
- **Lottie**: After Effects to code
- **Chrome DevTools**: Performance profiling
- **Web Animations API**: Native browser animations

---

*This micro-interactions library is designed to make every interaction feel like poetry in motion, creating a cohesive and delightful user experience that reinforces the magical nature of WordWeave.*
