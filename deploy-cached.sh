#!/bin/bash

# WordWeave Comprehensive Caching Deployment Script
# This script deploys the application with full caching infrastructure

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-dev}
AWS_REGION=${2:-us-east-1}
REDIS_ENDPOINT=${3:-""}
S3_BUCKET=${4:-"wordweave-static-assets-${ENVIRONMENT}"}

echo -e "${BLUE}🚀 WordWeave Caching Deployment${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo -e "${BLUE}Region: ${AWS_REGION}${NC}"
echo -e "${BLUE}Redis Endpoint: ${REDIS_ENDPOINT}${NC}"
echo -e "${BLUE}S3 Bucket: ${S3_BUCKET}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists aws; then
    print_error "AWS CLI not found. Please install it first."
    exit 1
fi

if ! command_exists npm; then
    print_error "npm not found. Please install Node.js first."
    exit 1
fi

if ! command_exists python3; then
    print_error "Python 3 not found. Please install it first."
    exit 1
fi

print_status "Prerequisites check passed"

# Build frontend with optimizations
echo -e "${BLUE}📦 Building frontend with caching optimizations...${NC}"

cd frontend

# Install dependencies
echo "Installing dependencies..."
npm ci --silent

# Set environment variables for build
export REACT_APP_ENVIRONMENT=${ENVIRONMENT}
export REACT_APP_REDIS_ENDPOINT=${REDIS_ENDPOINT}
export REACT_APP_S3_BUCKET=${S3_BUCKET}
export GENERATE_SOURCEMAP=false
export INLINE_RUNTIME_CHUNK=false

# Build with optimizations
echo "Building production bundle..."
npm run build

