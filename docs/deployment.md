# WordWeave Production Deployment Guide

This comprehensive guide covers the complete production deployment process for WordWeave, including infrastructure setup, CI/CD pipeline configuration, and monitoring.

## 🚀 Overview

WordWeave production deployment includes:
- **Backend**: AWS Serverless (Lambda + API Gateway + DynamoDB)
- **Frontend**: React SPA on CloudFront + S3
- **Domain**: Custom domain with SSL/TLS
- **Monitoring**: CloudWatch dashboards and alerting
- **CI/CD**: GitHub Actions automated deployment

## 📋 Prerequisites

### 1. AWS Account Setup
- AWS account with appropriate permissions
- AWS CLI installed and configured
- Route53 hosted zone for your domain
- ACM SSL certificate for `*.yourdomain.com`

### 2. Domain Configuration
- Domain registered and managed in Route53
- SSL certificate issued in `us-east-1` region
- DNS propagation completed

### 3. Development Tools
- Node.js 18+ and npm
- Python 3.11+
- Serverless Framework
- Git and GitHub repository

### 4. Required Secrets
- AWS Access Keys
- Domain certificate ARN
- Hosted Zone ID
- Slack webhook (optional)
- Sentry DSN (optional)

## 🔧 Step-by-Step Deployment

### Step 1: Clone and Setup Repository

```bash
git clone https://github.com/yourusername/wordweave.git
cd wordweave
```

### Step 2: Configure AWS Prerequisites

#### Create Route53 Hosted Zone
```bash
# If not already created
aws route53 create-hosted-zone \
  --name wordweave.app \
  --caller-reference $(date +%s)
```

#### Request SSL Certificate
```bash
# Request certificate for wildcard domain
aws acm request-certificate \
  --domain-name "*.wordweave.app" \
  --subject-alternative-names "wordweave.app" \
  --validation-method DNS \
  --region us-east-1
```

#### Validate Certificate
```bash
# Get certificate ARN and validation records
CERT_ARN=$(aws acm list-certificates \
  --region us-east-1 \
  --query "CertificateSummaryList[?DomainName=='*.wordweave.app'].CertificateArn" \
  --output text)

# Add DNS validation records to Route53
aws acm describe-certificate \
  --certificate-arn $CERT_ARN \
  --region us-east-1
```

### Step 3: Deploy Backend Infrastructure

```bash
cd backend

# Install dependencies
npm install -g serverless
npm install serverless-python-requirements serverless-domain-manager serverless-plugin-warmup serverless-plugin-aws-alerts

# Set up Python environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Deploy to production
./deploy-production.sh
```

**Manual Configuration Required:**
- Update `serverless-prod.yml` with your domain
- Configure SSL certificate ARN
- Set hosted zone ID

### Step 4: Deploy Frontend Infrastructure

```bash
cd frontend

# Install dependencies
npm ci

# Deploy CloudFront and S3
./deploy-production.sh
```

### Step 5: Set Up Monitoring and Alerting

```bash
cd monitoring

# Deploy CloudWatch alerts and dashboards
aws cloudformation deploy \
  --template-file cloudwatch-alerts.yml \
  --stack-name wordweave-monitoring-prod \
  --parameter-overrides \
    Environment=prod \
    AlertingEmail=alerts@yourdomain.com \
    SlackWebhookUrl=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK \
  --capabilities CAPABILITY_IAM
```

### Step 6: Configure CI/CD Pipeline

#### GitHub Secrets Configuration
Add these secrets to your GitHub repository:

```bash
# AWS Configuration
AWS_ACCESS_KEY_ID: Your AWS access key
AWS_SECRET_ACCESS_KEY: Your AWS secret key

# Domain Configuration
SSL_CERTIFICATE_ARN: arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID
HOSTED_ZONE_ID: ZABCDEFGHIJKLM

# Optional Integrations
SLACK_WEBHOOK_URL: https://hooks.slack.com/services/...
SENTRY_DSN: https://sentry.io/dsn/...
ANALYTICS_ID: GA-MEASUREMENT-ID
```

#### Enable GitHub Actions
The CI/CD pipeline is automatically triggered on:
- Push to `main` branch
- Git tags starting with `v*`
- Manual workflow dispatch

## 🔍 Verification and Testing

### 1. Backend Health Check
```bash
curl -f https://api.wordweave.app/health
```

### 2. Frontend Accessibility
```bash
curl -f https://wordweave.app
curl -f https://www.wordweave.app
```

### 3. API Functionality
```bash
# Test poem generation
curl -X POST https://api.wordweave.app/generate \
  -H "Content-Type: application/json" \
  -d '{"verb":"dance","adjective":"ethereal","noun":"moonlight"}'
```

### 4. Load Testing
```bash
cd artillery
npm install -g artillery
artillery run load-test.yml --target https://api.wordweave.app
```

## 📊 Monitoring and Maintenance

### CloudWatch Dashboards
- **Main Dashboard**: WordWeave-Production-Complete-prod
- **Backend Dashboard**: WordWeave-prod
- **Frontend Dashboard**: WordWeave-Frontend-prod

### Key Metrics to Monitor
- Lambda invocations and errors
- API Gateway latency and error rates
- DynamoDB capacity utilization
- CloudFront cache hit rates
- Daily AWS costs

### Alerting Thresholds
- Lambda errors > 10 in 5 minutes
- API latency > 5 seconds average
- DynamoDB throttles > 0
- CloudFront error rate > 5%
- Daily costs > $200

