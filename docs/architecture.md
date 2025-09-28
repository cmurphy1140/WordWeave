# WordWeave Architecture

![WordWeave Architecture Diagram](../public/design.png)

## System Overview

WordWeave is built on a modern serverless architecture that transforms user-generated poetry into immersive, animated web experiences. The system leverages AWS services for scalability, reliability, and cost-effectiveness.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  React Frontend (TypeScript + Motion)                              │
│  ├── Components (Poetry Input, Theme Display, Animations)          │
│  ├── Context API (State Management)                                │
│  ├── Hooks (Custom React Hooks)                                    │
│  └── Utilities (Theme Engine, Animation Controller)                │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│                      DELIVERY LAYER                                │
├─────────────────────────────────────────────────────────────────────┤
│  CloudFront CDN                                                    │
│  ├── Global Edge Locations                                         │
│  ├── Static Asset Caching                                          │
│  ├── API Response Caching                                          │
│  └── SSL/TLS Termination                                           │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│                        API LAYER                                   │
├─────────────────────────────────────────────────────────────────────┤
│  API Gateway (HTTP API)                                            │
│  ├── Request Validation                                             │
│  ├── Rate Limiting (10 req/min)                                    │
│  ├── CORS Configuration                                             │
│  ├── API Key Authentication                                         │
│  └── Request/Response Transformation                                │
└─────────────────┬───────────────────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────────────────┐
│                     COMPUTE LAYER                                  │
├─────────────────────────────────────────────────────────────────────┤
│  Lambda Functions (Python 3.11)                                   │
│  ├── lambda_function.py (Poem Generation)                          │
│  │   ├── Input Validation                                          │
│  │   ├── Bedrock API Integration                                   │
│  │   └── Response Formatting                                       │
│  ├── theme_analyzer.py (Theme Analysis)                            │
│  │   ├── Emotion Analysis                                          │
│  │   ├── Color Palette Generation                                  │
│  │   └── Animation Style Selection                                 │
│  ├── user_management.py (Authentication)                           │
│  │   ├── JWT Token Management                                       │
│  │   ├── User Registration/Login                                   │
│  │   └── Profile Management                                        │
│  └── Common Libraries                                               │
│      ├── Input Validation                                          │
│      ├── Error Handling                                            │
│      └── CloudWatch Logging                                        │
└─────────┬───────────────────────────┬───────────────────────────────┘
          │                           │
┌─────────▼───────────┐    ┌──────────▼──────────┐
│   AI/ML LAYER      │    │   STORAGE LAYER     │
├────────────────────┤    ├─────────────────────┤
│  AWS Bedrock       │    │  DynamoDB           │
│  ├── Claude 3.5    │    │  ├── Poems Table    │
│  │   Sonnet        │    │  ├── Themes Table   │
│  ├── Content       │    │  ├── Analytics      │
│  │   Filtering     │    │  └── User Sessions  │
│  └── Token         │    │                     │
│      Management    │    │  ElastiCache        │
└────────────────────┘    │  ├── Redis Cluster  │
                          │  ├── Session Cache   │
                          │  └── Response Cache  │
                          └─────────────────────┘
```

## Component Details

### Frontend Layer

**Technology Stack:**
- React 18 with TypeScript
- Framer Motion for animations
- CSS Variables for dynamic theming
- Context API for state management

**Key Components:**
- `PoemGenerator`: Input form and generation trigger
- `ThemeProvider`: Dynamic theme application
- `AnimationController`: Motion animation orchestration
- `PoemDisplay`: Animated poem rendering

**Performance Features:**
- Code splitting with React.lazy()
- Memoization for expensive computations
- Optimized re-renders with useMemo/useCallback
- Service worker for offline functionality

### API Gateway Layer

**Configuration:**
- HTTP API (lower latency than REST API)
- JWT-based authentication with 24-hour expiration
- Request/response validation
- CORS enabled for web clients
- Rate limiting: 100/hour authenticated, 10/hour anonymous

**Security:**
- AWS WAF with DDoS protection
- JWT token authentication
- Input sanitization and validation
- HTTPS only with TLS 1.2+
- KMS encryption for sensitive data

### Lambda Functions

#### generatePoem Function

```typescript
interface GeneratePoemRequest {
  verb: string;
  adjective: string;
  noun: string;
}

interface GeneratePoemResponse {
  poem: string;
  theme: Theme;
  metadata: Metadata;
}
```

**Process Flow:**
1. Validate input parameters
2. Check DynamoDB cache for existing poem
3. Call Bedrock Claude API for generation
4. Process and format response
5. Cache result in DynamoDB
6. Return formatted response

#### analyzeTheme Function

**Responsibilities:**
- Emotion detection from poem text
- Color palette generation based on sentiment
- Animation style selection
- Typography mood determination

**Algorithm:**
1. Sentiment analysis using Claude
2. Emotion mapping to color psychology
3. Theme generation with accessibility considerations
4. Animation parameter calculation

### AWS Bedrock Integration

**Model Configuration:**
- Model: `anthropic.claude-3-5-sonnet-20241022`
- Max Tokens: 2048
- Temperature: 0.7 (balanced creativity/consistency)
- Top P: 0.9

**Prompt Engineering:**
```xml
<poem_generation>
  <context>User input for themed poem generation</context>
  <constraints>
    <length>12 lines</length>
    <style>free verse</style>
    <tone>adaptive to word choices</tone>
  </constraints>
  <words>
    <verb>{verb}</verb>
    <adjective>{adjective}</adjective>
    <noun>{noun}</noun>
  </words>
  <output_format>JSON with poem and analysis</output_format>
