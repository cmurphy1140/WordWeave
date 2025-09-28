/**
 * Babel configuration for WordWeave frontend
 * Supports TypeScript, React, and modern JavaScript features
 */

module.exports = {
  presets: [
    ['@babel/preset-env', {
      targets: {
        node: 'current',
        browsers: ['last 2 versions', 'not dead', '> 0.2%']
      },
      modules: 'commonjs',
      useBuiltIns: 'usage',
      corejs: 3
    }],
    ['@babel/preset-react', {
      runtime: 'automatic',
      development: process.env.NODE_ENV === 'development'
    }],
    ['@babel/preset-typescript', {
      allowDeclareFields: true,
      onlyRemoveTypeImports: true
    }]
  ],
  plugins: [
    // Transform class properties
    ['@babel/plugin-proposal-class-properties', { loose: true }],
    
    // Transform object rest/spread
    ['@babel/plugin-proposal-object-rest-spread', { useBuiltIns: true }],
    
    // Transform optional chaining and nullish coalescing
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
    
    // Transform dynamic imports
    '@babel/plugin-syntax-dynamic-import',
    
    // Transform decorators
    ['@babel/plugin-proposal-decorators', { legacy: true }],
    
    // Transform private methods
    '@babel/plugin-proposal-private-methods',
    
    // Transform private properties
    ['@babel/plugin-proposal-private-property-in-object', { loose: true }],
    
    // Transform async/await
    '@babel/plugin-transform-async-to-generator',
    
    // Transform arrow functions
    '@babel/plugin-transform-arrow-functions',
    
    // Transform template literals
    '@babel/plugin-transform-template-literals',
    
    // Transform destructuring
    '@babel/plugin-transform-destructuring',
    
    // Transform parameters
    '@babel/plugin-transform-parameters',
    
    // Transform spread
    '@babel/plugin-transform-spread',
    
    // Transform for-of loops
    '@babel/plugin-transform-for-of',
    
    // Transform computed properties
    '@babel/plugin-transform-computed-properties',
    
    // Transform shorthand properties
    '@babel/plugin-transform-shorthand-properties',
    
    // Transform sticky regex
    '@babel/plugin-transform-sticky-regex',
    
    // Transform unicode regex
    '@babel/plugin-transform-unicode-regex',
    
    // Transform block scoping
    '@babel/plugin-transform-block-scoping',
    
    // Transform classes
    '@babel/plugin-transform-classes',
    
    // Transform functions
    '@babel/plugin-transform-function-name',
    
    // Transform literals
    '@babel/plugin-transform-literals',
    
    // Transform member expressions
    '@babel/plugin-transform-member-expression-literals',
    
    // Transform object super
    '@babel/plugin-transform-object-super',
    
    // Transform property literals
    '@babel/plugin-transform-property-literals',
    
    // Transform reserved words
    '@babel/plugin-transform-reserved-words',
    
    // Transform typeof symbol
    '@babel/plugin-transform-typeof-symbol',
    
    // Transform exponentiation operator
    '@babel/plugin-transform-exponentiation-operator',
    
    // Transform new target
    '@babel/plugin-transform-new-target',
    
    // Transform object assign
    '@babel/plugin-transform-object-assign',
    
    // Transform property mutators
    '@babel/plugin-transform-property-mutators',
    
    // Transform regex
    '@babel/plugin-transform-regex',
    
    // Transform strict mode
    '@babel/plugin-transform-strict-mode'
  ],
  env: {
    test: {
      presets: [
        ['@babel/preset-env', {
          targets: { node: 'current' },
          modules: 'commonjs'
        }],
        ['@babel/preset-react', { runtime: 'automatic' }],
        ['@babel/preset-typescript', { allowDeclareFields: true }]
      ],
      plugins: [
        // Add test-specific plugins if needed
        '@babel/plugin-transform-modules-commonjs'
      ]
    },
    development: {
      plugins: [
        // Add development-specific plugins
        'react-refresh/babel'
      ]
    },
    production: {
      plugins: [
        // Add production-specific plugins
        ['transform-remove-console', { exclude: ['error', 'warn'] }]
      ]
    }
  }
};
