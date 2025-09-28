#!/bin/bash

# WordWeave Serverless Deployment Script
# Usage: ./deploy-serverless.sh [stage] [region] [options]

set -e

# Configuration
STAGE=${1:-dev}
REGION=${2:-us-east-1}
SERVICE_NAME="wordweave-backend"

echo "🚀 Deploying WordWeave Serverless Stack"
echo "   Stage: $STAGE"
echo "   Region: $REGION"
echo "   Service: $SERVICE_NAME"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    print_error "Serverless Framework is not installed"
    print_info "Install it with: npm install -g serverless"
    exit 1
fi

# Check if AWS CLI is installed and configured
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI is not installed"
    print_info "Install it from: https://aws.amazon.com/cli/"
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity &> /dev/null; then
    print_error "AWS credentials not configured"
    print_info "Run: aws configure"
    exit 1
fi

# Check if Python 3.11 is available
if ! command -v python3.11 &> /dev/null; then
    print_warning "Python 3.11 not found, using default python3"
fi

print_status "Prerequisites check passed"

# Install Serverless plugins if not already installed
echo "📦 Installing Serverless plugins..."

# Create package.json if it doesn't exist
if [ ! -f "package.json" ]; then
    cat > package.json << EOF
{
  "name": "wordweave-backend",
  "version": "1.0.0",
  "description": "WordWeave Backend Serverless Functions",
  "main": "serverless.yml",
  "scripts": {
    "deploy": "serverless deploy",
    "remove": "serverless remove",
    "logs": "serverless logs",
    "invoke": "serverless invoke"
  },
  "devDependencies": {
    "serverless": "^3.38.0",
    "serverless-python-requirements": "^6.0.0",
    "serverless-prune-plugin": "^2.0.2",
    "serverless-plugin-optimize": "^4.2.1",
    "serverless-plugin-resource-tagging": "^1.2.0"
  }
}
EOF
fi

# Install dependencies
npm install

print_status "Serverless plugins installed"

# Validate serverless.yml
echo "✅ Validating serverless configuration..."
if ! serverless print --stage $STAGE --region $REGION > /dev/null; then
    print_error "Serverless configuration validation failed"
    exit 1
fi

print_status "Configuration validation passed"

# Check Bedrock model access
echo "🤖 Checking Bedrock model access..."
if aws bedrock list-foundation-models --region $REGION --query 'modelSummaries[?contains(modelId, `claude-3-5-sonnet`)]' --output text | grep -q claude; then
    print_status "Bedrock Claude 3.5 Sonnet access confirmed"
else
    print_warning "Bedrock Claude 3.5 Sonnet may not be available"
    print_info "Enable model access in AWS Console: Bedrock > Model Access"
fi

# Set deployment parameters based on stage
echo "⚙️  Setting deployment parameters..."

case $STAGE in
    "prod")
        LOG_LEVEL="WARN"
        LOG_RETENTION_DAYS=30
        DAILY_QUOTA=100000
        BURST_LIMIT=500
        RATE_LIMIT=200
        ENABLE_PITR=true
        ENABLE_SCHEDULE=true
        print_info "Production configuration loaded"
        ;;
    "staging")
        LOG_LEVEL="INFO"
        LOG_RETENTION_DAYS=14
        DAILY_QUOTA=50000
        BURST_LIMIT=200
        RATE_LIMIT=100
        ENABLE_PITR=true
        ENABLE_SCHEDULE=false
        print_info "Staging configuration loaded"
        ;;
    *)
        LOG_LEVEL="DEBUG"
        LOG_RETENTION_DAYS=7
        DAILY_QUOTA=10000
        BURST_LIMIT=100
        RATE_LIMIT=50
        ENABLE_PITR=false
        ENABLE_SCHEDULE=false
        print_info "Development configuration loaded"
        ;;
esac

# Deploy the stack
echo "🚀 Deploying WordWeave stack..."

# Create deployment command
DEPLOY_CMD="serverless deploy \
  --stage $STAGE \
  --region $REGION \
  --param logLevel=$LOG_LEVEL \
  --param logRetentionDays=$LOG_RETENTION_DAYS \
  --param dailyQuota=$DAILY_QUOTA \
  --param burstLimit=$BURST_LIMIT \
  --param rateLimit=$RATE_LIMIT \
  --param enablePITR=$ENABLE_PITR \
  --param enableSchedule=$ENABLE_SCHEDULE \
  --verbose"

print_info "Executing: $DEPLOY_CMD"

if eval $DEPLOY_CMD; then
    print_status "Deployment completed successfully!"
else
    print_error "Deployment failed!"
    exit 1
fi

# Get deployment outputs
echo "📋 Getting deployment information..."

API_URL=$(serverless info --stage $STAGE --region $REGION --verbose | grep -o 'https://[^[:space:]]*')
SERVICE_NAME_FULL="${SERVICE_NAME}-${STAGE}"

echo ""
echo "🎉 WordWeave Backend Deployed Successfully!"
echo ""
print_info "Deployment Summary:"
echo "  🌐 API URL: $API_URL"
echo "  📍 Region: $REGION"
echo "  🏷️  Stage: $STAGE"
echo "  📊 Service: $SERVICE_NAME_FULL"
echo ""

print_info "API Endpoints:"
echo "  POST $API_URL/generate     - Generate poems"
echo "  POST $API_URL/analyze      - Analyze themes" 
echo "  GET  $API_URL/health       - Health check"
echo ""

print_info "Monitoring:"
echo "  📊 CloudWatch Dashboard: WordWeave-$STAGE"
echo "  📝 Logs: /aws/lambda/wordweave-*-$STAGE"
echo ""

print_info "DynamoDB Tables:"
echo "  📚 Poems: wordweave-poems-$STAGE"
echo "  🎨 Themes: wordweave-themes-$STAGE"
echo ""

# Test the deployment
echo "🧪 Testing deployment..."

print_info "Testing health check endpoint..."
if curl -s -o /dev/null -w "%{http_code}" "$API_URL/health" | grep -q "200"; then
    print_status "Health check endpoint is responding"
else
    print_warning "Health check endpoint may not be ready yet"
fi

# Show useful commands
echo ""
print_info "Useful Commands:"
echo "  📝 View logs:"
echo "    serverless logs -f generatePoem --stage $STAGE --region $REGION --tail"
echo "    serverless logs -f analyzeTheme --stage $STAGE --region $REGION --tail"
echo ""
echo "  🔄 Redeploy single function:"
echo "    serverless deploy function -f generatePoem --stage $STAGE --region $REGION"
echo ""
echo "  🗑️  Remove stack:"
echo "    serverless remove --stage $STAGE --region $REGION"
echo ""
echo "  📊 View metrics:"
echo "    aws cloudwatch get-dashboard --dashboard-name WordWeave-$STAGE --region $REGION"
echo ""

# Cost estimation
echo "💰 Estimated Monthly Costs (1000 daily users):"
echo "   🔹 Lambda Functions: ~\$12/month"
echo "   🔹 API Gateway: ~\$3.50/month"
echo "   🔹 DynamoDB: ~\$5/month"
echo "   🔹 CloudWatch: ~\$2/month"
echo "   🔹 Bedrock (Claude): ~\$25/month"
echo "   🔹 Data Transfer: ~\$1/month"
echo "   📊 Total: ~\$48.50/month"
echo ""

print_status "Deployment script completed!"
echo ""
echo "🚀 Your WordWeave backend is ready to power amazing poetry experiences!"
echo "📖 Check the README for API documentation and frontend integration examples."