</poem_generation>
```

### Data Storage

#### DynamoDB Tables

**Poems Table:**
```
Primary Key: PoemId (String)
Attributes:
- Poem (String): Generated poem text
- Theme (Map): Color and animation data
- InputWords (Map): Original verb, adjective, noun
- CreatedAt (String): ISO timestamp
- WordCount (Number): Poem word count
- Sentiment (String): Detected emotion
```

**Users Table:**
```
Primary Key: UserId (String)
Attributes:
- Email (String): User email address
- Username (String): Display name
- PasswordHash (String): Bcrypt hashed password
- CreatedAt (String): ISO timestamp
- LastLogin (String): Last login timestamp
- Settings (Map): User preferences
- PoemsGenerated (Number): Total poems created
```

**Analytics Table:**
```
Primary Key: Date (String)
Sort Key: RequestId (String)
Attributes:
- UserId (String): User identifier (authenticated users)
- GenerationTime (Number): Processing duration
- CacheHit (Boolean): Whether result was cached
- InputWords (Map): Request parameters
- Success (Boolean): Request success status
```

#### ElastiCache (Redis)

**Caching Strategy:**
- Poem cache: 24-hour TTL
- Theme cache: 1-hour TTL
- User session: 30-minute TTL
- API rate limiting counters

**Cache Keys:**
```
poem:{hash_of_inputs} -> poem_data
theme:{sentiment}_{emotion} -> theme_data
rate_limit:{ip_address} -> request_count
session:{session_id} -> user_data
```

## Scalability Considerations

### Auto Scaling

**Lambda Functions:**
- Reserved concurrency: 10 per function
- Provisioned concurrency for production
- Memory: 1024 MB (balanced cost/performance)
- Timeout: 30 seconds

**DynamoDB:**
- On-demand billing mode
- Auto-scaling based on traffic
- Global secondary indexes for queries
- Point-in-time recovery enabled

**ElastiCache:**
- Multi-AZ deployment
- Automatic failover
- Cluster mode for horizontal scaling
- Backup and restore capabilities

### Performance Targets

| Metric | Target | Current |
|--------|---------|---------|
| API Response Time | <2s | 1.3s |
| Cache Hit Ratio | >80% | 85% |
| Lambda Cold Start | <500ms | 300ms |
| Frontend Bundle Size | <200KB | 156KB |
| Lighthouse Score | >90 | 94 |

## Security Architecture

### Data Protection
- Encryption at rest (DynamoDB, S3)
- Encryption in transit (HTTPS/TLS 1.2+)
- API Gateway request validation
- Input sanitization and validation

### Access Control
- IAM roles with least privilege
- API key authentication
- CORS policy restrictions
- AWS WAF for DDoS protection

### Content Filtering
- Bedrock guardrails for inappropriate content
- Custom content validation rules
- Automatic content moderation
- User reporting system

## Monitoring & Observability

### CloudWatch Metrics
- Lambda function performance
- API Gateway request/error rates
- DynamoDB read/write capacity
- Cache hit/miss ratios

### Logging Strategy
- Structured JSON logging
- Correlation IDs for request tracking
- Error aggregation and alerting
- Performance monitoring

### Alerting
- High error rates (>5%)
- Increased response times (>3s)
- AWS service health issues
- Cost threshold breaches

## Cost Optimization

### Current Cost Structure
- Lambda: ~$15/month (1000 daily users)
- DynamoDB: ~$5/month
- Bedrock: ~$2/month
- CloudFront: ~$1/month
- **Total: ~$23/month**

### Optimization Strategies
1. Aggressive caching to reduce Bedrock calls
2. DynamoDB on-demand pricing
3. CloudFront edge caching
4. Lambda memory optimization
5. Reserved capacity for predictable workloads

## Deployment Strategy

### Environments
- **Development**: Single region, minimal resources
- **Staging**: Production-like setup for testing
- **Production**: Multi-AZ, full monitoring

### CI/CD Pipeline
1. Code commit triggers GitHub Actions
2. Automated testing (unit, integration, e2e)
3. Security scanning (SAST/DAST)
4. Staging deployment
5. Production deployment with blue-green strategy

### Infrastructure as Code
- Serverless Framework for Lambda deployment
- CloudFormation for AWS resources
- Environment-specific configurations
- Automated rollback capabilities

## Future Architecture Considerations

### Planned Enhancements
1. **Multi-region deployment** for global latency
2. **GraphQL API** for flexible data fetching
3. **WebSocket support** for real-time collaboration
4. **ML model hosting** for custom theme generation
5. **Mobile app backend** with shared services

### Scalability Roadmap
1. **1K daily users**: Current architecture sufficient
2. **10K daily users**: Add ElastiCache, optimize caching
3. **100K daily users**: Multi-region, CDN optimization
4. **1M daily users**: Microservices, event-driven architecture

This architecture provides a solid foundation for WordWeave's growth while maintaining cost-effectiveness and performance at scale.

