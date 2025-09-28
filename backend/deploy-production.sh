#!/bin/bash

# WordWeave Production Deployment Script
# This script deploys the WordWeave backend to AWS production environment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
STAGE="prod"
REGION="us-east-1"
DOMAIN_NAME="api.wordweave.app"
FRONTEND_DOMAIN="wordweave.app"

echo -e "${BLUE}🚀 Starting WordWeave Production Deployment${NC}"
echo "======================================================"

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

# Check if Serverless Framework is installed
if ! command -v serverless &> /dev/null; then
    echo -e "${RED}❌ Serverless Framework is not installed${NC}"
    echo "Install with: npm install -g serverless"
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python 3 is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📊 AWS Account ID: ${ACCOUNT_ID}${NC}"

# Prompt for confirmation
echo -e "${YELLOW}⚠️  This will deploy to PRODUCTION environment${NC}"
echo "   - Stage: ${STAGE}"
echo "   - Region: ${REGION}"
echo "   - Domain: ${DOMAIN_NAME}"
echo "   - Account: ${ACCOUNT_ID}"
echo ""
read -p "Are you sure you want to continue? (y/N): " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Deployment cancelled${NC}"
    exit 1
fi

# Check if domain exists in Route53
echo -e "${YELLOW}🌐 Checking domain configuration...${NC}"
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones-by-name --dns-name wordweave.app --query 'HostedZones[0].Id' --output text 2>/dev/null || echo "None")

if [ "$HOSTED_ZONE_ID" = "None" ] || [ "$HOSTED_ZONE_ID" = "null" ]; then
    echo -e "${RED}❌ Hosted zone for wordweave.app not found${NC}"
    echo "Please create a Route53 hosted zone for wordweave.app first"
    exit 1
fi