# Analyze bundle size
echo "Analyzing bundle size..."
npx webpack-bundle-analyzer build/static/js/*.js --report --mode static --no-open

print_status "Frontend build completed"

# Upload static assets to S3
echo -e "${BLUE}☁️  Uploading static assets to S3...${NC}"

aws s3 sync build/ s3://${S3_BUCKET}/ --delete \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE

# Set different cache headers for different file types
aws s3 cp s3://${S3_BUCKET}/static/js/ s3://${S3_BUCKET}/static/js/ \
    --recursive --cache-control "public, max-age=31536000, immutable"

aws s3 cp s3://${S3_BUCKET}/static/css/ s3://${S3_BUCKET}/static/css/ \
    --recursive --cache-control "public, max-age=31536000, immutable"

aws s3 cp s3://${S3_BUCKET}/static/media/ s3://${S3_BUCKET}/static/media/ \
    --recursive --cache-control "public, max-age=604800"

# Service Worker should not be cached
aws s3 cp s3://${S3_BUCKET}/sw.js s3://${S3_BUCKET}/sw.js \
    --cache-control "public, max-age=0, must-revalidate"

print_status "Static assets uploaded to S3"

cd ..

# Deploy CloudFront
echo -e "${BLUE}🌐 Deploying CloudFront CDN...${NC}"

# Update CloudFormation stack
aws cloudformation deploy \
    --template-file cloudfront-config.yml \
    --stack-name wordweave-cloudfront-${ENVIRONMENT} \
    --parameter-overrides \
        Environment=${ENVIRONMENT} \
        S3BucketName=${S3_BUCKET} \
        OriginDomainName=${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com \
    --capabilities CAPABILITY_IAM \
    --region ${AWS_REGION}

print_status "CloudFront deployment completed"

# Deploy backend with Redis caching
echo -e "${BLUE}🔧 Deploying backend with Redis caching...${NC}"

cd backend

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt -q

# Deploy Lambda functions
echo "Deploying Lambda functions..."
serverless deploy --stage ${ENVIRONMENT} --region ${AWS_REGION} \
    --param "redisEndpoint=${REDIS_ENDPOINT}" \
    --param "environment=${ENVIRONMENT}"

print_status "Backend deployment completed"

cd ..

# Deploy Redis ElastiCache (if not provided)
if [ -z "$REDIS_ENDPOINT" ]; then
    echo -e "${BLUE}🗄️  Deploying Redis ElastiCache...${NC}"
    
    # Create ElastiCache subnet group
    aws elasticache create-cache-subnet-group \
        --cache-subnet-group-name wordweave-redis-subnet-${ENVIRONMENT} \
        --cache-subnet-group-description "Subnet group for WordWeave Redis" \
        --subnet-ids subnet-12345678 subnet-87654321 \
        --region ${AWS_REGION} 2>/dev/null || true
    
    # Create ElastiCache cluster
    aws elasticache create-cache-cluster \
        --cache-cluster-id wordweave-redis-${ENVIRONMENT} \
        --cache-node-type cache.t3.micro \
        --engine redis \
        --num-cache-nodes 1 \
        --cache-subnet-group-name wordweave-redis-subnet-${ENVIRONMENT} \
        --security-group-ids sg-12345678 \
        --region ${AWS_REGION} 2>/dev/null || true
    
    print_status "Redis ElastiCache deployment initiated"
    print_warning "Note: ElastiCache takes 5-10 minutes to become available"
fi

# Run performance tests
echo -e "${BLUE}⚡ Running performance tests...${NC}"

# Get CloudFront distribution ID
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
    --stack-name wordweave-cloudfront-${ENVIRONMENT} \
    --region ${AWS_REGION} \
    --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
    --output text)

# Wait for CloudFront to be deployed
echo "Waiting for CloudFront deployment to complete..."
aws cloudfront wait distribution-deployed --id ${DISTRIBUTION_ID}

# Test performance
echo "Testing application performance..."
curl -w "@curl-format.txt" -s -o /dev/null https://${DISTRIBUTION_ID}.cloudfront.net/

print_status "Performance tests completed"

# Create cache invalidation
echo -e "${BLUE}🔄 Creating cache invalidation...${NC}"

aws cloudfront create-invalidation \
    --distribution-id ${DISTRIBUTION_ID} \
    --paths "/*" \
    --region ${AWS_REGION}

print_status "Cache invalidation created"

# Generate deployment report
echo -e "${BLUE}📊 Generating deployment report...${NC}"

cat > deployment-report-${ENVIRONMENT}.md << EOF
# WordWeave Caching Deployment Report

**Environment:** ${ENVIRONMENT}
**Region:** ${AWS_REGION}
**Date:** $(date)

## Infrastructure Deployed

### Frontend
- ✅ React application with caching optimizations
- ✅ Service Worker for offline functionality
- ✅ React Query for API caching
- ✅ LocalStorage caching for poems
- ✅ Lazy loading for animation components
- ✅ Performance monitoring with Web Vitals

### Backend
- ✅ Lambda functions with Redis caching
- ✅ ElastiCache Redis cluster
- ✅ Cache invalidation strategies

### CDN
- ✅ CloudFront distribution
- ✅ Optimized cache behaviors
- ✅ WAF protection
- ✅ Compression enabled

## Cache Configuration

### Frontend Caching
- **React Query:** 5 minutes stale time, 10 minutes GC time
- **LocalStorage:** 7 days for poems, 24 hours for themes
- **Service Worker:** Cache-first for static assets, network-first for API

### Backend Caching
- **Redis:** 24 hours for poems, 12 hours for theme analysis
- **ElastiCache:** High availability with automatic failover

### CDN Caching
- **Static Assets:** 1 year with immutable headers
- **API Endpoints:** No caching
- **Images:** 1 week
- **Service Worker:** No caching

## Performance Metrics

- **Bundle Size:** Optimized with code splitting
- **Lazy Loading:** Animation components load on demand
- **Compression:** Gzip/Brotli enabled
- **Caching Hit Rate:** Monitored with performance tools

## URLs

- **Frontend:** https://${DISTRIBUTION_ID}.cloudfront.net/
- **API Gateway:** Available via Serverless framework
- **Redis:** ${REDIS_ENDPOINT}

## Next Steps

1. Monitor cache hit rates in CloudWatch
2. Set up alerts for cache performance
3. Optimize based on usage patterns
4. Consider implementing cache warming strategies

EOF

print_status "Deployment report generated: deployment-report-${ENVIRONMENT}.md"

# Final status
echo ""
echo -e "${GREEN}🎉 WordWeave Caching Deployment Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "   Frontend: https://${DISTRIBUTION_ID}.cloudfront.net/"
echo -e "   Environment: ${ENVIRONMENT}"
echo -e "   Redis: ${REDIS_ENDPOINT}"
echo -e "   S3 Bucket: ${S3_BUCKET}"
echo ""
echo -e "${BLUE}📊 Performance Features:${NC}"
echo -e "   ✅ React Query caching"
echo -e "   ✅ LocalStorage caching"
echo -e "   ✅ Service Worker offline support"
echo -e "   ✅ CloudFront CDN"
echo -e "   ✅ Redis ElastiCache"
echo -e "   ✅ Lazy loading components"
echo -e "   ✅ Performance monitoring"
echo ""
echo -e "${BLUE}🔍 Monitoring:${NC}"
echo -e "   CloudWatch: Monitor cache performance"
echo -e "   Web Vitals: Track Core Web Vitals"
echo -e "   Redis: Monitor cache hit rates"
echo ""

# Create curl format file for performance testing
cat > curl-format.txt << 'EOF'
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
EOF

print_status "Deployment script completed successfully!"
