#!/bin/bash

# WordWeave Configuration Validation Script
# Validates all configuration and prerequisites before deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-wordweave.app}"
REGION="${REGION:-us-east-1}"

echo -e "${BLUE}🔍 WordWeave Configuration Validation${NC}"
echo "================================================"
echo "Domain: ${DOMAIN_NAME}"
echo "Region: ${REGION}"
echo ""

# Validation counters
CHECKS_TOTAL=0
CHECKS_PASSED=0
CHECKS_FAILED=0
WARNINGS=0

# Function to run a validation check
validate() {
    local check_name="$1"
    local check_command="$2"
    local is_critical="${3:-true}"

    CHECKS_TOTAL=$((CHECKS_TOTAL + 1))
    echo -n "Validating ${check_name}... "

    if eval "$check_command" &> /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        CHECKS_PASSED=$((CHECKS_PASSED + 1))
        return 0
    else
        if [ "$is_critical" = "true" ]; then
            echo -e "${RED}❌ FAIL${NC}"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        else
            echo -e "${YELLOW}⚠️  WARN${NC}"
            WARNINGS=$((WARNINGS + 1))
        fi
        return 1
    fi
}

# Function to get configuration value
get_config_value() {
    local param_name="$1"
    local default_value="$2"

    # Try to get from environment variable first
    local env_var_name=$(echo "$param_name" | tr '[:lower:]' '[:upper:]' | tr '-' '_')
    local env_value=$(eval "echo \$${env_var_name}")

    if [ -n "$env_value" ]; then
        echo "$env_value"
        return 0
    fi

    # Try to get from AWS Parameter Store
    local param_value
    param_value=$(aws ssm get-parameter --name "/wordweave/prod/${param_name}" --query 'Parameter.Value' --output text 2>/dev/null || echo "")

    if [ -n "$param_value" ] && [ "$param_value" != "None" ]; then
        echo "$param_value"
        return 0
    fi

    # Return default value
    echo "$default_value"
}

echo -e "${YELLOW}🛠️  System Prerequisites${NC}"
echo "----------------------------------------"

# Check required tools
validate "AWS CLI installation" "command -v aws"
validate "Node.js installation" "command -v node"
validate "npm installation" "command -v npm"
validate "Python installation" "command -v python3"
validate "curl installation" "command -v curl"
validate "jq installation" "command -v jq"
validate "dig installation" "command -v dig"
validate "OpenSSL installation" "command -v openssl"

# Check optional tools
validate "Git installation" "command -v git" "false"
validate "Docker installation" "command -v docker" "false"

echo ""

echo -e "${YELLOW}☁️  AWS Configuration${NC}"
echo "----------------------------------------"

# Check AWS credentials and permissions
validate "AWS credentials configured" "aws sts get-caller-identity"

if aws sts get-caller-identity &> /dev/null; then
    ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
    echo -e "${BLUE}   AWS Account ID: ${ACCOUNT_ID}${NC}"

    # Check specific AWS permissions
    validate "Route53 permissions" "aws route53 list-hosted-zones --max-items 1"
    validate "ACM permissions" "aws acm list-certificates --region $REGION --max-items 1"
    validate "CloudFormation permissions" "aws cloudformation list-stacks --region $REGION --max-items 1"
    validate "Lambda permissions" "aws lambda list-functions --region $REGION --max-items 1"
    validate "DynamoDB permissions" "aws dynamodb list-tables --region $REGION --max-items 1"
    validate "S3 permissions" "aws s3 ls"
    validate "CloudFront permissions" "aws cloudfront list-distributions --max-items 1"
    validate "SSM permissions" "aws ssm describe-parameters --region $REGION --max-items 1"
fi

echo ""

echo -e "${YELLOW}🌐 Domain Configuration${NC}"
echo "----------------------------------------"

# Get domain configuration
HOSTED_ZONE_ID=$(get_config_value "hosted-zone-id" "")
CERTIFICATE_ARN=$(get_config_value "certificate-arn" "")

if [ -n "$HOSTED_ZONE_ID" ]; then
    echo -e "${BLUE}   Hosted Zone ID: ${HOSTED_ZONE_ID}${NC}"
    validate "Hosted zone exists" "aws route53 get-hosted-zone --id $HOSTED_ZONE_ID"
else
    echo -e "${RED}   ❌ Hosted Zone ID not found${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

if [ -n "$CERTIFICATE_ARN" ]; then
    echo -e "${BLUE}   Certificate ARN: ${CERTIFICATE_ARN}${NC}"
    validate "SSL certificate exists" "aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region $REGION"

    # Check certificate status
    if aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region $REGION &> /dev/null; then
        CERT_STATUS=$(aws acm describe-certificate --certificate-arn $CERTIFICATE_ARN --region $REGION --query 'Certificate.Status' --output text)
        if [ "$CERT_STATUS" = "ISSUED" ]; then
            echo -e "${GREEN}   ✅ Certificate status: ${CERT_STATUS}${NC}"
        else
            echo -e "${RED}   ❌ Certificate status: ${CERT_STATUS}${NC}"
            CHECKS_FAILED=$((CHECKS_FAILED + 1))
        fi
    fi