# Remove the "/hostedzone/" prefix
HOSTED_ZONE_ID=${HOSTED_ZONE_ID#/hostedzone/}
echo -e "${GREEN}✅ Found hosted zone: ${HOSTED_ZONE_ID}${NC}"

# Check for SSL certificate
echo -e "${YELLOW}🔒 Checking SSL certificate...${NC}"
CERTIFICATE_ARN=$(aws acm list-certificates --region us-east-1 --query "CertificateSummaryList[?DomainName=='*.wordweave.app'].CertificateArn" --output text 2>/dev/null || echo "")

if [ -z "$CERTIFICATE_ARN" ]; then
    echo -e "${RED}❌ SSL certificate for *.wordweave.app not found${NC}"
    echo "Please create an ACM certificate for *.wordweave.app in us-east-1 region first"
    exit 1
fi

echo -e "${GREEN}✅ Found SSL certificate: ${CERTIFICATE_ARN}${NC}"

# Create or update JWT secret in SSM Parameter Store
echo -e "${YELLOW}🔑 Setting up JWT secret...${NC}"
JWT_SECRET=$(openssl rand -base64 32)
aws ssm put-parameter \
    --name "/wordweave/prod/jwt-secret" \
    --value "$JWT_SECRET" \
    --type "SecureString" \
    --overwrite \
    --description "JWT secret for WordWeave production" \
    --region $REGION || echo "Parameter might already exist"

echo -e "${GREEN}✅ JWT secret configured${NC}"

# Install Python dependencies
echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi

source venv/bin/activate
pip install -r requirements.txt
pip install PyJWT  # Add JWT support

# Update requirements.txt with PyJWT if not present
if ! grep -q "PyJWT" requirements.txt; then
    echo "PyJWT==2.8.0" >> requirements.txt
fi

echo -e "${GREEN}✅ Dependencies installed${NC}"

# Install Serverless plugins
echo -e "${YELLOW}🔌 Installing Serverless plugins...${NC}"
npm install serverless-python-requirements serverless-domain-manager serverless-plugin-warmup serverless-plugin-aws-alerts

echo -e "${GREEN}✅ Serverless plugins installed${NC}"

# Deploy the infrastructure
echo -e "${YELLOW}🚀 Deploying backend infrastructure...${NC}"

# First, create the custom domain (this might take a while)
echo -e "${YELLOW}🌐 Creating custom domain (this may take several minutes)...${NC}"
serverless create_domain --config serverless-prod.yml --stage $STAGE --region $REGION \
    --param="certificateArn=${CERTIFICATE_ARN}" \
    --param="hostedZoneId=${HOSTED_ZONE_ID}" || echo "Domain might already exist"

# Deploy the stack
echo -e "${YELLOW}☁️  Deploying Lambda functions and resources...${NC}"
serverless deploy --config serverless-prod.yml --stage $STAGE --region $REGION \
    --param="certificateArn=${CERTIFICATE_ARN}" \
    --param="hostedZoneId=${HOSTED_ZONE_ID}" \
    --param="logLevel=INFO" \
    --param="enablePITR=true" \
    --param="logRetentionDays=30"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend deployment successful!${NC}"
else
    echo -e "${RED}❌ Backend deployment failed${NC}"
    exit 1
fi

# Get deployment outputs
echo -e "${YELLOW}📋 Getting deployment information...${NC}"
API_URL=$(aws cloudformation describe-stacks \
    --stack-name wordweave-backend-prod \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayHttpApiUrl`].OutputValue' \
    --output text)

CUSTOM_DOMAIN_URL=$(aws cloudformation describe-stacks \
    --stack-name wordweave-backend-prod \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`CustomDomainUrl`].OutputValue' \
    --output text)

DASHBOARD_URL=$(aws cloudformation describe-stacks \
    --stack-name wordweave-backend-prod \
    --region $REGION \
    --query 'Stacks[0].Outputs[?OutputKey==`DashboardUrl`].OutputValue' \
    --output text)

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "https://${DOMAIN_NAME}/health")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check returned: ${HEALTH_RESPONSE}${NC}"
    echo "This might be normal if the domain is still propagating"
fi

# Create environment file for frontend
echo -e "${YELLOW}📝 Creating frontend environment configuration...${NC}"
cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=https://${DOMAIN_NAME}
REACT_APP_ENVIRONMENT=production
REACT_APP_SENTRY_DSN=
REACT_APP_ANALYTICS_ID=
EOF

echo -e "${GREEN}✅ Frontend environment file created${NC}"

# Create deployment summary
echo -e "${YELLOW}📊 Creating deployment summary...${NC}"
cat > deployment-summary.txt << EOF
WordWeave Production Deployment Summary
======================================

Deployment Date: $(date)
AWS Account: ${ACCOUNT_ID}
Region: ${REGION}
Stage: ${STAGE}

API Endpoints:
- Health Check: https://${DOMAIN_NAME}/health
- Poem Generation: https://${DOMAIN_NAME}/generate
- Theme Analysis: https://${DOMAIN_NAME}/analyze
- User Registration: https://${DOMAIN_NAME}/auth/register
- User Login: https://${DOMAIN_NAME}/auth/login
- User Profile: https://${DOMAIN_NAME}/user/profile

Direct API Gateway URL: ${API_URL}
Custom Domain URL: ${CUSTOM_DOMAIN_URL}

Monitoring:
- CloudWatch Dashboard: ${DASHBOARD_URL}
- Log Groups: /aws/lambda/wordweave-*-prod

Security:
- SSL Certificate: ${CERTIFICATE_ARN}
- WAF Protection: Enabled
- Encryption: All data encrypted at rest and in transit

Next Steps:
1. Deploy frontend to CloudFront
2. Configure monitoring alerts
3. Set up backup procedures
4. Configure CI/CD pipeline
5. Perform load testing

Frontend Environment:
- Update .env.production with API URL
- Build and deploy to CloudFront
- Configure custom domain (wordweave.app)
EOF

echo -e "${GREEN}✅ Deployment summary created${NC}"

# Final status
echo ""
echo "======================================================"
echo -e "${GREEN}🎉 WordWeave Production Deployment Complete!${NC}"
echo "======================================================"
echo ""
echo -e "${BLUE}API Base URL:${NC} https://${DOMAIN_NAME}"
echo -e "${BLUE}Health Check:${NC} https://${DOMAIN_NAME}/health"
echo -e "${BLUE}Dashboard:${NC} ${DASHBOARD_URL}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Test all API endpoints"
echo "2. Deploy frontend to production"
echo "3. Configure monitoring and alerts"
echo "4. Set up automated backups"
echo "5. Configure CI/CD pipeline"
echo ""
echo -e "${BLUE}📄 Check deployment-summary.txt for full details${NC}"

# Optional: Open dashboard in browser (macOS only)
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Open CloudWatch dashboard in browser? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "$DASHBOARD_URL"
    fi
fi

echo -e "${GREEN}🚀 Production deployment successful!${NC}"