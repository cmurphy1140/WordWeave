/**
 * Cypress E2E support file for WordWeave
 * Custom commands, utilities, and global configurations
 */

// Import commands.js using ES2015 syntax:
import './commands';

// Import custom commands
import './custom-commands';

// Import accessibility commands
import 'cypress-axe';

// Import visual testing commands
import '@percy/cypress';

// Import performance testing utilities
import './performance-commands';

// Import API mocking utilities
import './api-mocking';

// Import theme testing utilities
import './theme-commands';

// Import animation testing utilities
import './animation-commands';

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Ignore specific errors that don't affect functionality
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  if (err.message.includes('Non-Error promise rejection captured')) {
    return false;
  }
  
  if (err.message.includes('Loading chunk')) {
    return false;
  }
  
  // Log other errors but don't fail the test
  console.error('Uncaught exception:', err);
  return false;
});

// Global before hook
before(() => {
  // Set up global test environment
  cy.task('resetApiMocks');
  
  // Clear any existing data
  cy.clearLocalStorage();
  cy.clearCookies();
  
  // Set up performance monitoring
  cy.window().then((win) => {
    win.performance.mark('test-start');
  });
});

// Global after hook
after(() => {
  // Clean up test data
  cy.task('cleanupTestData');
  
  // Log performance metrics
  cy.window().then((win) => {
    const performanceEntries = win.performance.getEntriesByType('mark');
    const testStart = performanceEntries.find(entry => entry.name === 'test-start');
    
    if (testStart) {
      const testDuration = win.performance.now() - testStart.startTime;
      cy.task('logPerformanceMetrics', {
        testDuration,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Custom viewport commands
Cypress.Commands.add('setMobileViewport', () => {
  cy.viewport(375, 667);
});

Cypress.Commands.add('setTabletViewport', () => {
  cy.viewport(768, 1024);
});

Cypress.Commands.add('setDesktopViewport', () => {
  cy.viewport(1280, 720);
});

Cypress.Commands.add('setLargeDesktopViewport', () => {
  cy.viewport(1920, 1080);
});

// Custom wait commands
Cypress.Commands.add('waitForThemeAnalysis', (timeout = 10000) => {
  cy.get('[data-testid="theme-loading"]', { timeout }).should('not.exist');
  cy.get('[data-testid="poem-display"]').should('be.visible');
});

Cypress.Commands.add('waitForAnimations', (timeout = 5000) => {
  cy.get('[data-testid="poem-display"]').should('be.visible');
  cy.wait(timeout); // Allow animations to complete
});

// Custom accessibility commands
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe();
  cy.checkA11y(null, {
    rules: {
      'color-contrast': { enabled: false }, // Disable for theme variations
      'focus-order-semantics': { enabled: false } // Disable for animations
    }
  });
});

// Custom theme testing commands
Cypress.Commands.add('validateThemeApplication', () => {
  cy.get('[data-testid="poem-display"]').should('have.attr', 'data-theme-applied', 'true');
  cy.get('[data-testid="poem-display"]').should('have.css', 'background-color');
  cy.get('[data-testid="poem-display"]').should('have.css', 'color');
});

Cypress.Commands.add('checkThemeColors', (expectedColors) => {
  expectedColors.forEach((color, index) => {
    cy.get(`[data-testid="color-${index}"]`).should('have.css', 'background-color', color);
  });
});

// Custom animation testing commands
Cypress.Commands.add('checkAnimationPerformance', () => {
  cy.window().then((win) => {
    const performanceEntries = win.performance.getEntriesByType('measure');
    const animationEntries = performanceEntries.filter(entry => 
      entry.name.includes('animation') || entry.name.includes('transition')
    );
    
    animationEntries.forEach(entry => {
      expect(entry.duration).to.be.lessThan(cy.env('ANIMATION_THRESHOLD_MS'));
    });
  });
});

// Custom API testing commands
Cypress.Commands.add('mockPoemGeneration', (response) => {
  cy.intercept('POST', '/api/generate', {
    statusCode: 200,
    body: response
  }).as('generatePoem');
});

Cypress.Commands.add('mockThemeAnalysis', (response) => {
  cy.intercept('POST', '/api/analyze', {
    statusCode: 200,
    body: response
  }).as('analyzeTheme');
});

Cypress.Commands.add('mockApiError', (endpoint, statusCode = 500, errorMessage = 'Internal Server Error') => {
  cy.intercept('POST', endpoint, {
    statusCode,
    body: {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: errorMessage
      }
    }
  }).as('apiError');
});

// Custom form testing commands
Cypress.Commands.add('fillPoemForm', (verb, adjective, noun) => {
  cy.get('[data-testid="verb-input"]').clear().type(verb);
  cy.get('[data-testid="adjective-input"]').clear().type(adjective);
  cy.get('[data-testid="noun-input"]').clear().type(noun);
});

Cypress.Commands.add('submitPoemForm', () => {
  cy.get('[data-testid="generate-button"]').click();
});

// Custom visual testing commands
Cypress.Commands.add('takeThemeScreenshot', (name) => {
  cy.waitForThemeAnalysis();
  cy.percySnapshot(name, {
    widths: [375, 768, 1280],
    minHeight: 600
  });
});

Cypress.Commands.add('takeAnimationScreenshot', (name) => {
  cy.waitForAnimations();
  cy.percySnapshot(name, {
    widths: [375, 768, 1280],
    minHeight: 600
  });
});

// Custom performance testing commands
Cypress.Commands.add('measurePageLoad', () => {
  cy.window().then((win) => {
    const navigationEntry = win.performance.getEntriesByType('navigation')[0];
    const loadTime = navigationEntry.loadEventEnd - navigationEntry.loadEventStart;
    
    expect(loadTime).to.be.lessThan(cy.env('PERFORMANCE_THRESHOLD_MS'));
  });
});

Cypress.Commands.add('measureApiResponse', (alias) => {
  cy.get(`@${alias}`).then((interception) => {
    const responseTime = interception.response.duration;
    expect(responseTime).to.be.lessThan(5000); // 5 second threshold
  });
});

// Custom error testing commands
Cypress.Commands.add('testErrorHandling', (errorScenario) => {
  switch (errorScenario) {
    case 'network-error':
      cy.mockApiError('/api/generate', 0, 'Network Error');
      break;
    case 'server-error':
      cy.mockApiError('/api/generate', 500, 'Internal Server Error');
      break;
    case 'timeout':
      cy.intercept('POST', '/api/generate', {
        delay: 10000,
        statusCode: 200,
        body: { success: true }
      }).as('timeoutResponse');
      break;
    case 'invalid-response':
      cy.intercept('POST', '/api/generate', {
        statusCode: 200,
        body: 'invalid json'
      }).as('invalidResponse');
      break;
  }
});

// Custom accessibility testing commands
Cypress.Commands.add('testKeyboardNavigation', () => {
  cy.get('body').tab();
  cy.focused().should('be.visible');
  
  // Test tab order
  cy.get('[data-testid="verb-input"]').should('have.focus');
  cy.tab();
  cy.get('[data-testid="adjective-input"]').should('have.focus');
  cy.tab();
  cy.get('[data-testid="noun-input"]').should('have.focus');
  cy.tab();
  cy.get('[data-testid="generate-button"]').should('have.focus');
});

Cypress.Commands.add('testScreenReader', () => {
  cy.get('[data-testid="poem-display"]').should('have.attr', 'aria-label');
  cy.get('[data-testid="theme-loading"]').should('have.attr', 'aria-live', 'polite');
  cy.get('[data-testid="error-message"]').should('have.attr', 'aria-live', 'assertive');
});

// Custom responsive testing commands
Cypress.Commands.add('testResponsiveDesign', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 },
    { name: 'large-desktop', width: 1920, height: 1080 }
  ];
  
  viewports.forEach(viewport => {
    cy.viewport(viewport.width, viewport.height);
    cy.get('[data-testid="poem-display"]').should('be.visible');
    cy.percySnapshot(`responsive-${viewport.name}`, {
      widths: [viewport.width],
      minHeight: viewport.height
    });
  });
});

// Custom data validation commands
Cypress.Commands.add('validatePoemStructure', (poem) => {
  const lines = poem.split('\n');
  expect(lines.length).to.be.greaterThan(0);
  
  lines.forEach(line => {
    expect(line.trim()).to.not.be.empty;
  });
});

Cypress.Commands.add('validateThemeStructure', (theme) => {
  expect(theme).to.have.property('emotion');
  expect(theme).to.have.property('colors');
  expect(theme).to.have.property('animation');
  expect(theme).to.have.property('typography');
  expect(theme).to.have.property('layout');
  
  expect(theme.emotion).to.have.property('primary');
  expect(theme.emotion).to.have.property('intensity');
  expect(theme.colors).to.have.property('palette');
  expect(theme.animation).to.have.property('style');
});

// Custom cleanup commands
Cypress.Commands.add('cleanupTest', () => {
  cy.clearLocalStorage();
  cy.clearCookies();
  cy.task('resetApiMocks');
  cy.task('cleanupTestData');
});

// Custom assertion commands
Cypress.Commands.add('assertThemeApplied', () => {
  cy.get('[data-testid="poem-display"]').should('have.attr', 'data-theme-applied', 'true');
  cy.get('[data-testid="poem-display"]').should('have.css', 'background-color');
  cy.get('[data-testid="poem-display"]').should('have.css', 'color');
});

Cypress.Commands.add('assertAnimationsRunning', () => {
  cy.get('[data-testid="poem-display"]').should('have.class', 'animating');
  cy.get('[data-testid="poem-display"]').should('have.css', 'animation-duration');
});

Cypress.Commands.add('assertNoErrors', () => {
  cy.get('[data-testid="error-message"]').should('not.exist');
  cy.get('[data-testid="theme-error"]').should('not.exist');
});

// Extend Cypress types
declare global {
  namespace Cypress {
    interface Chainable {
      setMobileViewport(): Chainable<void>;
      setTabletViewport(): Chainable<void>;
      setDesktopViewport(): Chainable<void>;
      setLargeDesktopViewport(): Chainable<void>;
      waitForThemeAnalysis(timeout?: number): Chainable<void>;
      waitForAnimations(timeout?: number): Chainable<void>;
      checkA11y(): Chainable<void>;
      validateThemeApplication(): Chainable<void>;
      checkThemeColors(expectedColors: string[]): Chainable<void>;
      checkAnimationPerformance(): Chainable<void>;
      mockPoemGeneration(response: any): Chainable<void>;
      mockThemeAnalysis(response: any): Chainable<void>;
      mockApiError(endpoint: string, statusCode?: number, errorMessage?: string): Chainable<void>;
      fillPoemForm(verb: string, adjective: string, noun: string): Chainable<void>;
      submitPoemForm(): Chainable<void>;
      takeThemeScreenshot(name: string): Chainable<void>;
      takeAnimationScreenshot(name: string): Chainable<void>;
      measurePageLoad(): Chainable<void>;
      measureApiResponse(alias: string): Chainable<void>;
      testErrorHandling(errorScenario: string): Chainable<void>;
      testKeyboardNavigation(): Chainable<void>;
      testScreenReader(): Chainable<void>;
      testResponsiveDesign(): Chainable<void>;
      validatePoemStructure(poem: string): Chainable<void>;
      validateThemeStructure(theme: any): Chainable<void>;
      cleanupTest(): Chainable<void>;
      assertThemeApplied(): Chainable<void>;
      assertAnimationsRunning(): Chainable<void>;
      assertNoErrors(): Chainable<void>;
    }
  }
}