else
    echo -e "${RED}   ❌ SSL Certificate ARN not found${NC}"
    CHECKS_FAILED=$((CHECKS_FAILED + 1))
fi

# Test DNS resolution
validate "Domain DNS resolution" "dig +short $DOMAIN_NAME @8.8.8.8 | grep -q ."
validate "API subdomain DNS resolution" "dig +short api.$DOMAIN_NAME @8.8.8.8 | grep -q ." "false"

echo ""

echo -e "${YELLOW}📦 Project Configuration${NC}"
echo "----------------------------------------"

# Check project structure
validate "Backend directory exists" "[ -d './backend' ]"
validate "Frontend directory exists" "[ -d './frontend' ]"
validate "Backend serverless config" "[ -f './backend/serverless-prod.yml' ]"
validate "Frontend CloudFront config" "[ -f './frontend/cloudfront-config.yml' ]"
validate "Backend deployment script" "[ -x './backend/deploy-production.sh' ]"
validate "Frontend deployment script" "[ -x './frontend/deploy-production.sh' ]"

# Check backend configuration
if [ -d "./backend" ]; then
    cd backend
    validate "Backend package.json" "[ -f 'package.json' ]" "false"
    validate "Backend requirements.txt" "[ -f 'requirements.txt' ]"
    validate "Lambda function files" "[ -f 'lambda_function.py' ] && [ -f 'theme_analyzer.py' ] && [ -f 'user_management.py' ]"
    validate "Backend Python dependencies" "pip list | grep -q boto3" "false"
    cd ..
fi

# Check frontend configuration
if [ -d "./frontend" ]; then
    cd frontend
    validate "Frontend package.json" "[ -f 'package.json' ]"
    validate "Frontend source directory" "[ -d 'src' ]"
    validate "Frontend dependencies installed" "[ -d 'node_modules' ]" "false"

    # Check if we can build the frontend
    if [ -f "package.json" ] && [ -d "node_modules" ]; then
        validate "Frontend builds successfully" "npm run build" "false"
    fi
    cd ..
fi

echo ""

echo -e "${YELLOW}🔐 Security Configuration${NC}"
echo "----------------------------------------"

# Check for sensitive information
validate "No AWS keys in code" "! grep -r 'AKIA[0-9A-Z]\{16\}' . --exclude-dir=node_modules --exclude-dir=venv --exclude-dir=.git" "false"
validate "No hardcoded secrets" "! grep -ri 'password.*=' . --exclude-dir=node_modules --exclude-dir=venv --exclude-dir=.git | grep -v test" "false"

# Check JWT secret configuration
JWT_SECRET=$(aws ssm get-parameter --name "/wordweave/prod/jwt-secret" --with-decryption --query 'Parameter.Value' --output text 2>/dev/null || echo "")
if [ -n "$JWT_SECRET" ] && [ "$JWT_SECRET" != "None" ]; then
    echo -e "${GREEN}   ✅ JWT secret configured in Parameter Store${NC}"
else
    echo -e "${YELLOW}   ⚠️  JWT secret not found in Parameter Store${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""

echo -e "${YELLOW}💰 Cost Estimation${NC}"
echo "----------------------------------------"

# Calculate estimated monthly costs
echo "Estimated monthly costs for 1000 users/day:"
echo "   - Lambda Functions: \$15-25"
echo "   - API Gateway: \$3-8"
echo "   - DynamoDB: \$10-20"
echo "   - CloudFront: \$5-15"
echo "   - S3 Storage: \$1-3"
echo "   - Route53: \$1"
echo "   - ACM Certificate: \$0 (free)"
echo -e "${BLUE}   Total estimated: \$35-72/month${NC}"

# Check for cost optimization settings
validate "DynamoDB On-Demand billing" "grep -q 'PAY_PER_REQUEST' backend/serverless-prod.yml"
validate "Lambda memory optimization" "grep -q 'memorySize.*512' backend/serverless-prod.yml"

echo ""

echo -e "${YELLOW}🔍 Environment Validation${NC}"
echo "----------------------------------------"

# Check Node.js version
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${BLUE}   Node.js version: ${NODE_VERSION}${NC}"
    if [[ "$NODE_VERSION" =~ ^v1[8-9]\.|^v[2-9][0-9] ]]; then
        echo -e "${GREEN}   ✅ Node.js version is compatible${NC}"
    else
        echo -e "${RED}   ❌ Node.js version should be 18+ (current: ${NODE_VERSION})${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
