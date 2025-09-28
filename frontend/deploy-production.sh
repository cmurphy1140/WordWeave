#!/bin/bash

# WordWeave Frontend Production Deployment Script
# This script builds and deploys the React frontend to CloudFront

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="wordweave.app"
ENVIRONMENT="prod"
REGION="us-east-1"
STACK_NAME="wordweave-frontend-prod"

echo -e "${BLUE}🎨 Starting WordWeave Frontend Production Deployment${NC}"
echo "=========================================================="

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

# Check if Node.js and npm are installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📊 AWS Account ID: ${ACCOUNT_ID}${NC}"

# Check if backend is deployed
echo -e "${YELLOW}🔗 Checking backend deployment...${NC}"
API_URL=""
if aws cloudformation describe-stacks --stack-name wordweave-backend-prod --region $REGION &> /dev/null; then
    API_URL=$(aws cloudformation describe-stacks \
        --stack-name wordweave-backend-prod \
        --region $REGION \
        --query 'Stacks[0].Outputs[?OutputKey==`CustomDomainUrl`].OutputValue' \
        --output text 2>/dev/null || echo "")

    if [ -n "$API_URL" ]; then
        echo -e "${GREEN}✅ Backend found at: ${API_URL}${NC}"
    else
        echo -e "${YELLOW}⚠️  Backend deployed but custom domain not found, using direct API Gateway URL${NC}"
        API_URL=$(aws cloudformation describe-stacks \
            --stack-name wordweave-backend-prod \
            --region $REGION \
            --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayHttpApiUrl`].OutputValue' \
            --output text)
    fi
else
    echo -e "${RED}❌ Backend not deployed to production${NC}"
    echo "Please deploy the backend first using: cd backend && ./deploy-production.sh"
    exit 1
fi

# Prompt for confirmation
echo -e "${YELLOW}⚠️  This will deploy frontend to PRODUCTION${NC}"
echo "   - Domain: ${DOMAIN_NAME}"
echo "   - Environment: ${ENVIRONMENT}"
echo "   - API URL: ${API_URL}"
echo "   - Account: ${ACCOUNT_ID}"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    exit 1
fi

# Check domain and certificate
echo -e "${YELLOW}🌐 Checking domain configuration...${NC}"

# Get hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query 'HostedZones[0].Id' --output text 2>/dev/null || echo "None")
if [ "$HOSTED_ZONE_ID" = "None" ] || [ "$HOSTED_ZONE_ID" = "null" ]; then
    echo -e "${RED}❌ Hosted zone for ${DOMAIN_NAME} not found${NC}"
    exit 1
fi
HOSTED_ZONE_ID=${HOSTED_ZONE_ID#/hostedzone/}

# Get certificate ARN
CERTIFICATE_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='*.${DOMAIN_NAME}'].CertificateArn" --output text 2>/dev/null || echo "")
if [ -z "$CERTIFICATE_ARN" ]; then
    echo -e "${RED}❌ SSL certificate for *.${DOMAIN_NAME} not found in us-east-1${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Domain configuration verified${NC}"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Create production environment file
echo -e "${YELLOW}🔧 Creating production environment configuration...${NC}"
cat > .env.production << EOF
# WordWeave Frontend Production Configuration
REACT_APP_API_URL=${API_URL}
REACT_APP_ENVIRONMENT=production
REACT_APP_DOMAIN=${DOMAIN_NAME}

# Feature flags
REACT_APP_ENABLE_ANALYTICS=true
REACT_APP_ENABLE_ERROR_TRACKING=true
REACT_APP_ENABLE_PERFORMANCE_MONITORING=true

# Cache settings
REACT_APP_CACHE_VERSION=1.0.0
REACT_APP_ENABLE_SERVICE_WORKER=true

# Monitoring (to be configured)
REACT_APP_SENTRY_DSN=
REACT_APP_ANALYTICS_ID=
EOF

echo -e "${GREEN}✅ Production environment configured${NC}"

# Run tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
if npm test -- --ci --coverage --watchAll=false; then
    echo -e "${GREEN}✅ All tests passed${NC}"
else
    echo -e "${RED}❌ Tests failed${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Build the application
echo -e "${YELLOW}🔨 Building production application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# Check build size
BUILD_SIZE=$(du -sh build | cut -f1)
echo -e "${BLUE}📊 Build size: ${BUILD_SIZE}${NC}"

# Deploy CloudFront infrastructure
echo -e "${YELLOW}☁️  Deploying CloudFront infrastructure...${NC}"

# Check if stack exists
if aws cloudformation describe-stacks --stack-name $STACK_NAME --region $REGION &> /dev/null; then
    echo "Updating existing CloudFormation stack..."
    aws cloudformation update-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudfront-config.yml \
        --parameters \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
            ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION

    # Wait for stack update to complete
    echo "Waiting for stack update to complete..."
    aws cloudformation wait stack-update-complete --stack-name $STACK_NAME --region $REGION
else
    echo "Creating new CloudFormation stack..."
    aws cloudformation create-stack \
        --stack-name $STACK_NAME \
        --template-body file://cloudfront-config.yml \
        --parameters \
            ParameterKey=DomainName,ParameterValue=$DOMAIN_NAME \
            ParameterKey=CertificateArn,ParameterValue=$CERTIFICATE_ARN \
            ParameterKey=HostedZoneId,ParameterValue=$HOSTED_ZONE_ID \
            ParameterKey=Environment,ParameterValue=$ENVIRONMENT \
        --capabilities CAPABILITY_IAM \
        --region $REGION

    # Wait for stack creation to complete
    echo "Waiting for stack creation to complete (this may take 10-15 minutes)..."
    aws cloudformation wait stack-create-complete --stack-name $STACK_NAME --region $REGION
fi

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ CloudFormation stack deployed successfully${NC}"
else
    echo -e "${RED}❌ CloudFormation stack deployment failed${NC}"
    exit 1
fi

# Get S3 bucket name and CloudFront distribution ID
echo -e "${YELLOW}📋 Getting deployment information...${NC}"
S3_BUCKET=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`S3BucketName`].OutputValue' \
    --output text)

DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

CLOUDFRONT_DOMAIN=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDomainName`].OutputValue' \
    --output text)

DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name $STACK_NAME \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardURL`].OutputValue' \
    --output text)

echo -e "${BLUE}S3 Bucket: ${S3_BUCKET}${NC}"
echo -e "${BLUE}Distribution ID: ${DISTRIBUTION_ID}${NC}"

# Upload files to S3
echo -e "${YELLOW}📤 Uploading files to S3...${NC}"

# Sync build directory to S3 with optimized cache headers
aws s3 sync build/ s3://$S3_BUCKET/ \
    --region $REGION \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "*.html" \
    --exclude "*.json" \
    --exclude "service-worker.js" \
    --exclude "sw.js"

# Upload HTML files with no cache
aws s3 sync build/ s3://$S3_BUCKET/ \
    --region $REGION \
    --cache-control "public, max-age=0, must-revalidate" \
    --include "*.html" \
    --include "*.json" \
    --include "service-worker.js" \
    --include "sw.js"

echo -e "${GREEN}✅ Files uploaded to S3${NC}"

# Create CloudFront invalidation
echo -e "${YELLOW}🔄 Creating CloudFront invalidation...${NC}"
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo -e "${BLUE}Invalidation ID: ${INVALIDATION_ID}${NC}"

# Wait for invalidation to complete
echo "Waiting for CloudFront invalidation to complete..."
aws cloudfront wait invalidation-completed \
    --distribution-id $DISTRIBUTION_ID \
    --id $INVALIDATION_ID

echo -e "${GREEN}✅ CloudFront invalidation completed${NC}"

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Test CloudFront URL
echo "Testing CloudFront URL..."
CLOUDFRONT_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://${CLOUDFRONT_DOMAIN}")

if [ "$CLOUDFRONT_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ CloudFront URL test passed${NC}"
else
    echo -e "${YELLOW}⚠️  CloudFront URL returned: ${CLOUDFRONT_RESPONSE}${NC}"
fi

# Test custom domain (might take time to propagate)
echo "Testing custom domain..."
DOMAIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN_NAME}")

if [ "$DOMAIN_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Custom domain test passed${NC}"
else
    echo -e "${YELLOW}⚠️  Custom domain returned: ${DOMAIN_RESPONSE} (may still be propagating)${NC}"
fi

# Generate deployment summary
echo -e "${YELLOW}📊 Creating deployment summary...${NC}"
cat > deployment-summary-frontend.txt << EOF
WordWeave Frontend Production Deployment Summary
================================================

Deployment Date: $(date)
Environment: ${ENVIRONMENT}
Domain: ${DOMAIN_NAME}
AWS Account: ${ACCOUNT_ID}

URLs:
- Production Website: https://${DOMAIN_NAME}
- WWW Website: https://www.${DOMAIN_NAME}
- CloudFront URL: https://${CLOUDFRONT_DOMAIN}

Infrastructure:
- S3 Bucket: ${S3_BUCKET}
- CloudFront Distribution: ${DISTRIBUTION_ID}
- Certificate: ${CERTIFICATE_ARN}
- Hosted Zone: ${HOSTED_ZONE_ID}

API Configuration:
- Backend API: ${API_URL}

Build Information:
- Build Size: ${BUILD_SIZE}
- Build Date: $(date)
- Node Version: $(node --version)
- npm Version: $(npm --version)

Monitoring:
- CloudWatch Dashboard: ${DASHBOARD_URL}
- WAF Protection: Enabled
- SSL/TLS: Enabled (TLS 1.2+)

Cache Configuration:
- Static Assets: 1 year cache
- HTML/JSON: No cache
- Service Worker: No cache

Security Features:
- WAF Protection: Enabled
- HTTPS Only: Enabled
- Security Headers: Enabled
- CORS: Configured

Performance Features:
- HTTP/2 & HTTP/3: Enabled
- Compression: Enabled
- Global CDN: Enabled

Next Steps:
1. Monitor CloudWatch dashboards
2. Set up alerts and notifications
3. Configure analytics tracking
4. Set up error monitoring
5. Schedule regular security reviews
6. Plan content delivery optimization
EOF

echo -e "${GREEN}✅ Deployment summary created${NC}"

# Final status
echo ""
echo "=========================================================="
echo -e "${GREEN}🎉 WordWeave Frontend Production Deployment Complete!${NC}"
echo "=========================================================="
echo ""
echo -e "${BLUE}Website URL:${NC} https://${DOMAIN_NAME}"
echo -e "${BLUE}CloudFront URL:${NC} https://${CLOUDFRONT_DOMAIN}"
echo -e "${BLUE}API Backend:${NC} ${API_URL}"
echo -e "${BLUE}Dashboard:${NC} ${DASHBOARD_URL}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Test all website functionality"
echo "2. Configure monitoring and alerts"
echo "3. Set up analytics tracking"
echo "4. Configure error monitoring (Sentry)"
echo "5. Schedule regular security audits"
echo "6. Plan CI/CD automation"
echo ""
echo -e "${BLUE}📄 Check deployment-summary-frontend.txt for full details${NC}"

# Optional: Open website in browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Open website in browser? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://${DOMAIN_NAME}"
    fi
fi

echo -e "${GREEN}🚀 Frontend deployment successful!${NC}"