# WordWeave Comprehensive Testing Suite

This document provides a complete guide to the WordWeave testing infrastructure, covering unit tests, E2E tests, visual regression tests, performance monitoring, and more.

## Overview

WordWeave implements a comprehensive testing strategy with the following components:

1. **Jest Unit Tests** - Backend theme generation logic and frontend components
2. **React Testing Library** - Component testing with user interactions
3. **Cypress E2E Tests** - Full user flow testing
4. **Visual Regression Tests** - Percy/Chromatic visual testing
5. **Performance Tests** - Lighthouse CI performance monitoring
6. **Load Tests** - Artillery API load testing
7. **CloudWatch Monitoring** - AWS service monitoring and dashboards
8. **Sentry Error Tracking** - Frontend error monitoring
9. **Cost Alerts** - AWS cost monitoring and alerts
10. **A/B Testing Framework** - Theme variation experiments

## Getting Started

### Prerequisites

- Node.js 16+ and npm 8+
- Python 3.11+ (for backend tests)
- AWS CLI configured
- Sentry account (optional)
- Percy account (optional)

### Installation

```bash
# Install frontend testing dependencies
cd frontend
npm install

# Install Cypress testing dependencies
cd ../cypress
npm install

# Install backend testing dependencies
cd ../backend
pip install -r requirements.txt
pip install pytest pytest-mock
```

## Test Categories

### 1. Jest Unit Tests

**Location**: `frontend/src/__tests__/` and `backend/test_*.py`

**Purpose**: Test individual functions, components, and business logic

**Running Tests**:
```bash
# Frontend unit tests
cd frontend
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # With coverage
npm run test:ci            # CI mode

# Backend unit tests
cd backend
python -m pytest test_theme_analyzer_comprehensive.py -v
```

**Coverage Targets**:
- Overall: 80%
- Components: 85%
- Utils: 90%
- Contexts: 85%

### 2. React Testing Library Tests

**Location**: `frontend/src/__tests__/components/`

**Purpose**: Test React components with user interactions

**Key Test Files**:
- `PoemInput.test.tsx` - Form input and validation
- `PoemDisplay.test.tsx` - Theme application and animations
- `Navigation.test.tsx` - Navigation component
- `ThemeContext.test.tsx` - Theme management

**Running Tests**:
```bash
cd frontend
npm test -- --testPathPattern="components"
```

### 3. Cypress E2E Tests

**Location**: `cypress/e2e/`

**Purpose**: Test complete user flows and integration

**Key Test Files**:
- `poem-generation-flow.cy.ts` - Complete poem generation flow
- `visual-regression.cy.ts` - Visual testing scenarios
- `accessibility.cy.ts` - Accessibility compliance
- `performance.cy.ts` - Performance testing

**Running Tests**:
```bash
cd cypress
npm run cy:open           # Interactive mode
npm run cy:run            # Headless mode
npm run cy:run:chrome     # Specific browser
npm run test:e2e:ci       # CI mode
```

**Custom Commands Available**:
- `cy.fillPoemForm(verb, adjective, noun)`
- `cy.waitForThemeAnalysis()`
- `cy.validateThemeApplication()`
- `cy.checkA11y()`
- `cy.takeThemeScreenshot(name)`

### 4. Visual Regression Tests

**Configuration**: `.percy.yml`

**Purpose**: Detect visual changes in themes and layouts

**Running Tests**:
```bash
# With Percy
cd cypress
PERCY_TOKEN=your_token npm run test:visual

# With Chromatic (alternative)
npm run chromatic
```

**Test Scenarios**:
- Theme variations (joy, melancholy, serenity, wonder)
- Animation states (loading, animating, complete)
- Particle effects (sparkles, leaves, rain, snow, etc.)
- Responsive layouts (mobile, tablet, desktop)
- Error states and loading states
- Accessibility states (high contrast, reduced motion)

### 5. Performance Tests

**Configuration**: `.lighthouserc.js`

**Purpose**: Monitor Core Web Vitals and performance metrics

**Running Tests**:
```bash
# Install Lighthouse CI
npm install -g @lhci/cli

# Run performance tests
lhci autorun
```

**Performance Thresholds**:
- Performance Score: ≥80
- Accessibility Score: ≥90
- Best Practices Score: ≥80
- SEO Score: ≥80
- First Contentful Paint: ≤2000ms
- Largest Contentful Paint: ≤2500ms
- Cumulative Layout Shift: ≤0.1
- Total Blocking Time: ≤300ms

### 6. Load Tests

**Configuration**: `artillery/load-test.yml`

**Purpose**: Test API performance under load

**Running Tests**:
```bash
# Install Artillery
npm install -g artillery

# Run load tests
artillery run artillery/load-test.yml

# Run with custom target
artillery run artillery/load-test.yml --target http://your-api-url
```

**Test Scenarios**:
- Poem generation flow (70% of traffic)
- Theme analysis only (20% of traffic)
- Health checks (10% of traffic)

