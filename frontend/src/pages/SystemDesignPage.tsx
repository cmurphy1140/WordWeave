import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/system-design.css';

// SVG Icons for Architecture Components
const FrontendIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
    <path d="M7 11h10v4H7z"/>
  </svg>
);

const ApiGatewayIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const LambdaIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);

const DatabaseIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <ellipse cx="12" cy="5" rx="9" ry="3"/>
    <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5"/>
    <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3"/>
  </svg>
);

const CdnIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <polygon points="10 8 16 12 10 16 10 8"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const AiIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2a3 3 0 0 0-3 3c0 1.5 1.2 3 3 3s3-1.5 3-3a3 3 0 0 0-3-3"/>
    <path d="M19 11v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6"/>
    <path d="M12 8v13"/>
    <path d="M8 21h8"/>
    <circle cx="9" cy="11" r="1"/>
    <circle cx="15" cy="11" r="1"/>
  </svg>
);

const CacheIcon: React.FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
    <line x1="4" y1="22" x2="4" y2="15"/>
    <line x1="20" y1="22" x2="20" y2="15"/>
  </svg>
);

interface ArchitectureComponent {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  details: string[];
  position: { x: number; y: number };
}

const SystemDesignPage: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [activeFlow, setActiveFlow] = useState<number>(0);

  const components: ArchitectureComponent[] = [
    {
      id: 'frontend',
      title: 'React Frontend + Motion',
      description: 'Beautiful, animated user interface built with React and Framer Motion',
      icon: <FrontendIcon />,
      color: '#61dafb',
      details: [
        'TypeScript for type-safe development',
        'Framer Motion for smooth animations',
        'Progressive Web App capabilities',
        'Responsive design across all devices',
        'Real-time input validation'
      ],
      position: { x: 10, y: 20 }
    },
    {
      id: 'api-gateway',
      title: 'Amazon API Gateway',
      description: 'Secure entry point managing all API requests with throttling and monitoring',
      icon: <ApiGatewayIcon />,
      color: '#ff9900',
      details: [
        'Request routing to Lambda functions',
        'API key authentication',
        'Rate limiting and throttling',
        'CORS management',
        'Request/response transformation'
      ],
      position: { x: 35, y: 20 }
    },
    {
      id: 'lambda',
      title: 'Lambda Function',
      description: 'Serverless compute handling business logic and AI orchestration',
      icon: <LambdaIcon />,
      color: '#ff9900',
      details: [
        'Poetry generation logic',
        'Theme analysis processing',
        'Error handling and retries',
        'Cold start optimization',
        'CloudWatch integration'
      ],
      position: { x: 60, y: 20 }
    },
    {
      id: 'dynamodb',
      title: 'DynamoDB (Cache)',
      description: 'High-performance NoSQL database for intelligent poem caching',
      icon: <DatabaseIcon />,
      color: '#3f48cc',
      details: [
        'Sub-millisecond response times',
        '24-hour TTL for freshness',
        'Popular word combination tracking',
        'Automatic scaling',
        'Cost optimization through caching'
      ],
      position: { x: 35, y: 60 }
    },
    {
      id: 'cloudfront',
      title: 'CloudFront CDN',
      description: 'Global content delivery network ensuring fast loading worldwide',
      icon: <CdnIcon />,
      color: '#232f3e',
      details: [
        '400+ global edge locations',
        'Static asset caching',
        'Gzip compression',
        'HTTP/2 support',
        'Security headers'
      ],
      position: { x: 85, y: 35 }
    },
    {
      id: 'bedrock',
      title: 'Bedrock (Claude)',
      description: 'AI foundation model powering creative poetry generation',
      icon: <AiIcon />,
      color: '#00a86b',
      details: [
        'Claude 3.5 Sonnet model',
        'Custom prompt engineering',
        'Creative temperature settings',
        'Content filtering',
        'Quality assurance'
      ],
      position: { x: 85, y: 65 }
    },
    {
      id: 'redis',
      title: 'ElastiCache (Redis)',
      description: 'In-memory caching for ultra-fast session management',
      icon: <CacheIcon />,
      color: '#dc382d',
      details: [
        'Session storage',
        'Rate limiting',
        'Real-time analytics',
        'Word suggestions cache',
        'Atomic operations'
      ],
      position: { x: 60, y: 80 }
    }
  ];

  const dataFlowSteps = [
    { step: 1, title: 'User Input', description: 'User enters three words: verb, adjective, noun' },
    { step: 2, title: 'Frontend Validation', description: 'React validates inputs and shows loading animation' },
    { step: 3, title: 'API Gateway', description: 'Securely routes request to appropriate Lambda function' },
    { step: 4, title: 'Cache Check', description: 'Lambda checks DynamoDB for existing poem' },
    { step: 5, title: 'AI Generation', description: 'If not cached, Claude generates new creative poetry' },
    { step: 6, title: 'Cache Storage', description: 'New poem stored in DynamoDB for future requests' },
    { step: 7, title: 'Response Path', description: 'Poem travels back through API Gateway to frontend' },
    { step: 8, title: 'Animated Display', description: 'Beautiful typography and animations present the poem' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFlow((prev) => (prev + 1) % dataFlowSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [dataFlowSteps.length]);

  return (
    <div className="system-design-page">
      {/* Hero Section */}
      <motion.section 
        className="hero-section"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="hero-content">
          <motion.div 
            className="hero-icon"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: "backOut" }}
          >
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2L2 7v10c0 5.55 3.84 9.95 9 11 5.16-1.05 9-5.45 9-11V7l-10-5z"/>
              <path d="M9 12l2 2 4-4"/>
              <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.2"/>
            </svg>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            WordWeave System Architecture
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            Discover the sophisticated cloud-native architecture powering AI-driven poetry creation
          </motion.p>
          
          <motion.div 
            className="hero-badges"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <span className="badge">Serverless</span>
            <span className="badge">AI-Powered</span>
            <span className="badge">Scalable</span>
          </motion.div>
        </div>
      </motion.section>

      {/* Architecture Diagram */}
      <motion.section 
        className="architecture-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.8 }}
      >
        <h2>System Architecture</h2>
        
        {/* Architecture Diagram Container */}
        <div className="architecture-diagram">
          <img 
            src="/design.png" 
            alt="WordWeave System Architecture Diagram" 
            className="architecture-image"
          />
          
          {/* Interactive Overlay */}
          <div className="interactive-overlay">
            {components.map((component) => (
              <motion.div
                key={component.id}
                className={`component-marker ${selectedComponent === component.id ? 'active' : ''}`}
                style={{
                  left: `${component.position.x}%`,
                  top: `${component.position.y}%`,
                  backgroundColor: component.color
                }}
                onClick={() => setSelectedComponent(component.id)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="component-icon">{component.icon}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Component Details */}
        <AnimatePresence>
          {selectedComponent && (
            <motion.div
              className="component-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {components.map((component) => 
                component.id === selectedComponent && (
                  <div key={component.id} className="component-card">
                    <div className="component-header">
                      <span className="component-icon-large">{component.icon}</span>
                      <div>
                        <h3>{component.title}</h3>
                        <p>{component.description}</p>
                      </div>
                      <button 
                        className="close-button"
                        onClick={() => setSelectedComponent(null)}
                      >
                        ×
                      </button>
                    </div>
                    <ul className="component-features">
                      {component.details.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                )
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.p 
          className="interaction-hint"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ display: 'inline-block', marginRight: '8px' }}>
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          Click on any component in the diagram to learn more about its role
        </motion.p>
      </motion.section>

      {/* Data Flow Section */}
      <motion.section 
        className="data-flow-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <h2>Data Flow Journey</h2>
        <p>Follow how a poem request travels through our system:</p>
        
        <div className="flow-timeline">
          {dataFlowSteps.map((flowStep, index) => (
            <motion.div
              key={flowStep.step}
              className={`flow-step ${index === activeFlow ? 'active' : ''} ${index < activeFlow ? 'completed' : ''}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flow-number">{flowStep.step}</div>
              <div className="flow-content">
                <h4>{flowStep.title}</h4>
                <p>{flowStep.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* Performance Stats */}
      <motion.section 
        className="performance-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.8 }}
      >
        <h2>Performance Highlights</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">~400ms</div>
            <div className="stat-label">Average Response Time</div>
            <div className="stat-description">From user input to poem display</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">60%</div>
            <div className="stat-label">Cache Hit Rate</div>
            <div className="stat-description">Poems served instantly from cache</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">1000+</div>
            <div className="stat-label">Concurrent Users</div>
            <div className="stat-description">Auto-scaling serverless architecture</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Uptime SLA</div>
            <div className="stat-description">Reliable, always-available service</div>
          </div>
        </div>
      </motion.section>

      {/* Technology Stack */}
      <motion.section 
        className="tech-stack-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
      >
        <h2>Technology Stack</h2>
        <div className="tech-categories">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React 18 + TypeScript</li>
              <li>Framer Motion</li>
              <li>CSS Custom Properties</li>
              <li>Service Workers (PWA)</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>AWS Lambda (Python)</li>
              <li>Amazon API Gateway</li>
              <li>DynamoDB</li>
              <li>ElastiCache (Redis)</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>AI & ML</h3>
            <ul>
              <li>Amazon Bedrock</li>
              <li>Claude 3.5 Sonnet</li>
              <li>Custom Prompt Engineering</li>
              <li>Content Filtering</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Infrastructure</h3>
            <ul>
              <li>CloudFront CDN</li>
              <li>CloudWatch Monitoring</li>
              <li>IAM Security</li>
              <li>Serverless Framework</li>
            </ul>
          </div>
        </div>
      </motion.section>

      {/* Call to Action */}
      <motion.section 
        className="cta-section"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5, duration: 0.8 }}
      >
        <h2>Experience the Magic</h2>
        <p>Ready to create beautiful poetry with our AI-powered platform?</p>
        <motion.button
          className="cta-button"
          onClick={() => window.location.href = '/'}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Create Your Poem Now ✨
        </motion.button>
      </motion.section>
    </div>
  );
};

export default SystemDesignPage;
