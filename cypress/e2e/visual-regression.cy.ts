/**
 * Visual regression tests for WordWeave using Percy
 * Tests theme variations, animations, and responsive design
 */

describe('Visual Regression Tests', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.cleanupTest();
  });

  describe('Theme Variations', () => {
    it('should capture theme variations visually', () => {
      const themes = [
        {
          name: 'joy-theme',
          poem: 'The graceful butterfly dances through the morning light',
          colors: ['#ffd700', '#87ceeb', '#98fb98']
        },
        {
          name: 'melancholy-theme',
          poem: 'The dark storm clouds gather overhead in silent sorrow',
          colors: ['#2c3e50', '#34495e', '#7f8c8d']
        },
        {
          name: 'serenity-theme',
          poem: 'Gentle rain falls on the peaceful meadow below',
          colors: ['#74b9ff', '#a29bfe', '#fd79a8']
        },
        {
          name: 'wonder-theme',
          poem: 'Mystical stars dance in the cosmic void above',
          colors: ['#6c5ce7', '#a29bfe', '#fd79a8']
        }
      ];

      themes.forEach(theme => {
        // Mock theme analysis
        cy.mockThemeAnalysis({
          success: true,
          data: {
            emotion: {
              primary: theme.name.split('-')[0],
              intensity: 0.8,
              secondary: [{ emotion: 'calm', intensity: 0.6 }]
            },
            colors: {
              palette: theme.colors.map((hex, i) => ({
                hex,
                weight: 0.8 - (i * 0.2),
                role: i === 0 ? 'primary' : i === 1 ? 'secondary' : 'accent'
              }))
            },
            animation: {
              style: theme.name.split('-')[0],
              timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
              movement_type: 'fade',
              particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
            },
            imagery: { keywords: ['nature'], category: 'nature', visual_density: 0.7 },
            typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
            layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
            metadata: { analysis_confidence: 0.85, processing_notes: `${theme.name} theme`, analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
          }
        });

        // Mock poem generation
        cy.mockPoemGeneration({
          success: true,
          poem: theme.poem
        });

        // Generate poem and apply theme
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();

        // Take visual snapshot
        cy.percySnapshot(`${theme.name}-visual-test`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });

    it('should capture animation states visually', () => {
      const animationStates = [
        { name: 'initial', delay: 0 },
        { name: 'loading', delay: 1000 },
        { name: 'animating', delay: 2000 },
        { name: 'complete', delay: 4000 }
      ];

      // Mock successful responses
      cy.mockPoemGeneration({
        success: true,
        poem: 'The graceful butterfly dances through the morning light'
      });

      cy.mockThemeAnalysis({
        success: true,
        data: {
          emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
          colors: {
            palette: [
              { hex: '#ffd700', weight: 0.8, role: 'primary' },
              { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
              { hex: '#98fb98', weight: 0.4, role: 'accent' },
              { hex: '#ffffff', weight: 0.3, role: 'neutral' },
              { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
            ]
          },
          animation: {
            style: 'energetic',
            timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
            movement_type: 'fade',
            particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
          },
          imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
          typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
          layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
          metadata: { analysis_confidence: 0.85, processing_notes: 'Animation test', analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
        }
      });

      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();

      animationStates.forEach(state => {
        // Wait for specific animation state
        cy.wait(state.delay);
        
        // Take snapshot at this state
        cy.percySnapshot(`animation-${state.name}-state`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });

    it('should capture particle effects visually', () => {
      const particleTypes = [
        { type: 'sparkles', density: 0.3, speed: 0.8 },
        { type: 'leaves', density: 0.2, speed: 0.6 },
        { type: 'rain', density: 0.5, speed: 1.0 },
        { type: 'snow', density: 0.4, speed: 0.7 },
        { type: 'bubbles', density: 0.3, speed: 0.9 },
        { type: 'light_rays', density: 0.2, speed: 0.5 },
        { type: 'dust', density: 0.1, speed: 0.4 },
        { type: 'fireflies', density: 0.2, speed: 0.6 }
      ];

      particleTypes.forEach(particle => {
        // Mock theme analysis with specific particle type
        cy.mockThemeAnalysis({
          success: true,
          data: {
            emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
            colors: {
              palette: [
                { hex: '#ffd700', weight: 0.8, role: 'primary' },
                { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
                { hex: '#98fb98', weight: 0.4, role: 'accent' },
                { hex: '#ffffff', weight: 0.3, role: 'neutral' },
                { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
              ]
            },
            animation: {
              style: 'energetic',
              timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
              movement_type: 'fade',
              particles: { enabled: true, type: particle.type, density: particle.density, speed: particle.speed }
            },
            imagery: { keywords: ['nature'], category: 'nature', visual_density: 0.7 },
            typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
            layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
            metadata: { analysis_confidence: 0.85, processing_notes: `${particle.type} particles`, analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
          }
        });

        // Mock poem generation
        cy.mockPoemGeneration({
          success: true,
          poem: 'The graceful butterfly dances through the morning light'
        });

        // Generate poem and apply theme
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();

        // Wait for particles to render
        cy.wait(3000);

        // Take visual snapshot
        cy.percySnapshot(`particles-${particle.type}`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });
  });

  describe('Responsive Design', () => {
    it('should capture responsive layouts visually', () => {
      const viewports = [
        { name: 'mobile', width: 375, height: 667 },
        { name: 'tablet', width: 768, height: 1024 },
        { name: 'desktop', width: 1280, height: 720 },
        { name: 'large-desktop', width: 1920, height: 1080 }
      ];

      // Mock successful responses
      cy.mockPoemGeneration({
        success: true,
        poem: 'The graceful butterfly dances through the morning light'
      });

      cy.mockThemeAnalysis({
        success: true,
        data: {
          emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
          colors: {
            palette: [
              { hex: '#ffd700', weight: 0.8, role: 'primary' },
              { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
              { hex: '#98fb98', weight: 0.4, role: 'accent' },
              { hex: '#ffffff', weight: 0.3, role: 'neutral' },
              { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
            ]
          },
          animation: {
            style: 'energetic',
            timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
            movement_type: 'fade',
            particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
          },
          imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
          typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
          layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
          metadata: { analysis_confidence: 0.85, processing_notes: 'Responsive test', analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
        }
      });

      viewports.forEach(viewport => {
        // Set viewport
        cy.viewport(viewport.width, viewport.height);

        // Generate poem and apply theme
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();

        // Take visual snapshot
        cy.percySnapshot(`responsive-${viewport.name}`, {
          widths: [viewport.width],
          minHeight: viewport.height
        });
      });
    });

    it('should capture mobile-specific interactions visually', () => {
      cy.setMobileViewport();

      // Mock successful responses
      cy.mockPoemGeneration({
        success: true,
        poem: 'The graceful butterfly dances through the morning light'
      });

      cy.mockThemeAnalysis({
        success: true,
        data: {
          emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
          colors: {
            palette: [
              { hex: '#ffd700', weight: 0.8, role: 'primary' },
              { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
              { hex: '#98fb98', weight: 0.4, role: 'accent' },
              { hex: '#ffffff', weight: 0.3, role: 'neutral' },
              { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
            ]
          },
          animation: {
            style: 'energetic',
            timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
            movement_type: 'fade',
            particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
          },
          imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
          typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
          layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
          metadata: { analysis_confidence: 0.85, processing_notes: 'Mobile test', analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
        }
      });

      // Test mobile interactions
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();

      // Take mobile snapshot
      cy.percySnapshot('mobile-interactions', {
        widths: [375],
        minHeight: 667
      });

      // Test mobile menu/overlay
      cy.get('[data-testid="mobile-menu-button"]').click();
      cy.percySnapshot('mobile-menu-open', {
        widths: [375],
        minHeight: 667
      });
    });
  });

  describe('Error States', () => {
    it('should capture error states visually', () => {
      const errorStates = [
        {
          name: 'api-error',
          scenario: 'network-error',
          message: 'Network connection failed'
        },
        {
          name: 'server-error',
          scenario: 'server-error',
          message: 'Internal server error'
        },
        {
          name: 'timeout-error',
          scenario: 'timeout',
          message: 'Request timeout'
        },
        {
          name: 'validation-error',
          scenario: 'validation',
          message: 'Invalid input'
        }
      ];

      errorStates.forEach(error => {
        // Mock error response
        cy.mockApiError('/api/generate', 500, error.message);

        // Fill and submit form
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();

        // Wait for error
        cy.wait('@apiError');

        // Take error state snapshot
        cy.percySnapshot(`error-${error.name}`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });

    it('should capture loading states visually', () => {
      // Mock slow response
      cy.intercept('POST', '/api/generate', {
        delay: 3000,
        statusCode: 200,
        body: {
          success: true,
          poem: 'The graceful butterfly dances through the morning light'
        }
      }).as('slowResponse');

      // Fill and submit form
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();

      // Capture loading state
      cy.percySnapshot('loading-state', {
        widths: [375, 768, 1280],
        minHeight: 600
      });

      // Wait for completion
      cy.wait('@slowResponse');

      // Capture completed state
      cy.percySnapshot('completed-state', {
        widths: [375, 768, 1280],
        minHeight: 600
      });
    });
  });

  describe('Accessibility States', () => {
    it('should capture accessibility states visually', () => {
      // Mock successful responses
      cy.mockPoemGeneration({
        success: true,
        poem: 'The graceful butterfly dances through the morning light'
      });

      cy.mockThemeAnalysis({
        success: true,
        data: {
          emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
          colors: {
            palette: [
              { hex: '#ffd700', weight: 0.8, role: 'primary' },
              { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
              { hex: '#98fb98', weight: 0.4, role: 'accent' },
              { hex: '#ffffff', weight: 0.3, role: 'neutral' },
              { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
            ]
          },
          animation: {
            style: 'energetic',
            timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
            movement_type: 'fade',
            particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
          },
          imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
          typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
          layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
          metadata: { analysis_confidence: 0.85, processing_notes: 'Accessibility test', analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
        }
      });

      // Test high contrast mode
      cy.get('body').invoke('addClass', 'high-contrast');
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();

      cy.percySnapshot('high-contrast-mode', {
        widths: [375, 768, 1280],
        minHeight: 600
      });

      // Test reduced motion
      cy.get('body').invoke('removeClass', 'high-contrast');
      cy.get('body').invoke('addClass', 'reduced-motion');
      cy.visit('/');
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.submitPoemForm();
      cy.wait('@generatePoem');
      cy.wait('@analyzeTheme');
      cy.waitForThemeAnalysis();

      cy.percySnapshot('reduced-motion-mode', {
        widths: [375, 768, 1280],
        minHeight: 600
      });

      // Test focus states
      cy.get('body').invoke('removeClass', 'reduced-motion');
      cy.visit('/');
      cy.fillPoemForm('dance', 'graceful', 'butterfly');
      cy.get('[data-testid="generate-button"]').focus();
      cy.percySnapshot('focus-state', {
        widths: [375, 768, 1280],
        minHeight: 600
      });
    });
  });

  describe('Typography Variations', () => {
    it('should capture typography variations visually', () => {
      const typographyMoods = [
        { mood: 'modern', fontFamily: 'Inter, sans-serif', fontWeight: 400 },
        { mood: 'classic', fontFamily: 'Times New Roman, serif', fontWeight: 400 },
        { mood: 'playful', fontFamily: 'Comic Sans MS, cursive', fontWeight: 400 },
        { mood: 'elegant', fontFamily: 'Georgia, serif', fontWeight: 300 }
      ];

      typographyMoods.forEach(typography => {
        // Mock theme analysis with specific typography
        cy.mockThemeAnalysis({
          success: true,
          data: {
            emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
            colors: {
              palette: [
                { hex: '#ffd700', weight: 0.8, role: 'primary' },
                { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
                { hex: '#98fb98', weight: 0.4, role: 'accent' },
                { hex: '#ffffff', weight: 0.3, role: 'neutral' },
                { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
              ]
            },
            animation: {
              style: 'energetic',
              timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
              movement_type: 'fade',
              particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
            },
            imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
            typography: { 
              mood: typography.mood, 
              font_weight: typography.fontWeight, 
              font_scale: 1.1, 
              line_height: 1.6, 
              letter_spacing: 0.02, 
              text_shadow: 1 
            },
            layout: { spacing_scale: 1.2, border_radius: 12, backdrop_blur: 8, gradient_angle: 135, opacity_variations: [0.9, 0.6, 0.3] },
            metadata: { analysis_confidence: 0.85, processing_notes: `${typography.mood} typography`, analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
          }
        });

        // Mock poem generation
        cy.mockPoemGeneration({
          success: true,
          poem: 'The graceful butterfly dances through the morning light'
        });

        // Generate poem and apply theme
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();

        // Take typography snapshot
        cy.percySnapshot(`typography-${typography.mood}`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });
  });

  describe('Layout Variations', () => {
    it('should capture layout variations visually', () => {
      const layoutStyles = [
        { name: 'centered', justifyContent: 'center', alignItems: 'center' },
        { name: 'book', justifyContent: 'flex-start', alignItems: 'flex-start' },
        { name: 'spiral', justifyContent: 'center', alignItems: 'center', transform: 'rotate(5deg)' },
        { name: 'scattered', justifyContent: 'space-around', alignItems: 'flex-start' }
      ];

      layoutStyles.forEach(layout => {
        // Mock theme analysis with specific layout
        cy.mockThemeAnalysis({
          success: true,
          data: {
            emotion: { primary: 'joy', intensity: 0.8, secondary: [] },
            colors: {
              palette: [
                { hex: '#ffd700', weight: 0.8, role: 'primary' },
                { hex: '#87ceeb', weight: 0.6, role: 'secondary' },
                { hex: '#98fb98', weight: 0.4, role: 'accent' },
                { hex: '#ffffff', weight: 0.3, role: 'neutral' },
                { hex: '#f0f8ff', weight: 0.2, role: 'highlight' }
              ]
            },
            animation: {
              style: 'energetic',
              timing: { duration: 2000, stagger_delay: 150, easing: 'ease-out' },
              movement_type: 'fade',
              particles: { enabled: true, type: 'sparkles', density: 0.3, speed: 0.8 }
            },
            imagery: { keywords: ['butterfly'], category: 'nature', visual_density: 0.7 },
            typography: { mood: 'elegant', font_weight: 400, font_scale: 1.1, line_height: 1.6, letter_spacing: 0.02, text_shadow: 1 },
            layout: { 
              spacing_scale: 1.2, 
              border_radius: 12, 
              backdrop_blur: 8, 
              gradient_angle: 135, 
              opacity_variations: [0.9, 0.6, 0.3],
              style: layout.name
            },
            metadata: { analysis_confidence: 0.85, processing_notes: `${layout.name} layout`, analysis_timestamp: new Date().toISOString(), model_used: 'claude-3-5-sonnet', poem_hash: 'test-hash' }
          }
        });

        // Mock poem generation
        cy.mockPoemGeneration({
          success: true,
          poem: 'The graceful butterfly dances through the morning light'
        });

        // Generate poem and apply theme
        cy.fillPoemForm('dance', 'graceful', 'butterfly');
        cy.submitPoemForm();
        cy.wait('@generatePoem');
        cy.wait('@analyzeTheme');
        cy.waitForThemeAnalysis();

        // Take layout snapshot
        cy.percySnapshot(`layout-${layout.name}`, {
          widths: [375, 768, 1280],
          minHeight: 600
        });
      });
    });
  });
});
