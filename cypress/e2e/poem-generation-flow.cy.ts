/**
 * Cypress E2E tests for WordWeave poem generation flow
 * Tests complete user journey from input to theme application
 */

describe('Poem Generation Flow', () => {
  beforeEach(() => {
    // Set up test environment
    cy.visit('/');
    cy.cleanupTest();
    
    // Mock API responses
    cy.mockPoemGeneration({
      success: true,
      poem: 'The graceful butterfly dances through the morning light',
      timestamp: new Date().toISOString()
    });
    
    cy.mockThemeAnalysis({
      success: true,
      data: {
        emotion: {
          primary: 'joy',
          intensity: 0.8,
          secondary: [{ emotion: 'serenity', intensity: 0.6 }]
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
          keywords: ['butterfly', 'morning', 'light', 'graceful'],
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
          analysis_timestamp: new Date().toISOString(),
          model_used: 'claude-3-5-sonnet',
          poem_hash: 'abc123'
        }
      }
    });
  });

  describe('Happy Path Flow', () => {
    it('should generate poem and apply theme successfully', () => {
      // Fill out the form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      
      // Submit the form
      cy.submitPoemForm();
      
      // Wait for poem generation
      cy.wait('@generatePoem');
      cy.measureApiResponse('generatePoem');
      
      // Verify poem is displayed
      cy.get('[data-testid="poem-display"]').should('be.visible');
      cy.get('[data-testid="poem-text"]').should('contain', 'The graceful butterfly dances');
      
      // Wait for theme analysis
      cy.wait('@analyzeTheme');
      cy.measureApiResponse('analyzeTheme');
      
      // Verify theme is applied
      cy.waitForThemeAnalysis();
      cy.validateThemeApplication();
      
      // Verify theme colors are applied
      cy.get('[data-testid="poem-display"]').should('have.css', 'background-color');
      cy.get('[data-testid="poem-display"]').should('have.css', 'color');
      
      // Verify animations are running
      cy.assertAnimationsRunning();
      
      // Take screenshot for visual regression
      cy.takeThemeScreenshot('poem-generation-success');
    });

    it('should handle form validation correctly', () => {
      // Test empty form submission
      cy.submitPoemForm();
      
      // Verify validation errors
      cy.get('[data-testid="verb-error"]').should('contain', 'Verb is required');
      cy.get('[data-testid="adjective-error"]').should('contain', 'Adjective is required');
      cy.get('[data-testid="noun-error"]').should('contain', 'Noun is required');
      
      // Test invalid input lengths
      cy.fillPoemForm('a', 'b', 'c');
      cy.submitPoemForm();
      
      cy.get('[data-testid="verb-error"]').should('contain', 'must be at least 2 characters');
      cy.get('[data-testid="adjective-error"]').should('contain', 'must be at least 2 characters');
      cy.get('[data-testid="noun-error"]').should('contain', 'must be at least 2 characters');
      
      // Test valid input
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.get('[data-testid="verb-error"]').should('not.exist');
      cy.get('[data-testid="adjective-error"]').should('not.exist');
      cy.get('[data-testid="noun-error"]').should('not.exist');
    });

    it('should clear form after successful generation', () => {
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for completion
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Verify form is cleared
      cy.get('[data-testid="verb-input"]').should('have.value', '');
      cy.get('[data-testid="adjective-input"]').should('have.value', '');
      cy.get('[data-testid="noun-input"]').should('have.value', '');
    });

    it('should show loading states during processing', () => {
      // Fill form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      
      // Submit form
      cy.submitPoemForm();
      
      // Verify loading states
      cy.get('[data-testid="generate-button"]').should('be.disabled');
      cy.get('[data-testid="poem-loading"]').should('be.visible');
      cy.get('[data-testid="poem-loading"]').should('contain', 'Generating poem');
      
      // Wait for poem generation
      cy.wait('@generatePoem');
      
      // Verify theme loading state
      cy.get('[data-testid="theme-loading"]').should('be.visible');
      cy.get('[data-testid="theme-loading"]').should('contain', 'Analyzing theme');
      
      // Wait for completion
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Verify loading states are gone
      cy.get('[data-testid="poem-loading"]').should('not.exist');
      cy.get('[data-testid="theme-loading"]').should('not.exist');
      cy.get('[data-testid="generate-button"]').should('not.be.disabled');
    });
  });

  describe('Error Handling', () => {
    it('should handle poem generation API errors', () => {
      // Mock API error
      cy.mockApiError('/api/generate', 500, 'Internal Server Error');
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for error
      cy.wait('@apiError');
      
      // Verify error message
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Internal Server Error');
      
      // Verify retry button
      cy.get('[data-testid="retry-button"]').should('be.visible');
      
      // Test retry functionality
      cy.mockPoemGeneration({
        success: true,
        poem: 'The graceful butterfly dances through the morning light'
      });
      
      cy.get('[data-testid="retry-button"]').click();
      cy.wait('@generatePoem');
      
      // Verify success after retry
      cy.get('[data-testid="poem-display"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('not.exist');
    });

    it('should handle theme analysis API errors', () => {
      // Mock theme analysis error
      cy.mockApiError('/api/analyze', 500, 'Theme analysis failed');
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for poem generation
      cy.wait('@generatePoem');
      
      // Wait for theme analysis error
      cy.wait('@apiError');
      
      // Verify error message
      cy.get('[data-testid="theme-error"]').should('be.visible');
      cy.get('[data-testid="theme-error"]').should('contain', 'Theme analysis failed');
      
      // Verify poem is still displayed
      cy.get('[data-testid="poem-display"]').should('be.visible');
      cy.get('[data-testid="poem-text"]').should('contain', 'The graceful butterfly dances');
    });

    it('should handle network timeout errors', () => {
      // Mock timeout
      cy.intercept('POST', '/api/generate', {
        delay: 15000,
        statusCode: 200,
        body: { success: true }
      }).as('timeoutResponse');
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Verify timeout error
      cy.get('[data-testid="error-message"]', { timeout: 12000 }).should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Request timeout');
    });

    it('should handle invalid API responses', () => {
      // Mock invalid response
      cy.intercept('POST', '/api/generate', {
        statusCode: 200,
        body: 'invalid json'
      }).as('invalidResponse');
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for error
      cy.wait('@invalidResponse');
      
      // Verify error handling
      cy.get('[data-testid="error-message"]').should('be.visible');
      cy.get('[data-testid="error-message"]').should('contain', 'Invalid response');
    });
  });

  describe('Accessibility', () => {
    it('should support keyboard navigation', () => {
      cy.testKeyboardNavigation();
      
      // Test form submission with Enter key
      cy.get('[data-testid="noun-input"]').type('{enter}');
      
      // Verify form was submitted
      cy.wait('@generatePoem');
    });

    it('should provide proper ARIA labels and descriptions', () => {
      // Check form accessibility
      cy.get('[data-testid="poem-form"]').should('have.attr', 'aria-label');
      cy.get('[data-testid="verb-input"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="adjective-input"]').should('have.attr', 'aria-describedby');
      cy.get('[data-testid="noun-input"]').should('have.attr', 'aria-describedby');
      
      // Check button accessibility
      cy.get('[data-testid="generate-button"]').should('have.attr', 'aria-label');
      
      // Check poem display accessibility
      cy.get('[data-testid="poem-display"]').should('have.attr', 'role', 'article');
      cy.get('[data-testid="poem-display"]').should('have.attr', 'aria-label');
    });

    it('should announce state changes to screen readers', () => {
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Check loading announcements
      cy.get('[data-testid="poem-loading"]').should('have.attr', 'aria-live', 'polite');
      cy.get('[data-testid="theme-loading"]').should('have.attr', 'aria-live', 'polite');
      
      // Check error announcements
      cy.mockApiError('/api/generate', 500, 'Test error');
      cy.get('[data-testid="generate-button"]').click();
      cy.wait('@apiError');
      
      cy.get('[data-testid="error-message"]').should('have.attr', 'aria-live', 'assertive');
    });

    it('should meet WCAG accessibility standards', () => {
      cy.checkA11y();
      
      // Test with high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.checkA11y();
      
      // Test with reduced motion
      cy.get('body').invoke('addClass', 'reduced-motion');
      cy.checkA11y();
    });
  });

  describe('Performance', () => {
    it('should load page within performance threshold', () => {
      cy.measurePageLoad();
    });

    it('should handle rapid form submissions gracefully', () => {
      // Fill form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      
      // Submit multiple times rapidly
      cy.get('[data-testid="generate-button"]').click();
      cy.get('[data-testid="generate-button"]').click();
      cy.get('[data-testid="generate-button"]').click();
      
      // Should only make one API call
      cy.wait('@generatePoem');
      cy.get('@generatePoem.all').should('have.length', 1);
    });

    it('should handle large poems efficiently', () => {
      // Mock large poem response
      const largePoem = Array(20).fill('This is a very long line of poetry that should test performance').join('\n');
      
      cy.mockPoemGeneration({
        success: true,
        poem: largePoem
      });
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Measure performance
      const startTime = Date.now();
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      const endTime = Date.now();
      
      // Should complete within reasonable time
      expect(endTime - startTime).to.be.lessThan(10000); // 10 seconds
    });
  });

  describe('Responsive Design', () => {
    it('should work correctly on mobile devices', () => {
      cy.setMobileViewport();
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Verify functionality
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Verify layout
      cy.get('[data-testid="poem-display"]').should('be.visible');
      cy.get('[data-testid="poem-form"]').should('be.visible');
      
      // Take screenshot
      cy.takeThemeScreenshot('mobile-poem-generation');
    });

    it('should work correctly on tablet devices', () => {
      cy.setTabletViewport();
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Verify functionality
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Take screenshot
      cy.takeThemeScreenshot('tablet-poem-generation');
    });

    it('should work correctly on desktop devices', () => {
      cy.setDesktopViewport();
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Verify functionality
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Take screenshot
      cy.takeThemeScreenshot('desktop-poem-generation');
    });

    it('should adapt to different screen sizes', () => {
      cy.testResponsiveDesign();
    });
  });

  describe('Theme Variations', () => {
    it('should apply different themes based on poem content', () => {
      const themes = [
        {
          poem: 'The dark storm clouds gather overhead',
          theme: 'dramatic',
          colors: ['#2c3e50', '#34495e', '#7f8c8d']
        },
        {
          poem: 'Gentle rain falls on the peaceful meadow',
          theme: 'calm',
          colors: ['#74b9ff', '#a29bfe', '#fd79a8']
        },
        {
          poem: 'Mystical stars dance in the cosmic void',
          theme: 'mystical',
          colors: ['#6c5ce7', '#a29bfe', '#fd79a8']
        }
      ];
      
      themes.forEach(({ poem, theme, colors }, index) => {
        // Mock different theme responses
        cy.mockThemeAnalysis({
          success: true,
          data: {
            emotion: {
              primary: theme === 'dramatic' ? 'melancholy' : theme === 'calm' ? 'serenity' : 'wonder',
              intensity: 0.8
            },
            colors: {
              palette: colors.map((hex, i) => ({
                hex,
                weight: 0.8 - (i * 0.2),
                role: i === 0 ? 'primary' : i === 1 ? 'secondary' : 'accent'
              }))
            },
            animation: {
              style: theme,
              timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
              movement_type: 'fade',
              particles: { enabled: theme === 'mystical', type: 'sparkles', density: 0.3, speed: 0.8 }
            },
            imagery: { keywords: ['nature'], category: 'nature', visual_density: 0.7 },
            typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
            layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
            metadata: { analysis_confidence: 0.85, processing_notes: `${theme} theme`, analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: `hash${index}` }
          }
        });
        
        // Mock poem response
        cy.mockPoemGeneration({
          success: true,
          poem
        });
        
        // Fill and submit form
        cy.fillPoemForm('test', 'test', 'test');
        cy.submitPoemForm();
        
        // Wait for completion
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();
        
        // Verify theme application
        cy.validateThemeApplication();
        cy.checkThemeColors(colors);
        
        // Take screenshot
        cy.takeThemeScreenshot(`${theme}-theme-${index}`);
        
        // Clean up for next iteration
        cy.cleanupTest();
      });
    });
  });

  describe('Animation Testing', () => {
    it('should run animations smoothly', () => {
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for completion
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Check animation performance
      cy.checkAnimationPerformance();
      
      // Verify animations are running
      cy.assertAnimationsRunning();
      
      // Take animation screenshot
      cy.takeAnimationScreenshot('poem-animations');
    });

    it('should respect reduced motion preferences', () => {
      // Enable reduced motion
      cy.get('body').invoke('addClass', 'reduced-motion');
      
      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      
      // Wait for completion
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();
      
      // Verify reduced motion is applied
      cy.get('[data-testid="poem-display"]').should('have.class', 'reduced-motion');
      cy.get('[data-testid="poem-display"]').should('not.have.css', 'animation-duration');
    });
  });
});
