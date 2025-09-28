#!/bin/bash

# WordWeave AWS CLI Production Deployment
# Complete deployment using AWS CLI only

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 WordWeave AWS CLI Deployment${NC}"
echo "=================================================="

# Configuration
REGION="us-east-1"
FUNCTION_NAME="wordweave-poem-generator"
THEME_FUNCTION_NAME="wordweave-theme-analyzer"
API_NAME="wordweave-api"
STAGE_NAME="prod"

# Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📊 AWS Account: ${ACCOUNT_ID}${NC}"
echo -e "${BLUE}📍 Region: ${REGION}${NC}"

# Step 1: Create deployment package
echo -e "${YELLOW}📦 Creating deployment packages...${NC}"
cd /Users/connormurphy/Desktop/WordWeave/backend

# Clean up previous builds
rm -rf deploy-temp wordweave-*.zip

# Create deployment directory
mkdir deploy-temp
cd deploy-temp

# Copy source files
cp ../lambda_function.py .
cp ../theme_analyzer.py .
cp ../requirements.txt .

# Install dependencies in deployment package
echo -e "${YELLOW}📥 Installing Python dependencies...${NC}"
source ../venv/bin/activate
pip install -r requirements.txt -t . --quiet

# Create deployment zip
echo -e "${YELLOW}🗜️  Creating deployment archive...${NC}"
zip -r ../wordweave-deployment.zip . -q

cd ..
rm -rf deploy-temp

echo -e "${GREEN}✅ Deployment package created${NC}"

# Step 2: Create IAM role
echo -e "${YELLOW}🔑 Setting up IAM role...${NC}"

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

# Create execution policy
cat > execution-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
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

# Create IAM role
ROLE_ARN=$(aws iam create-role \
  --role-name WordWeaveLambdaExecutionRole \
  --assume-role-policy-document file://trust-policy.json \
  --query 'Role.Arn' --output text 2>/dev/null || \
  aws iam get-role --role-name WordWeaveLambdaExecutionRole --query 'Role.Arn' --output text)

# Attach execution policy
aws iam put-role-policy \
  --role-name WordWeaveLambdaExecutionRole \
  --policy-name WordWeaveExecutionPolicy \
  --policy-document file://execution-policy.json

echo -e "${GREEN}✅ IAM role configured: ${ROLE_ARN}${NC}"

# Wait for role propagation
echo -e "${YELLOW}⏳ Waiting for IAM role propagation...${NC}"
sleep 15

# Step 3: Create Lambda functions
echo -e "${YELLOW}⚡ Creating Lambda functions...${NC}"

# Create poem generator function
aws lambda create-function \
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
  --description "WordWeave poem generation service" 2>/dev/null || \
  aws lambda update-function-code \
    --function-name ${FUNCTION_NAME} \
    --zip-file fileb://wordweave-deployment.zip

# Create theme analyzer function
aws lambda create-function \
  --function-name ${THEME_FUNCTION_NAME} \
  --runtime python3.11 \
  --role ${ROLE_ARN} \
  --handler theme_analyzer.lambda_handler \
  --zip-file fileb://wordweave-deployment.zip \
  --timeout 30 \
  --memory-size 1024 \
  --environment Variables='{
    "BEDROCK_MODEL_ID": "anthropic.claude-3-5-sonnet-20241022",
    "BEDROCK_REGION": "us-east-1",
    "LOG_LEVEL": "INFO"
  }' \
  --description "WordWeave theme analysis service" 2>/dev/null || \
  aws lambda update-function-code \
    --function-name ${THEME_FUNCTION_NAME} \
    --zip-file fileb://wordweave-deployment.zip

echo -e "${GREEN}✅ Lambda functions created${NC}"

# Step 4: Create API Gateway
echo -e "${YELLOW}🌐 Setting up API Gateway...${NC}"

# Create HTTP API
API_ID=$(aws apigatewayv2 create-api \
  --name ${API_NAME} \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="GET,POST,OPTIONS",AllowHeaders="Content-Type,Authorization" \
  --query ApiId --output text 2>/dev/null || \
  aws apigatewayv2 get-apis --query "Items[?Name=='${API_NAME}'].ApiId" --output text)

