# WordWeave

> Transform poetry into living, breathing web experiences with AI-powered visual themes and animations

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AWS](https://img.shields.io/badge/AWS-Bedrock-orange)](https://aws.amazon.com/bedrock/)
[![React](https://img.shields.io/badge/React-18.2-blue)](https://reactjs.org/)
[![Motion](https://img.shields.io/badge/Motion-11.0-purple)](https://motion.dev/)

## Overview

WordWeave is a dynamic web application that transforms user-generated poetry into immersive, animated web experiences using AWS Bedrock's Claude AI and React with Motion animations.

### Key Features

- **AI-Powered Poetry Generation**: Input three words to generate unique poems via Claude 3.5 Sonnet
- **Dynamic Visual Transformation**: Real-time website theming based on poem emotion
- **Stunning Animations**: Word-by-word reveals, particle effects, and 60fps transitions
- **Production-Ready Architecture**: Serverless AWS infrastructure with global CDN
- **User Authentication**: JWT-based authentication with poem persistence
- **Comprehensive Monitoring**: CloudWatch dashboards and alerting

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- AWS Account with Bedrock access
- AWS CLI configured

### Local Development

```bash
# Clone and install
git clone https://github.com/yourusername/wordweave.git
cd wordweave
npm run install:all

# Start development environment
npm run dev
```

Visit `http://localhost:3000` to see WordWeave in action!

### Production Deployment

```bash
# Validate configuration
./scripts/validate-config.sh

# Complete production deployment
./scripts/deploy-all.sh
```

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   CloudFront    │────│   API Gateway    │────│   Lambda        │
│   + WAF         │    │   + Custom       │    │   Functions     │
│   (Global CDN)  │    │   Domain         │    │   (Serverless)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                       │
         ▼                        ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   S3 + Route53  │    │   DynamoDB       │    │   Bedrock       │
│   (Frontend)    │    │   (Database)     │    │   (Claude AI)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Technology Stack

**Frontend**
- React 18 with TypeScript
- Motion (Framer Motion) for animations
- React Query for state management
- Service Worker for PWA features

**Backend**
- AWS Lambda (Python 3.11)
- API Gateway with custom domain
- DynamoDB with caching
- AWS Bedrock (Claude 3.5 Sonnet)

**DevOps**
- GitHub Actions CI/CD
- CloudWatch monitoring
- Infrastructure as Code
- Automated testing

## Project Structure

```
wordweave/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── animations/      # Animation components
│   │   ├── contexts/        # Context providers
│   │   ├── hooks/           # Custom hooks
│   │   └── pages/           # Page components
│   └── public/
├── backend/                  # Serverless backend
│   ├── lambda_function.py   # Poem generation
│   ├── theme_analyzer.py    # Theme analysis
│   ├── user_management.py   # Authentication
│   └── serverless-prod.yml  # Production config
├── scripts/                  # Deployment scripts
│   ├── validate-config.sh   # Configuration validation
│   ├── setup-domain.sh      # Domain setup
│   ├── deploy-all.sh        # Complete deployment
│   └── test-deployment.sh   # Testing suite
├── monitoring/               # CloudWatch setup
└── docs/                     # Documentation
```

## Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # React app on port 3000
npm run dev:backend      # Python mock server on port 3001

# Building
npm run build            # Build both frontend and backend
npm run test             # Run all tests
npm run lint             # Lint all code

# Deployment
npm run deploy:dev       # Deploy to development
npm run deploy:prod      # Deploy to production
```

### Environment Setup

1. **Frontend Environment** (`.env.local`)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=development
```

2. **Backend Environment** (`.env`)
```bash
AWS_REGION=us-east-1
BEDROCK_MODEL_ID=anthropic.claude-3-5-sonnet-20241022
LOG_LEVEL=INFO
```

## API Usage

### Generate Poem
```bash
POST /api/generate
{
  "verb": "whisper",
  "adjective": "ancient",
  "noun": "forest"
}
```

### Analyze Theme
```bash
POST /api/analyze
{
  "poem": "In ancient woods where shadows dance..."
}
```

## Features

### Animation Components

WordWeave includes 5 specialized animation components:

1. **TypewriterText** - Character-by-character typing effect
2. **FadeInWords** - Word-by-word fade animations
3. **StaggeredLines** - Line-by-line reveals with multiple styles
4. **GlowingText** - Emotion-responsive glow effects
5. **MorphingText** - Smooth text transitions

### Theme Engine

- **5-color palette** generation from poem analysis
- **Complex gradients** based on emotional mood
- **Drama-based text shadows** and visual effects
- **Tempo-based animations** matching poem rhythm
- **Smooth 2-second transitions** between themes

### Security Features

- WAF protection on all endpoints
- KMS encryption for data at rest
- JWT-based authentication
- Rate limiting and throttling
- SSL/TLS 1.2+ enforcement

## Deployment

### Production Deployment

For production deployment, see [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md).

**Quick deployment:**
```bash
./scripts/deploy-all.sh
```

**Step-by-step:**
```bash
# 1. Validate configuration
./scripts/validate-config.sh

# 2. Set up domain and SSL
./scripts/setup-domain.sh

# 3. Deploy backend
cd backend && ./deploy-production.sh

# 4. Deploy frontend
cd ../frontend && ./deploy-production.sh

# 5. Test deployment
./scripts/test-deployment.sh
```

### Cost Estimation

Monthly costs for 1000 users/day:
- Lambda Functions: $15-25
- API Gateway: $3-8
- DynamoDB: $10-20
- CloudFront: $5-15
- S3 Storage: $1-3
- Route53: $1
- **Total: $35-72/month**

## Testing

### Comprehensive Testing Suite

```bash
# Run all tests
npm test

# Deployment testing
./scripts/test-deployment.sh

# Load testing
cd artillery && artillery run load-test.yml
```

The testing suite includes:
- DNS resolution validation
- SSL certificate verification
- API endpoint functionality
- Frontend performance testing
- Security validation
- Integration testing

## Performance

### Performance Targets
- API Response: <2 seconds
- Frontend Load: <3 seconds
- 99.9%+ availability
- 60fps animations
- Global <100ms latency

### Monitoring

WordWeave includes comprehensive monitoring:
- Real-time CloudWatch dashboards
- Business metrics tracking
- Cost optimization alerts
- Error rate notifications
- Performance monitoring

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Documentation

- [API Documentation](docs/api.md) - Complete API reference
- [Architecture Guide](docs/architecture.md) - System architecture and design
- [Features Documentation](docs/features.md) - Animation components and theme engine
- [Development Guide](docs/development.md) - Local development setup
- [Deployment Guide](docs/deployment.md) - Production deployment guide
- [Testing Guide](docs/testing.md) - Comprehensive testing documentation

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/wordweave/issues)
- **Documentation**: Check the `/docs` directory
- **Deployment Help**: Run `./scripts/validate-config.sh` for diagnostics

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Ready to transform words into worlds?** 🚀

Visit the deployed application: [https://wordweave.app](https://wordweave.app)