import React, { Suspense, lazy, ComponentType } from 'react';
import { motion } from 'framer-motion';
import { performanceUtils } from '../utils/performance';

// Loading fallback component
const LoadingFallback: React.FC<{ height?: string }> = ({ height = '200px' }) => (
  <motion.div
    className="lazy-loading-fallback"
    style={{ height, width: '100%' }}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
  </motion.div>
);

// Error boundary for lazy components
class LazyComponentErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Lazy component error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || <div>Failed to load component</div>;
    }

    return this.props.children;
  }
}

// Higher-order component for lazy loading with performance tracking
function withLazyLoading(
  importFunc: () => Promise<{ default: ComponentType<any> }>,
  componentName: string
) {
  const LazyComponent = lazy(importFunc);

  const WrappedComponent: React.FC<any> = (props) => {
    const [loadStartTime] = React.useState(Date.now());

    React.useEffect(() => {
      const loadTime = Date.now() - loadStartTime;
      performanceUtils.measureTime(() => {}, `${componentName} Lazy Load`);
      console.log(`${componentName} loaded in ${loadTime}ms`);
    }, [loadStartTime]);

    return (
      <LazyComponentErrorBoundary
        fallback={<div>Failed to load {componentName}</div>}
      >
        <Suspense fallback={<LoadingFallback />}>
          <LazyComponent {...props} />
        </Suspense>
      </LazyComponentErrorBoundary>
    );
  };

  WrappedComponent.displayName = `Lazy${componentName}`;
  return WrappedComponent;
}

// Lazy-loaded animation components
export const LazyStaggeredLines = withLazyLoading(
  () => import('./animations/StaggeredLines'),
  'StaggeredLines'
);

export const LazyGlowingText = withLazyLoading(
  () => import('./animations/GlowingText'),
  'GlowingText'
);

export const LazyMorphingText = withLazyLoading(
  () => import('./animations/MorphingText'),
  'MorphingText'
);

export const LazyFadeInWords = withLazyLoading(
  () => import('./animations/FadeInWords'),
  'FadeInWords'
);

export const LazyParticleEffects = withLazyLoading(
  () => import('./ParticleEffects'),
  'ParticleEffects'
);

export const LazyLayoutManager = withLazyLoading(
  () => import('./layouts/LayoutManager'),
  'LayoutManager'
);

export const LazyAnimationShowcase = withLazyLoading(
  () => import('./AnimationShowcase'),
  'AnimationShowcase'
);

// Intersection Observer hook for lazy loading
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = React.useState(false);
  const [hasIntersected, setHasIntersected] = React.useState(false);

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = performanceUtils.createIntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting && !hasIntersected) {
            setHasIntersected(true);
          }
        });
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options, hasIntersected]);

  return { isIntersecting, hasIntersected };
};

// Lazy component with intersection observer
interface LazyComponentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  threshold?: number;
  height?: string;
}

export const LazyComponent: React.FC<LazyComponentProps> = ({
  children,
  fallback = <LoadingFallback />,
  rootMargin = '50px',
  threshold = 0.1,
  height = '200px',
}) => {
  const elementRef = React.useRef<HTMLDivElement>(null);
  const { hasIntersected } = useIntersectionObserver(elementRef, {
    rootMargin,
    threshold,
  });

  return (
    <div ref={elementRef} style={{ minHeight: height }}>
      {hasIntersected ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      ) : (
        fallback
      )}
    </div>
  );
};

// Lazy image component with optimization
interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
  rootMargin?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iI2Y3ZjdmNyIvPjx0ZXh0IHg9IjUwIiB5PSI1MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+TG9hZGluZy4uLjwvdGV4dD48L3N2Zz4=',
  rootMargin = '50px',
}) => {
  const [imageSrc, setImageSrc] = React.useState(placeholder);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const elementRef = React.useRef<HTMLImageElement>(null);
  const { hasIntersected } = useIntersectionObserver(elementRef, {
    rootMargin,
    threshold: 0.1,
  });

  React.useEffect(() => {
    if (hasIntersected && imageSrc === placeholder) {
      const img = new Image();
      
      img.onload = () => {
        performanceUtils.measureTime(() => {}, `Image Load: ${src}`);
        setImageSrc(src);
        setIsLoaded(true);
      };
      
      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
      };
      
      img.src = src;
    }
  }, [hasIntersected, src, placeholder, imageSrc]);

  return (
    <img
      ref={elementRef}
      src={imageSrc}
      alt={alt}
      className={`lazy-image ${isLoaded ? 'loaded' : 'loading'} ${className}`}
      style={{
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};

// CSS for lazy loading components
export const lazyLoadingStyles = `
.lazy-loading-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-spinner {
  display: flex;
  gap: 4px;
}

.spinner-ring {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #667eea;
  animation: pulse 1.4s ease-in-out infinite both;
}

.spinner-ring:nth-child(1) {
  animation-delay: -0.32s;
}

.spinner-ring:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.lazy-image {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.lazy-image.loading {
  filter: blur(2px);
}

.lazy-image.loaded {
  filter: none;
}
`;

// Preload critical animation components
export const preloadAnimationComponents = (): void => {
  const criticalComponents = [
    () => import('./animations/StaggeredLines'),
    () => import('./animations/GlowingText'),
    () => import('./layouts/LayoutManager'),
  ];

  // Preload after initial page load
  setTimeout(() => {
    criticalComponents.forEach((importFunc) => {
      importFunc().catch((error) => {
        console.warn('Failed to preload component:', error);
      });
    });
  }, 2000);
};