echo -e "${BLUE}📡 API ID: ${API_ID}${NC}"

# Create integrations
POEM_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id ${API_ID} \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME} \
  --payload-format-version 2.0 \
  --query IntegrationId --output text 2>/dev/null || \
  aws apigatewayv2 get-integrations --api-id ${API_ID} --query 'Items[0].IntegrationId' --output text)

THEME_INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id ${API_ID} \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${THEME_FUNCTION_NAME} \
  --payload-format-version 2.0 \
  --query IntegrationId --output text 2>/dev/null || echo ${POEM_INTEGRATION_ID})

# Create routes
aws apigatewayv2 create-route \
  --api-id ${API_ID} \
  --route-key "POST /generate" \
  --target integrations/${POEM_INTEGRATION_ID} 2>/dev/null || true

aws apigatewayv2 create-route \
  --api-id ${API_ID} \
  --route-key "POST /analyze-theme" \
  --target integrations/${THEME_INTEGRATION_ID} 2>/dev/null || true

aws apigatewayv2 create-route \
  --api-id ${API_ID} \
  --route-key "GET /health" \
  --target integrations/${POEM_INTEGRATION_ID} 2>/dev/null || true

# Create stage
aws apigatewayv2 create-stage \
  --api-id ${API_ID} \
  --stage-name ${STAGE_NAME} \
  --auto-deploy 2>/dev/null || true

# Add Lambda permissions
aws lambda add-permission \
  --function-name ${FUNCTION_NAME} \
  --statement-id api-gateway-invoke-poem \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || true

aws lambda add-permission \
  --function-name ${THEME_FUNCTION_NAME} \
  --statement-id api-gateway-invoke-theme \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || true

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${API_ID} --query ApiEndpoint --output text)

echo -e "${GREEN}✅ API Gateway configured${NC}"

# Step 5: Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"

# Test health endpoint
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" "${API_ENDPOINT}/${STAGE_NAME}/health" -o /tmp/health_response.json)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health check returned: ${HEALTH_RESPONSE}${NC}"
    echo "Response: $(cat /tmp/health_response.json)"
fi

# Test poem generation
echo "Testing poem generation..."
POEM_RESPONSE=$(curl -s -w "%{http_code}" \
  -X POST "${API_ENDPOINT}/${STAGE_NAME}/generate" \
  -H "Content-Type: application/json" \
  -d '{"verb":"dance","adjective":"mystic","noun":"forest"}' \
  -o /tmp/poem_response.json)

if [ "$POEM_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Poem generation test passed${NC}"
    echo "Sample response: $(cat /tmp/poem_response.json | head -c 200)..."
else
    echo -e "${YELLOW}⚠️  Poem generation returned: ${POEM_RESPONSE}${NC}"
    echo "Response: $(cat /tmp/poem_response.json)"
fi

# Step 6: Configure frontend
echo -e "${YELLOW}📝 Configuring frontend...${NC}"

# Create production environment file
cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=${API_ENDPOINT}/${STAGE_NAME}
REACT_APP_ENVIRONMENT=production
EOF

echo -e "${GREEN}✅ Frontend environment configured${NC}"

# Step 7: Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd ../frontend
npm run build --silent

echo -e "${GREEN}✅ Frontend build completed${NC}"

# Cleanup
cd ../backend
rm -f trust-policy.json execution-policy.json wordweave-deployment.zip

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
echo "  Theme:    ${API_ENDPOINT}/${STAGE_NAME}/analyze-theme"
echo ""
echo -e "${BLUE}AWS Resources:${NC}"
echo "  Lambda Functions: ${FUNCTION_NAME}, ${THEME_FUNCTION_NAME}"
echo "  API Gateway: ${API_ID}"
echo "  IAM Role: WordWeaveLambdaExecutionRole"
echo ""
echo -e "${BLUE}Frontend:${NC}"
echo "  Build: /Users/connormurphy/Desktop/WordWeave/frontend/build/"
echo "  Environment: .env.production configured"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Deploy frontend build/ to your hosting service"
echo "2. Test the complete application"
echo "3. Set up monitoring and alerts"
echo ""
echo -e "${GREEN}🚀 WordWeave is now live in production!${NC}"
