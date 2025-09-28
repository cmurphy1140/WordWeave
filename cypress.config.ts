/**
 * Cypress configuration for WordWeave E2E testing
 * Includes comprehensive test settings, environment variables, and custom commands
 */

import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // Base URL for tests
    baseUrl: 'http://localhost:3000',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Default command timeout
    defaultCommandTimeout: 10000,
    
    // Request timeout
    requestTimeout: 10000,
    
    // Response timeout
    responseTimeout: 10000,
    
    // Page load timeout
    pageLoadTimeout: 30000,
    
    // Video recording settings
    video: true,
    videoCompression: 32,
    videosFolder: 'cypress/videos',
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    screenshotsFolder: 'cypress/screenshots',
    
    // Test files pattern
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Downloads folder
    downloadsFolder: 'cypress/downloads',
    
    // Setup node events
    setupNodeEvents(on, config) {
      // Load environment variables
      require('dotenv').config();
      
      // Custom tasks for API mocking
      on('task', {
        // Mock API responses
        mockApiResponse: ({ endpoint, method, response, statusCode = 200 }) => {
          // This would integrate with your API mocking setup
          console.log(`Mocking ${method} ${endpoint} with status ${statusCode}`);
          return null;
        },
        
        // Reset API mocks
        resetApiMocks: () => {
          console.log('Resetting API mocks');
          return null;
        },
        
        // Database operations for test data
        seedTestData: (data) => {
          console.log('Seeding test data:', data);
          return null;
        },
        
        // Clean up test data
        cleanupTestData: () => {
          console.log('Cleaning up test data');
          return null;
        },
        
        // Performance monitoring
        logPerformanceMetrics: (metrics) => {
          console.log('Performance metrics:', metrics);
          return null;
        },
        
        // Theme analysis simulation
        simulateThemeAnalysis: (poem) => {
          // Simulate theme analysis response
          const mockResponse = {
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
              keywords: ['nature', 'joy', 'light'],
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
              processing_notes: 'Simulated theme analysis',
              analysis_timestamp: new Date().toISOString(),
              model_used: 'cypress-mock',
              poem_hash: 'mock-hash'
            }
          };
          
          return mockResponse;
        },
        
        // Poem generation simulation
        simulatePoemGeneration: ({ verb, adjective, noun }) => {
          const poems = [
            `The ${adjective} ${noun} ${verb}s gracefully through the morning light`,
            `${adjective} whispers dance as the ${noun} begins to ${verb}`,
            `In realms where ${adjective} dreams ${verb}, the ${noun} finds its song`,
            `The ${noun} ${verb}s with ${adjective} grace, painting stories in the air`,
            `${adjective} moments ${verb} where the ${noun} learns to fly`
          ];
          
          const randomPoem = poems[Math.floor(Math.random() * poems.length)];
          
          return {
            poem: randomPoem,
            success: true,
            timestamp: new Date().toISOString(),
            input: { verb, adjective, noun }
          };
        }
      });
      
      // Browser launch options
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          // Add Chrome flags for better testing
          launchOptions.args.push('--disable-web-security');
          launchOptions.args.push('--disable-features=VizDisplayCompositor');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-gpu');
          
          // Enable performance logging
          launchOptions.args.push('--enable-logging');
          launchOptions.args.push('--log-level=0');
        }
        
        return launchOptions;
      });
      
      // Custom viewport sizes for responsive testing
      config.viewportWidth = config.env.viewportWidth || 1280;
      config.viewportHeight = config.env.viewportHeight || 720;
      
      return config;
    },
    
    // Environment variables
    env: {
      // API endpoints
      API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3003',
      
      // Test data
      TEST_USER: 'cypress-test-user',
      
      // Feature flags
      ENABLE_ANIMATIONS: true,
      ENABLE_PARTICLES: true,
      ENABLE_THEME_ANALYSIS: true,
      
      // Performance thresholds
      PERFORMANCE_THRESHOLD_MS: 2000,
      ANIMATION_THRESHOLD_MS: 3000,
      
      // Visual regression settings
      VISUAL_THRESHOLD: 0.2,
      VISUAL_THRESHOLD_TYPE: 'percent',
      
      // Accessibility settings
      A11Y_RULES: ['wcag2a', 'wcag2aa', 'wcag21aa'],
      A11Y_IMPACT: ['serious', 'critical']
    },
    
    // Retry settings
    retries: {
      runMode: 2,
      openMode: 0
    },
    
    // Experimental features
    experimentalStudio: true,
    experimentalMemoryManagement: true,
    
    // Browser settings
    chromeWebSecurity: false,
    modifyObstructiveCode: false,
    
    // Network settings
    blockHosts: [
      '*.google-analytics.com',
      '*.googletagmanager.com',
      '*.doubleclick.net'
    ]
  },
  
  // Component testing configuration
  component: {
    devServer: {
      framework: 'create-react-app',
      bundler: 'webpack'
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    indexHtmlFile: 'cypress/support/component-index.html',
    video: true,
    screenshotOnRunFailure: true
  }
});
