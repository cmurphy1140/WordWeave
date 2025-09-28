/**
 * Jest setup file for WordWeave frontend tests
 * Configures testing environment, mocks, and custom matchers
 */

import '@testing-library/jest-dom';
import { configure } from '@testing-library/react';
import { TextEncoder, TextDecoder } from 'util';

// Configure React Testing Library
configure({
  testIdAttribute: 'data-testid',
  asyncUtilTimeout: 5000,
});

// Polyfills for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock window.ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock performance.now
Object.defineProperty(window, 'performance', {
  value: {
    now: jest.fn(() => Date.now()),
    mark: jest.fn(),
    measure: jest.fn(),
    getEntriesByType: jest.fn(() => []),
    getEntriesByName: jest.fn(() => []),
    clearMarks: jest.fn(),
    clearMeasures: jest.fn(),
  },
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn(),
};
global.sessionStorage = sessionStorageMock as any;

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => 'mock-url');
global.URL.revokeObjectURL = jest.fn();

// Mock crypto.randomUUID
Object.defineProperty(global.crypto, 'randomUUID', {
  value: jest.fn(() => 'mock-uuid-1234-5678-90ab-cdef'),
});

// Mock console methods in test environment
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is deprecated') ||
       args[0].includes('Warning: componentWillReceiveProps') ||
       args[0].includes('Warning: componentWillMount'))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children),
    span: ({ children, ...props }: any) => React.createElement('span', props, children),
    p: ({ children, ...props }: any) => React.createElement('p', props, children),
    h1: ({ children, ...props }: any) => React.createElement('h1', props, children),
    h2: ({ children, ...props }: any) => React.createElement('h2', props, children),
    h3: ({ children, ...props }: any) => React.createElement('h3', props, children),
    button: ({ children, ...props }: any) => React.createElement('button', props, children),
    form: ({ children, ...props }: any) => React.createElement('form', props, children),
    input: (props: any) => React.createElement('input', props),
    textarea: (props: any) => React.createElement('textarea', props),
    select: ({ children, ...props }: any) => React.createElement('select', props, children),
  },
  AnimatePresence: ({ children }: any) => children,
  useAnimation: () => ({
    start: jest.fn(),
    stop: jest.fn(),
    set: jest.fn(),
  }),
  useMotionValue: (initial: any) => ({
    get: () => initial,
    set: jest.fn(),
    onChange: jest.fn(),
  }),
  useTransform: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
  useSpring: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
  useViewportScroll: () => ({
    scrollX: { get: () => 0 },
    scrollY: { get: () => 0 },
  }),
}));

// Mock react-router-dom
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  useSearchParams: () => [new URLSearchParams(), jest.fn()],
}));

// Mock @tanstack/react-query
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(() => ({
    data: null,
    isLoading: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  })),
  useMutation: jest.fn(() => ({
    mutate: jest.fn(),
    mutateAsync: jest.fn(),
    isLoading: false,
    isError: false,
    error: null,
    data: null,
  })),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
  })),
}));

// Custom matchers for theme testing
expect.extend({
  toHaveValidThemeColors(received: any) {
    const { colors } = received;
    
    if (!colors || !colors.palette || !Array.isArray(colors.palette)) {
      return {
        message: () => 'Expected theme to have valid colors.palette array',
        pass: false,
      };
    }

    const validColors = colors.palette.every((color: any) => 
      color.hex && 
      typeof color.hex === 'string' && 
      /^#[0-9A-Fa-f]{6}$/.test(color.hex) &&
      typeof color.weight === 'number' &&
      color.weight >= 0.1 &&
      color.weight <= 1.0 &&
      color.role
    );

    return {
      message: () => validColors 
        ? 'Expected theme colors to be invalid' 
        : 'Expected theme to have valid color palette with hex codes, weights, and roles',
      pass: validColors,
    };
  },

  toHaveValidAnimationConfig(received: any) {
    const { animation } = received;
    
    if (!animation) {
      return {
        message: () => 'Expected theme to have animation configuration',
        pass: false,
      };
    }

    const validStyles = ['calm', 'energetic', 'dramatic', 'mystical'];
    const validMovementTypes = ['fade', 'slide', 'bounce', 'float', 'pulse', 'wave', 'spiral', 'zoom'];
    
    const validAnimation = 
      validStyles.includes(animation.style) &&
      validMovementTypes.includes(animation.movement_type) &&
      animation.timing &&
      typeof animation.timing.duration === 'number' &&
      animation.timing.duration >= 500 &&
      animation.timing.duration <= 5000 &&
      typeof animation.timing.stagger_delay === 'number' &&
      animation.timing.stagger_delay >= 50 &&
      animation.timing.stagger_delay <= 500;

    return {
      message: () => validAnimation 
        ? 'Expected animation config to be invalid' 
        : 'Expected theme to have valid animation configuration',
      pass: validAnimation,
    };
  },
});

// Declare custom matchers for TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveValidThemeColors(): R;
      toHaveValidAnimationConfig(): R;
    }
  }
}

// Setup for each test
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset localStorage and sessionStorage
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  
  sessionStorageMock.getItem.mockClear();
  sessionStorageMock.setItem.mockClear();
  sessionStorageMock.removeItem.mockClear();
  sessionStorageMock.clear.mockClear();
  
  // Reset fetch mock
  (global.fetch as jest.Mock).mockClear();
});

// Cleanup after each test
afterEach(() => {
  // Clean up any timers
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

// Global test utilities
export const createMockTheme = (overrides = {}) => ({
  colors: {
    primary: '#ffd700',
    secondary: '#87ceeb',
    accent: '#98fb98',
    background: '#ffffff',
    gradient: ['#ffd700', '#87ceeb', '#98fb98'],
    ...overrides.colors,
  },
  animations: {
    style: 'energetic',
    duration: 2000,
    stagger: 150,
    ...overrides.animations,
  },
  typography: {
    mood: 'elegant',
    scale: 1.1,
    ...overrides.typography,
  },
  particles: {
    enabled: true,
    type: 'sparkles',
    density: 0.5,
    ...overrides.particles,
  },
  ...overrides,
});

export const createMockPoem = (lines = 4) => 
  Array.from({ length: lines }, (_, i) => `Line ${i + 1} of poetry`).join('\n');

export const waitForAnimation = () => 
  new Promise(resolve => setTimeout(resolve, 100));

export const mockApiResponse = (data: any, delay = 0) => 
  new Promise(resolve => setTimeout(() => resolve(data), delay));

export const mockApiError = (message: string, delay = 0) => 
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));