## 🚨 Troubleshooting

### Common Issues

#### 1. Domain Not Resolving
```bash
# Check DNS propagation
dig wordweave.app
dig www.wordweave.app

# Verify Route53 records
aws route53 list-resource-record-sets --hosted-zone-id YOUR_ZONE_ID
```

#### 2. SSL Certificate Issues
```bash
# Check certificate status
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN --region us-east-1

# Verify certificate validation
aws acm list-certificates --region us-east-1
```

#### 3. Backend Deployment Failures
```bash
# Check CloudFormation stack
aws cloudformation describe-stacks --stack-name wordweave-backend-prod

# Check Lambda logs
aws logs tail /aws/lambda/wordweave-poem-generator-prod --follow
```

#### 4. Frontend Not Loading
```bash
# Check CloudFront distribution
aws cloudfront list-distributions

# Check S3 bucket contents
aws s3 ls s3://wordweave-frontend-prod-ACCOUNT/

# Create CloudFront invalidation
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

### Emergency Procedures

#### 1. Rollback Deployment
```bash
# Rollback backend
cd backend
serverless rollback --config serverless-prod.yml --stage prod

# Rollback frontend (restore previous S3 version)
aws s3api list-object-versions --bucket wordweave-frontend-prod-ACCOUNT
```

#### 2. Scale Up Resources
```bash
# Increase Lambda concurrency
aws lambda put-reserved-concurrency \
  --function-name wordweave-poem-generator-prod \
  --reserved-concurrency-config ReservedConcurrency=100
```

#### 3. Enable Maintenance Mode
```bash
# Upload maintenance page to S3
aws s3 cp maintenance.html s3://wordweave-frontend-prod-ACCOUNT/index.html
```

## 🔐 Security Considerations

### 1. Access Control
- IAM roles with least privilege
- API Gateway rate limiting
- WAF protection enabled
- VPC endpoints for sensitive operations

### 2. Data Protection
- DynamoDB encryption at rest
- CloudWatch logs encryption
- S3 bucket encryption
- HTTPS/TLS 1.2+ only

### 3. Monitoring
- CloudTrail for API audit logs
- VPC Flow Logs for network monitoring
- GuardDuty for threat detection
- Config for compliance monitoring

## 💰 Cost Optimization

### Expected Monthly Costs (1000 users/day)
- Lambda: $15-25
- DynamoDB: $10-20
- CloudFront: $5-15
- API Gateway: $3-8
- S3: $1-3
- **Total: ~$35-70/month**

### Cost Monitoring
- Daily cost alerts at $20
- Monthly budget alerts at 80% and 100%
- Reserved capacity for predictable workloads
- Automated cleanup of old logs and backups

## 🔄 Backup and Disaster Recovery

### 1. Automated Backups
- DynamoDB Point-in-Time Recovery enabled
- S3 versioning for frontend assets
- CloudFormation templates in version control
- Database exports to S3 daily

### 2. Recovery Procedures
- Cross-region backup strategy
- Infrastructure as Code for quick rebuilds
- Documented recovery time objectives (RTO: 4 hours)
- Regular disaster recovery testing

## 📈 Performance Optimization

### 1. Frontend Optimizations
- CloudFront global distribution
- Aggressive caching for static assets
- Image optimization and WebP support
- Code splitting and lazy loading

### 2. Backend Optimizations
- Lambda provisioned concurrency for hot functions
- DynamoDB Global Secondary Indexes
- ElastiCache for frequently accessed data
- Connection pooling and keep-alive

### 3. Database Optimizations
- Proper indexing strategy
- Query optimization
- Capacity planning based on usage patterns
- Regular performance reviews

## 🔄 Continuous Improvement

### Monthly Reviews
- Performance metrics analysis
- Cost optimization opportunities
- Security audit and updates
- User feedback incorporation
- Dependency updates

### Quarterly Planning
- Capacity planning and scaling
- New feature deployment
- Technology stack evaluation
- Disaster recovery testing
- Team training and development

## 📞 Support and Escalation

### Incident Response
1. **Severity 1** (Site Down): Immediate response within 15 minutes
2. **Severity 2** (Degraded): Response within 1 hour
3. **Severity 3** (Minor Issues): Response within 4 hours

### Contact Information
- **Operations Team**: ops@wordweave.app
- **Development Team**: dev@wordweave.app
- **Security Issues**: security@wordweave.app
- **Emergency Pager**: +1-XXX-XXX-XXXX

## 📚 Additional Resources

### Documentation
- [AWS Serverless Best Practices](https://aws.amazon.com/serverless/)
- [React Production Deployment](https://reactjs.org/docs/optimizing-performance.html)
- [CloudFront Performance Tuning](https://docs.aws.amazon.com/cloudfront/)

### Tools and Services
- [AWS Well-Architected Tool](https://aws.amazon.com/well-architected-tool/)
- [Serverless Framework Documentation](https://www.serverless.com/framework/docs/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

---

## 🎯 Success Criteria

✅ **Deployment Complete When:**
- All health checks pass
- Website loads in < 3 seconds globally
- API responds in < 2 seconds average
- Monitoring dashboards operational
- Alerts configured and tested
- CI/CD pipeline functional
- Documentation updated
- Team trained on operations

**Congratulations! WordWeave is now running in production!** 🚀