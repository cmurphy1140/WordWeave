/**
 * Jest unit tests for PoemDisplay component
 * Tests theme application, animations, and visual rendering
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../contexts/ThemeContext';
import PoemDisplay from '../../components/PoemDisplay';
import { ThemeAnalysis } from '../../types';

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock theme context
const mockThemeContext = {
  currentTheme: null,
  isLoadingTheme: false,
  themeError: null,
  generateAndApplyTheme: jest.fn(),
  applyTheme: jest.fn(),
  resetTheme: jest.fn(),
};

const samplePoem = "The sun shines bright and warm\nAcross the morning sky\nBirds sing their joyful song\nAs clouds go drifting by";

const sampleThemeAnalysis: ThemeAnalysis = {
  emotion: {
    primary: 'joy',
    intensity: 0.8,
    secondary: [
      { emotion: 'serenity', intensity: 0.6 },
      { emotion: 'wonder', intensity: 0.4 }
    ]
  },
  colors: {
    palette: [
      { hex: '#ffd700', weight: 0.8, role: 'primary' },
      { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
      { hex: '#98fb98', weight: 0.4, role: 'accent' },
      { hex: '#ffffff', weight: 0.3, role: 'neutral' },
      { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
    ],
    dominant_temperature: 'warm',
    saturation_level: 'high'
  },
  animation: {
    style: 'energetic',
    timing: {
      duration: 2000,
      stagger_delay: 150,
      easing: 'ease-out'
    },
    movement_type: 'fade',
    particles: {
      enabled: true,
      type: 'sparkles',
      density: 0.3,
      speed: 0.8
    }
  },
  imagery: {
    keywords: ['sun', 'sky', 'birds', 'clouds', 'morning'],
    category: 'nature',
    visual_density: 0.7
  },
  typography: {
    mood: 'elegant',
    font_weight: 400,
    font_scale: 1.1,
    line_height: 1.6,
    letter_spacing: 0.02,
    text_shadow: 1
  },
  layout: {
    spacing_scale: 1.2,
    border_radius: 12,
    backdrop_blur: 8,
    gradient_angle: 135,
    opacity_variations: [0.9, 0.6, 0.3]
  },
  metadata: {
    analysis_confidence: 0.85,
    processing_notes: 'Joyful nature theme with warm colors',
    analysis_timestamp: '2024-01-01T00:00:00Z',
    model_used: 'claude-3-5-sonnet',
    poem_hash: 'abc123'
  }
};

const renderWithThemeProvider = (component: React.ReactElement, theme = mockThemeContext) => {
  return render(
    <ThemeProvider value={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('PoemDisplay Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders poem text correctly', () => {
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />);
      
      expect(screen.getByText('The sun shines bright and warm')).toBeInTheDocument();
      expect(screen.getByText('Across the morning sky')).toBeInTheDocument();
      expect(screen.getByText('Birds sing their joyful song')).toBeInTheDocument();
      expect(screen.getByText('As clouds go drifting by')).toBeInTheDocument();
    });

    it('renders each line as a separate element', () => {
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />);
      
      const lines = samplePoem.split('\n');
      lines.forEach(line => {
        expect(screen.getByText(line)).toBeInTheDocument();
      });
    });

    it('handles empty poem gracefully', () => {
      renderWithThemeProvider(<PoemDisplay poem="" />);
      
      expect(screen.getByText(/no poem to display/i)).toBeInTheDocument();
    });

    it('handles null poem gracefully', () => {
      renderWithThemeProvider(<PoemDisplay poem={null as any} />);
      
      expect(screen.getByText(/no poem to display/i)).toBeInTheDocument();
    });

    it('displays loading state when theme is being generated', () => {
      const loadingThemeContext = {
        ...mockThemeContext,
        isLoadingTheme: true
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, loadingThemeContext);
      
      expect(screen.getByText(/analyzing theme/i)).toBeInTheDocument();
    });
  });

  describe('Theme Application', () => {
    it('applies theme colors to poem display', () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#ffd700',
            secondary: '#87ceeb',
            accent: '#98fb98',
            background: '#ffffff',
            gradient: ['#ffd700', '#87ceeb', '#98fb98']
          },
          animations: {
            style: 'energetic',
            duration: 2000,
            stagger: 150
          },
          typography: {
            mood: 'elegant',
            scale: 1.1
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      const poemContainer = screen.getByTestId('poem-display');
      expect(poemContainer).toHaveStyle({
        'background-color': '#ffffff',
        'color': '#ffd700'
      });
    });

    it('applies typography styles from theme', () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666',
            background: '#ffffff',
            gradient: ['#000000', '#333333']
          },
          animations: {
            style: 'calm',
            duration: 1500,
            stagger: 100
          },
          typography: {
            mood: 'elegant',
            scale: 1.2
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      const poemText = screen.getByTestId('poem-text');
      expect(poemText).toHaveStyle({
        'font-size': '1.2em',
        'line-height': '1.6'
      });
    });

    it('applies animation styles based on theme', () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            accent: '#0000ff',
            background: '#ffffff',
            gradient: ['#ff0000', '#00ff00']
          },
          animations: {
            style: 'dramatic',
            duration: 3000,
            stagger: 200
          },
          typography: {
            mood: 'modern',
            scale: 1.0
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      const poemLines = screen.getAllByTestId(/poem-line-/);
      poemLines.forEach((line, index) => {
        expect(line).toHaveStyle({
          'animation-delay': `${index * 200}ms`,
          'animation-duration': '3000ms'
        });
      });
    });
  });

  describe('Animation Behavior', () => {
    it('applies stagger animation to poem lines', () => {
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />);
      
      const lines = samplePoem.split('\n');
      const poemLines = screen.getAllByTestId(/poem-line-/);
      
      poemLines.forEach((line, index) => {
        expect(line).toHaveAttribute('data-animation-delay', (index * 150).toString());
      });
    });

    it('handles different animation styles', () => {
      const animationStyles = ['calm', 'energetic', 'dramatic', 'mystical'];
      
      animationStyles.forEach(style => {
        const themeContext = {
          ...mockThemeContext,
          currentTheme: {
            colors: {
              primary: '#000000',
              secondary: '#333333',
              accent: '#666666',
              background: '#ffffff',
              gradient: ['#000000', '#333333']
            },
            animations: {
              style,
              duration: 2000,
              stagger: 150
            },
            typography: {
              mood: 'modern',
              scale: 1.0
            }
          }
        };
        
        const { unmount } = renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
        
        const poemContainer = screen.getByTestId('poem-display');
        expect(poemContainer).toHaveClass(`animation-${style}`);
        
        unmount();
      });
    });

    it('applies particle effects when enabled', () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#ffd700',
            secondary: '#87ceeb',
            accent: '#98fb98',
            background: '#ffffff',
            gradient: ['#ffd700', '#87ceeb']
          },
          animations: {
            style: 'energetic',
            duration: 2000,
            stagger: 150
          },
          typography: {
            mood: 'elegant',
            scale: 1.1
          },
          particles: {
            enabled: true,
            type: 'sparkles',
            density: 0.5
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      expect(screen.getByTestId('particle-effects')).toBeInTheDocument();
      expect(screen.getByTestId('particle-effects')).toHaveClass('particles-sparkles');
    });

    it('hides particle effects when disabled', () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#000000',
            secondary: '#333333',
            accent: '#666666',
            background: '#ffffff',
            gradient: ['#000000', '#333333']
          },
          animations: {
            style: 'calm',
            duration: 2000,
            stagger: 150
          },
          typography: {
            mood: 'modern',
            scale: 1.0
          },
          particles: {
            enabled: false,
            type: 'sparkles',
            density: 0.5
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      expect(screen.queryByTestId('particle-effects')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('displays theme error message', () => {
      const errorThemeContext = {
        ...mockThemeContext,
        themeError: 'Failed to analyze theme'
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, errorThemeContext);
      
      expect(screen.getByText(/failed to analyze theme/i)).toBeInTheDocument();
    });

    it('applies fallback theme when theme generation fails', () => {
      const errorThemeContext = {
        ...mockThemeContext,
        themeError: 'Theme analysis failed',
        currentTheme: {
          colors: {
            primary: '#6b7280',
            secondary: '#9ca3af',
            accent: '#d1d5db',
            background: '#f3f4f6',
            gradient: ['#6b7280', '#9ca3af']
          },
          animations: {
            style: 'calm',
            duration: 2000,
            stagger: 150
          },
          typography: {
            mood: 'modern',
            scale: 1.0
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, errorThemeContext);
      
      // Should still display the poem with fallback theme
      expect(screen.getByText('The sun shines bright and warm')).toBeInTheDocument();
      
      const poemContainer = screen.getByTestId('poem-display');
      expect(poemContainer).toHaveStyle({
        'background-color': '#f3f4f6',
        'color': '#6b7280'
      });
    });

    it('handles malformed theme data gracefully', () => {
      const malformedThemeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: null,
            secondary: undefined,
            accent: '#000000',
            background: '#ffffff',
            gradient: []
          },
          animations: {
            style: 'invalid-style',
            duration: 'not-a-number',
            stagger: -100
          },
          typography: {
            mood: 'invalid-mood',
            scale: 'not-a-number'
          }
        }
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, malformedThemeContext);
      
      // Should still render without crashing
      expect(screen.getByText('The sun shines bright and warm')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels', () => {
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />);
      
      const poemContainer = screen.getByTestId('poem-display');
      expect(poemContainer).toHaveAttribute('role', 'article');
      expect(poemContainer).toHaveAttribute('aria-label', 'Generated poem');
    });

    it('announces theme loading state to screen readers', () => {
      const loadingThemeContext = {
        ...mockThemeContext,
        isLoadingTheme: true
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, loadingThemeContext);
      
      const loadingMessage = screen.getByText(/analyzing theme/i);
      expect(loadingMessage).toHaveAttribute('aria-live', 'polite');
    });

    it('announces theme errors to screen readers', () => {
      const errorThemeContext = {
        ...mockThemeContext,
        themeError: 'Theme analysis failed'
      };
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, errorThemeContext);
      
      const errorMessage = screen.getByText(/failed to analyze theme/i);
      expect(errorMessage).toHaveAttribute('aria-live', 'assertive');
    });

    it('supports reduced motion preferences', () => {
      // Mock matchMedia
      Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: jest.fn().mockImplementation(query => ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: jest.fn(),
          removeListener: jest.fn(),
          addEventListener: jest.fn(),
          removeEventListener: jest.fn(),
          dispatchEvent: jest.fn(),
        })),
      });
      
      renderWithThemeProvider(<PoemDisplay poem={samplePoem} />);
      
      const poemContainer = screen.getByTestId('poem-display');
      expect(poemContainer).toHaveClass('reduced-motion');
    });
  });

  describe('Performance', () => {
    it('does not re-render unnecessarily when poem is the same', () => {
      const renderSpy = jest.fn();
      
      const TestComponent = () => {
        renderSpy();
        return <PoemDisplay poem={samplePoem} />;
      };
      
      const { rerender } = renderWithThemeProvider(<TestComponent />);
      
      expect(renderSpy).toHaveBeenCalledTimes(1);
      
      // Re-render with same props
      rerender(<TestComponent />);
      
      // Should not re-render if poem hasn't changed
      expect(renderSpy).toHaveBeenCalledTimes(1);
    });

    it('handles very long poems efficiently', () => {
      const longPoem = Array(100).fill('This is a very long line of poetry').join('\n');
      
      const startTime = performance.now();
      renderWithThemeProvider(<PoemDisplay poem={longPoem} />);
      const endTime = performance.now();
      
      // Should render within reasonable time (adjust threshold as needed)
      expect(endTime - startTime).toBeLessThan(100); // 100ms
      
      // Should still render all lines
      const lines = longPoem.split('\n');
      expect(screen.getAllByTestId(/poem-line-/)).toHaveLength(lines.length);
    });

    it('debounces rapid theme changes', async () => {
      const themeContext = {
        ...mockThemeContext,
        currentTheme: {
          colors: {
            primary: '#ff0000',
            secondary: '#00ff00',
            accent: '#0000ff',
            background: '#ffffff',
            gradient: ['#ff0000', '#00ff00']
          },
          animations: {
            style: 'energetic',
            duration: 2000,
            stagger: 150
          },
          typography: {
            mood: 'modern',
            scale: 1.0
          }
        }
      };
      
      const { rerender } = renderWithThemeProvider(<PoemDisplay poem={samplePoem} />, themeContext);
      
      // Rapidly change theme multiple times
      for (let i = 0; i < 5; i++) {
        rerender(
          <ThemeProvider value={{
            ...themeContext,
            currentTheme: {
              ...themeContext.currentTheme,
              colors: {
                ...themeContext.currentTheme!.colors,
                primary: `#${i}${i}0000`
              }
            }
          }}>
            <PoemDisplay poem={samplePoem} />
          </ThemeProvider>
        );
      }
      
      // Should handle rapid changes without performance issues
      await waitFor(() => {
        expect(screen.getByTestId('poem-display')).toBeInTheDocument();
      });
    });
  });

  describe('Edge Cases', () => {
    it('handles poems with special characters', () => {
      const specialPoem = "Poetry with émojis 🎭 and spëcial chars\nAnd symbols: @#$%^&*()";
      
      renderWithThemeProvider(<PoemDisplay poem={specialPoem} />);
      
      expect(screen.getByText('Poetry with émojis 🎭 and spëcial chars')).toBeInTheDocument();
      expect(screen.getByText('And symbols: @#$%^&*()')).toBeInTheDocument();
    });

    it('handles poems with excessive whitespace', () => {
      const whitespacePoem = "   Line 1   \n\n\n   Line 2   \n   ";
      
      renderWithThemeProvider(<PoemDisplay poem={whitespacePoem} />);
      
      // Should normalize whitespace
      expect(screen.getByText('Line 1')).toBeInTheDocument();
      expect(screen.getByText('Line 2')).toBeInTheDocument();
    });

    it('handles single-line poems', () => {
      const singleLine = "A single line of poetry";
      
      renderWithThemeProvider(<PoemDisplay poem={singleLine} />);
      
      expect(screen.getByText(singleLine)).toBeInTheDocument();
      expect(screen.getAllByTestId(/poem-line-/)).toHaveLength(1);
    });

    it('handles poems with only whitespace', () => {
      const whitespaceOnly = "   \n\n   \n   ";
      
      renderWithThemeProvider(<PoemDisplay poem={whitespaceOnly} />);
      
      expect(screen.getByText(/no poem to display/i)).toBeInTheDocument();
    });
  });
});
