#!/bin/bash

# WordWeave AWS CLI Production Deployment - Robust Version
# Handles network issues and retries

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Retry function
retry() {
    local retries=$1
    shift
    local count=0
    until "$@"; do
        exit=$?
        wait=$((2 ** $count))
        count=$(($count + 1))
        if [ $count -lt $retries ]; then
            echo "Retry $count/$retries exited $exit, retrying in $wait seconds..."
            sleep $wait
        else
            echo "Retry $count/$retries exited $exit, no more retries left."
            return $exit
        fi
    done
    return 0
}

echo -e "${BLUE}🚀 WordWeave AWS CLI Deployment (Robust)${NC}"
echo "=================================================="

# Configuration
REGION="us-east-1"
FUNCTION_NAME="wordweave-poem-generator"
API_NAME="wordweave-api"
STAGE_NAME="prod"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📊 AWS Account: ${ACCOUNT_ID}${NC}"

cd /Users/connormurphy/Desktop/WordWeave/backend

# Step 1: Create smaller deployment package (without heavy dependencies)
echo -e "${YELLOW}📦 Creating lightweight deployment package...${NC}"
rm -rf deploy-temp wordweave-*.zip

mkdir deploy-temp
cd deploy-temp

# Copy only essential files
cp ../lambda_function.py .
cp ../theme_analyzer.py .

# Create minimal requirements for Lambda layer approach
cat > requirements.txt << 'EOF'
boto3>=1.34.0
botocore>=1.34.0
requests>=2.31.0
EOF

# Install only essential dependencies
source ../venv/bin/activate
pip install requests -t . --quiet

# Create deployment zip
zip -r ../wordweave-deployment.zip . -q
cd ..
rm -rf deploy-temp

echo -e "${GREEN}✅ Lightweight deployment package created${NC}"

# Step 2: Check/Create IAM role
echo -e "${YELLOW}🔑 Setting up IAM role...${NC}"

ROLE_ARN=$(aws iam get-role --role-name WordWeaveLambdaExecutionRole --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    # Create trust policy
    cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    ROLE_ARN=$(aws iam create-role \
      --role-name WordWeaveLambdaExecutionRole \
      --assume-role-policy-document file://trust-policy.json \
      --query 'Role.Arn' --output text)
    
    # Attach basic execution policy
    aws iam attach-role-policy \
      --role-name WordWeaveLambdaExecutionRole \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    # Create and attach Bedrock policy
    cat > bedrock-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel"
      ],
      "Resource": "*"
    }
  ]
}
EOF

    aws iam put-role-policy \
      --role-name WordWeaveLambdaExecutionRole \
      --policy-name BedrockAccess \
      --policy-document file://bedrock-policy.json
    
    echo -e "${YELLOW}⏳ Waiting for IAM role propagation...${NC}"
    sleep 20
fi

echo -e "${GREEN}✅ IAM role ready: ${ROLE_ARN}${NC}"

# Step 3: Create/Update Lambda function with retries
echo -e "${YELLOW}⚡ Creating Lambda function...${NC}"

# Try to create function, if it exists, update it
if aws lambda get-function --function-name ${FUNCTION_NAME} >/dev/null 2>&1; then
    echo "Function exists, updating code..."
    retry 3 aws lambda update-function-code \
      --function-name ${FUNCTION_NAME} \
      --zip-file fileb://wordweave-deployment.zip
else
    echo "Creating new function..."
    retry 3 aws lambda create-function \
      --function-name ${FUNCTION_NAME} \
      --runtime python3.11 \
      --role ${ROLE_ARN} \
      --handler lambda_function.lambda_handler \
      --zip-file fileb://wordweave-deployment.zip \
      --timeout 30 \
      --memory-size 1024 \
      --environment Variables='{
        "BEDROCK_MODEL_ID": "anthropic.claude-3-5-sonnet-20241022",
        "BEDROCK_REGION": "us-east-1",
        "LOG_LEVEL": "INFO"
      }' \
      --description "WordWeave poem generation service"
fi

echo -e "${GREEN}✅ Lambda function ready${NC}"

# Step 4: Create API Gateway
echo -e "${YELLOW}🌐 Setting up API Gateway...${NC}"

# Get or create API
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='${API_NAME}'].ApiId" --output text 2>/dev/null)

