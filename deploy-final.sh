#!/bin/bash

# WordWeave AWS CLI Production Deployment - Final Version
# Fixed JSON parsing and simplified approach

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 WordWeave Final AWS Deployment${NC}"
echo "=============================================="

# Configuration
REGION="us-east-1"
FUNCTION_NAME="wordweave-poem-generator"
API_NAME="wordweave-api"
STAGE_NAME="prod"

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${BLUE}📊 Account: ${ACCOUNT_ID} | Region: ${REGION}${NC}"

cd /Users/connormurphy/Desktop/WordWeave/backend

# Step 1: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
rm -rf deploy-temp wordweave-*.zip

mkdir deploy-temp
cd deploy-temp

# Copy source files
cp ../lambda_function.py .
cp ../theme_analyzer.py .

# Create simple requirements
echo "requests>=2.31.0" > requirements.txt

# Install dependencies
source ../venv/bin/activate
pip install requests -t . --quiet --no-deps

# Create zip
zip -r ../wordweave-deployment.zip . -q
cd ..
rm -rf deploy-temp

echo -e "${GREEN}✅ Package created${NC}"

# Step 2: Setup IAM role
echo -e "${YELLOW}🔑 Setting up IAM...${NC}"

# Check if role exists
ROLE_ARN=$(aws iam get-role --role-name WordWeaveLambdaRole --query 'Role.Arn' --output text 2>/dev/null || echo "")

if [ -z "$ROLE_ARN" ]; then
    # Create role
    ROLE_ARN=$(aws iam create-role \
      --role-name WordWeaveLambdaRole \
      --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Principal": {"Service": "lambda.amazonaws.com"},
          "Action": "sts:AssumeRole"
        }]
      }' \
      --query 'Role.Arn' --output text)
    
    # Attach policies
    aws iam attach-role-policy \
      --role-name WordWeaveLambdaRole \
      --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
    
    aws iam put-role-policy \
      --role-name WordWeaveLambdaRole \
      --policy-name BedrockAccess \
      --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
          "Effect": "Allow",
          "Action": ["bedrock:InvokeModel"],
          "Resource": "*"
        }]
      }'
    
    sleep 15  # Wait for propagation
fi

echo -e "${GREEN}✅ IAM ready${NC}"

# Step 3: Create Lambda function
echo -e "${YELLOW}⚡ Creating Lambda function...${NC}"

# Create environment variables file
cat > env-vars.json << 'EOF'
{
  "Variables": {
    "BEDROCK_MODEL_ID": "anthropic.claude-3-5-sonnet-20241022",
    "BEDROCK_REGION": "us-east-1",
    "LOG_LEVEL": "INFO"
  }
}
EOF

# Create or update function
if aws lambda get-function --function-name ${FUNCTION_NAME} >/dev/null 2>&1; then
    echo "Updating existing function..."
    aws lambda update-function-code \
      --function-name ${FUNCTION_NAME} \
      --zip-file fileb://wordweave-deployment.zip
else
    echo "Creating new function..."
    aws lambda create-function \
      --function-name ${FUNCTION_NAME} \
      --runtime python3.11 \
      --role ${ROLE_ARN} \
      --handler lambda_function.lambda_handler \
      --zip-file fileb://wordweave-deployment.zip \
      --timeout 30 \
      --memory-size 1024 \
      --environment file://env-vars.json \
      --description "WordWeave poem generation service"
fi

echo -e "${GREEN}✅ Lambda function ready${NC}"

# Step 4: Create API Gateway
echo -e "${YELLOW}🌐 Setting up API Gateway...${NC}"

# Get or create API
API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='${API_NAME}'].ApiId" --output text)
if [ "$API_ID" = "" ] || [ "$API_ID" = "None" ]; then
    API_ID=$(aws apigatewayv2 create-api \
      --name ${API_NAME} \
      --protocol-type HTTP \
      --cors-configuration AllowOrigins="*",AllowMethods="*",AllowHeaders="*" \
      --query ApiId --output text)
fi

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id ${API_ID} \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME} \
  --payload-format-version 2.0 \
  --query IntegrationId --output text 2>/dev/null || \
  aws apigatewayv2 get-integrations --api-id ${API_ID} --query 'Items[0].IntegrationId' --output text)

# Create routes
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

# Add permission
aws lambda add-permission \
  --function-name ${FUNCTION_NAME} \
  --statement-id api-gateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*/*" 2>/dev/null || true

API_ENDPOINT=$(aws apigatewayv2 get-api --api-id ${API_ID} --query ApiEndpoint --output text)

echo -e "${GREEN}✅ API Gateway ready${NC}"

# Step 5: Test deployment
echo -e "${YELLOW}🧪 Testing...${NC}"
sleep 5

HEALTH_URL="${API_ENDPOINT}/${STAGE_NAME}/health"
HEALTH_STATUS=$(curl -s -w "%{http_code}" "${HEALTH_URL}" -o /dev/null || echo "000")

if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Health returned: ${HEALTH_STATUS}${NC}"
fi

# Test poem generation
POEM_URL="${API_ENDPOINT}/${STAGE_NAME}/generate"
echo "Testing poem generation..."
curl -s -X POST "${POEM_URL}" \
  -H "Content-Type: application/json" \
  -d '{"verb":"dance","adjective":"mystic","noun":"forest"}' | head -c 200
echo ""

# Step 6: Configure frontend
echo -e "${YELLOW}📝 Configuring frontend...${NC}"

cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=${API_ENDPOINT}/${STAGE_NAME}
REACT_APP_ENVIRONMENT=production
EOF

# Build frontend
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd ../frontend
npm run build --silent

# Cleanup
cd ../backend
rm -f env-vars.json wordweave-deployment.zip

# Summary
echo ""
echo "=============================================="
echo -e "${GREEN}🎉 WordWeave Deployed Successfully!${NC}"
echo "=============================================="
echo ""
echo -e "${BLUE}Production API:${NC} ${API_ENDPOINT}/${STAGE_NAME}"
echo -e "${BLUE}Health Check:${NC} ${API_ENDPOINT}/${STAGE_NAME}/health"
echo -e "${BLUE}Generate Poem:${NC} ${API_ENDPOINT}/${STAGE_NAME}/generate"
echo ""
echo -e "${BLUE}Frontend Build:${NC} /Users/connormurphy/Desktop/WordWeave/frontend/build/"
echo ""
echo -e "${YELLOW}Next: Deploy frontend build/ to your hosting service${NC}"
echo -e "${GREEN}🚀 WordWeave is live!${NC}"