fi

# Check Python version
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${BLUE}   Python version: ${PYTHON_VERSION}${NC}"
    if [[ "$PYTHON_VERSION" =~ Python\ 3\.(1[1-9]|[2-9][0-9]) ]]; then
        echo -e "${GREEN}   ✅ Python version is compatible${NC}"
    else
        echo -e "${RED}   ❌ Python version should be 3.11+ (current: ${PYTHON_VERSION})${NC}"
        CHECKS_FAILED=$((CHECKS_FAILED + 1))
    fi
fi

echo ""

# Check for existing deployments
echo -e "${YELLOW}🏗️  Existing Deployments${NC}"
echo "----------------------------------------"

# Check for existing CloudFormation stacks
if aws cloudformation describe-stacks --stack-name wordweave-backend-prod --region $REGION &> /dev/null; then
    echo -e "${BLUE}   Backend stack: Already deployed${NC}"
    validate "Backend stack status" "aws cloudformation describe-stacks --stack-name wordweave-backend-prod --region $REGION --query 'Stacks[0].StackStatus' --output text | grep -q 'COMPLETE'"
else
    echo -e "${YELLOW}   Backend stack: Not deployed${NC}"
fi

if aws cloudformation describe-stacks --stack-name wordweave-frontend-prod --region $REGION &> /dev/null; then
    echo -e "${BLUE}   Frontend stack: Already deployed${NC}"
    validate "Frontend stack status" "aws cloudformation describe-stacks --stack-name wordweave-frontend-prod --region $REGION --query 'Stacks[0].StackStatus' --output text | grep -q 'COMPLETE'"
else
    echo -e "${YELLOW}   Frontend stack: Not deployed${NC}"
fi

echo ""

# Generate validation report
echo "================================================"
echo -e "${BLUE}📊 Validation Summary${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Total Checks:${NC} ${CHECKS_TOTAL}"
echo -e "${GREEN}Passed:${NC} ${CHECKS_PASSED}"
echo -e "${RED}Failed:${NC} ${CHECKS_FAILED}"
echo -e "${YELLOW}Warnings:${NC} ${WARNINGS}"

if [ $CHECKS_FAILED -eq 0 ]; then
    echo -e "${GREEN}Readiness: ✅ READY FOR DEPLOYMENT${NC}"
    echo ""
    echo -e "${GREEN}🚀 All critical checks passed! You can proceed with deployment.${NC}"
    exit_code=0
else
    echo -e "${RED}Readiness: ❌ NOT READY FOR DEPLOYMENT${NC}"
    echo ""
    echo -e "${RED}❌ Critical issues found. Please resolve them before deployment.${NC}"
    exit_code=1
fi

# Create validation report
cat > validation-report.txt << EOF
WordWeave Configuration Validation Report
=========================================

Validation Date: $(date)
Domain: ${DOMAIN_NAME}
Region: ${REGION}
AWS Account: ${ACCOUNT_ID:-"Unknown"}

Validation Summary:
- Total Checks: ${CHECKS_TOTAL}
- Passed: ${CHECKS_PASSED}
- Failed: ${CHECKS_FAILED}
- Warnings: ${WARNINGS}

Status: $([ $exit_code -eq 0 ] && echo "✅ READY FOR DEPLOYMENT" || echo "❌ NOT READY FOR DEPLOYMENT")

Configuration:
- Hosted Zone ID: ${HOSTED_ZONE_ID:-"Not configured"}
- Certificate ARN: ${CERTIFICATE_ARN:-"Not configured"}
- JWT Secret: $([ -n "$JWT_SECRET" ] && echo "Configured" || echo "Not configured")

$([ $exit_code -eq 0 ] && echo "Next Steps:
1. Run domain setup: ./scripts/setup-domain.sh
2. Deploy backend: cd backend && ./deploy-production.sh
3. Deploy frontend: cd frontend && ./deploy-production.sh
4. Run tests: ./scripts/test-deployment.sh" || echo "Required Actions:
1. Resolve all failed checks above
2. Ensure AWS permissions are properly configured
3. Set up domain and SSL certificate
4. Re-run validation script")

Generated: $(date)
EOF

echo ""
echo -e "${BLUE}📄 Validation report saved to: validation-report.txt${NC}"

if [ $CHECKS_FAILED -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}💡 Common Solutions:${NC}"
    echo "• Missing domain config: Run ./scripts/setup-domain.sh"
    echo "• AWS permissions: Check IAM policies and roles"
    echo "• Missing dependencies: Run npm install in frontend/, pip install in backend/"
    echo "• Node.js version: Install Node.js 18+ from nodejs.org"
    echo "• Python version: Install Python 3.11+ from python.org"
fi

echo -e "${BLUE}🔍 Validation complete!${NC}"
exit $exit_code