**Load Phases**:
1. Warm up: 5 users/second for 60s
2. Ramp up: 10 users/second for 120s
3. Sustained load: 15 users/second for 300s
4. Peak load: 20 users/second for 60s

## Monitoring and Observability

### 1. CloudWatch Dashboards

**Configuration**: `cloudwatch/dashboards/wordweave-dashboard.json`

**Metrics Tracked**:
- Lambda invocations, errors, duration, throttles
- DynamoDB read/write capacity units
- API Gateway metrics
- Custom application metrics

**Setting Up**:
```bash
# Deploy dashboard
aws cloudwatch put-dashboard \
  --dashboard-name "WordWeave-Monitoring" \
  --dashboard-body file://cloudwatch/dashboards/wordweave-dashboard.json
```

### 2. Sentry Error Tracking

**Configuration**: `frontend/src/utils/sentry.ts`

**Features**:
- Frontend error capture
- Performance monitoring
- User session tracking
- Custom error contexts

**Setup**:
```bash
# Add Sentry DSN to environment
export REACT_APP_SENTRY_DSN=your_sentry_dsn
```

### 3. Cost Monitoring

**Configuration**: `cloudwatch/cost-alerts.yml`

**Alerts**:
- Lambda costs > $50/day
- DynamoDB costs > $30/day
- Bedrock costs > $100/day
- Total AWS costs > $200/day
- Monthly budget alerts at 80% and 100%

**Deploying**:
```bash
aws cloudformation deploy \
  --template-file cloudwatch/cost-alerts.yml \
  --stack-name wordweave-cost-monitoring
```

## A/B Testing Framework

**Configuration**: `frontend/src/utils/abTesting.ts`

**Active Experiments**:
1. **Theme Animation Styles**
   - Control: Default calm animation
   - Variant 1: Energetic animation (25%)
   - Variant 2: Minimal animation (25%)

2. **Color Palette Variations**
   - Control: Default colors (50%)
   - Variant 1: Warm colors (25%)
   - Variant 2: Cool colors (25%)

**Usage**:
```typescript
import { useABTesting } from './utils/abTesting';

const { variant, config, trackEvent } = useABTesting('theme-animation-2024');

// Apply variant configuration
const themeWithVariant = applyVariantConfig(originalTheme, config);

// Track events
trackEvent('poem-generated', { theme: variant });
```

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Comprehensive Testing
on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd frontend && npm ci && npm run test:ci
      
  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd cypress && npm ci && npm run test:e2e:ci
      
  visual-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd cypress && npm run test:visual
      env:
        PERCY_TOKEN: ${{ secrets.PERCY_TOKEN }}
        
  performance-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g @lhci/cli && lhci autorun
      
  load-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install -g artillery && artillery run artillery/load-test.yml
```

## Best Practices

### 1. Test Organization
- Group tests by feature/component
- Use descriptive test names
- Keep tests independent and isolated
- Use data-testid attributes for reliable selectors

### 2. Performance Testing
- Run performance tests on production-like environments
- Monitor Core Web Vitals continuously
- Set realistic performance budgets
- Test on multiple devices and networks

### 3. Visual Testing
- Test theme variations comprehensively
- Include responsive breakpoints
- Test animation states
- Handle dynamic content appropriately

### 4. Error Handling
- Test error scenarios thoroughly
- Verify error messages are user-friendly
- Test retry mechanisms
- Monitor error rates in production

### 5. Accessibility
- Test with screen readers
- Verify keyboard navigation
- Check color contrast ratios
- Test with reduced motion preferences

## Troubleshooting

### Common Issues

1. **Cypress Tests Flaking**
   - Add proper waits and retries
   - Use data-testid selectors
   - Mock external dependencies

2. **Visual Tests Failing**
   - Check for dynamic content
   - Verify consistent test data
   - Review Percy configuration

3. **Performance Tests Failing**
   - Check network conditions
   - Verify test environment setup
   - Review performance budgets

4. **Load Tests Timing Out**
   - Check API endpoint availability
   - Verify load test configuration
   - Monitor resource usage

### Debug Commands

```bash
# Debug Cypress tests
cd cypress
npx cypress open --config video=false

# Debug Jest tests
cd frontend
npm test -- --verbose --no-coverage

# Debug performance tests
lhci autorun --collect.numberOfRuns=1

# Debug load tests
artillery run artillery/load-test.yml --output load-test-report.json
```

## Contributing

When adding new tests:

1. Follow existing patterns and conventions
2. Add appropriate test coverage
3. Update documentation
4. Ensure tests pass in CI
5. Add performance considerations

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Percy Documentation](https://docs.percy.io/)
- [Lighthouse CI](https://github.com/GoogleChrome/lighthouse-ci)
- [Artillery Documentation](https://artillery.io/docs/)
- [CloudWatch Documentation](https://docs.aws.amazon.com/cloudwatch/)
- [Sentry Documentation](https://docs.sentry.io/)