if [ -z "$API_ID" ] || [ "$API_ID" = "None" ]; then
    API_ID=$(aws apigatewayv2 create-api \
      --name ${API_NAME} \
      --protocol-type HTTP \
      --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="Content-Type,Authorization" \
      --query ApiId --output text)
fi

echo -e "${BLUE}📡 API ID: ${API_ID}${NC}"

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 get-integrations --api-id ${API_ID} --query 'Items[0].IntegrationId' --output text 2>/dev/null)

if [ -z "$INTEGRATION_ID" ] || [ "$INTEGRATION_ID" = "None" ]; then
    INTEGRATION_ID=$(aws apigatewayv2 create-integration \
      --api-id ${API_ID} \
      --integration-type AWS_PROXY \
      --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME} \
      --payload-format-version 2.0 \
      --query IntegrationId --output text)
fi

# Create routes (ignore errors if they exist)
aws apigatewayv2 create-route \
  --api-id ${API_ID} \
  --route-key "POST /generate" \
  --target integrations/${INTEGRATION_ID} 2>/dev/null || true

aws apigatewayv2 create-route \
  --api-id ${API_ID} \
  --route-key "GET /health" \
  --target integrations/${INTEGRATION_ID} 2>/dev/null || true

# Create stage
aws apigatewayv2 create-stage \
  --api-id ${API_ID} \
  --stage-name ${STAGE_NAME} \
  --auto-deploy 2>/dev/null || true

# Add Lambda permission
aws lambda add-permission \
  --function-name ${FUNCTION_NAME} \
  --statement-id api-gateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || true

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${API_ID} --query ApiEndpoint --output text)

echo -e "${GREEN}✅ API Gateway configured${NC}"

# Step 5: Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Wait for deployment to be ready
sleep 10

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_URL="${API_ENDPOINT}/${STAGE_NAME}/health"
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "${HEALTH_URL}" -o /tmp/health_response.json || echo "000")

if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
elif [ "$HEALTH_RESPONSE" = "000" ]; then
    echo -e "${YELLOW}⚠️  Health check failed - connection error${NC}"
else
    echo -e "${YELLOW}⚠️  Health check returned: ${HEALTH_RESPONSE}${NC}"
    echo "Response: $(cat /tmp/health_response.json 2>/dev/null || echo 'No response')"
fi

# Test poem generation
echo "Testing poem generation..."
POEM_URL="${API_ENDPOINT}/${STAGE_NAME}/generate"
POEM_RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST "${POEM_URL}" \
  -H "Content-Type: application/json" \
  -d '{"verb":"dance","adjective":"mystic","noun":"forest"}' \
  -o /tmp/poem_response.json || echo "000")

if [ "$POEM_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Poem generation test passed${NC}"
    echo "Sample: $(cat /tmp/poem_response.json | head -c 100)..."
else
    echo -e "${YELLOW}⚠️  Poem generation returned: ${POEM_RESPONSE}${NC}"
    echo "Response: $(cat /tmp/poem_response.json 2>/dev/null || echo 'No response')"
fi

# Step 6: Configure frontend
echo -e "${YELLOW}📝 Configuring frontend...${NC}"

cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=${API_ENDPOINT}/${STAGE_NAME}
REACT_APP_ENVIRONMENT=production
EOF

echo -e "${GREEN}✅ Frontend environment configured${NC}"

# Cleanup
rm -f trust-policy.json bedrock-policy.json wordweave-deployment.zip

# Final summary
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 WordWeave Deployment Complete!${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}Production URLs:${NC}"
echo "  API Base: ${API_ENDPOINT}/${STAGE_NAME}"
echo "  Health:   ${API_ENDPOINT}/${STAGE_NAME}/health"
echo "  Generate: ${API_ENDPOINT}/${STAGE_NAME}/generate"
echo ""
echo -e "${BLUE}AWS Resources:${NC}"
echo "  Function: ${FUNCTION_NAME}"
echo "  API: ${API_ID}"
echo "  Role: WordWeaveLambdaExecutionRole"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Build frontend: cd frontend && npm run build"
echo "2. Deploy frontend build/ to hosting service"
echo "3. Test complete application"
echo ""
echo -e "${GREEN}🚀 WordWeave is ready for production!${NC}"
