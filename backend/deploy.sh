#!/bin/bash

# WordWeave Python Lambda Deployment Script
# Usage: ./deploy.sh [region] [environment]

set -e

# Configuration
REGION=${1:-us-east-1}
ENVIRONMENT=${2:-dev}
FUNCTION_NAME="wordweave-poem-generator-python-${ENVIRONMENT}"
ROLE_NAME="wordweave-lambda-role-python-${ENVIRONMENT}"
TABLE_NAME="wordweave-poems-python-${ENVIRONMENT}"
API_NAME="wordweave-api-python-${ENVIRONMENT}"

echo "🚀 Deploying WordWeave Python Lambda to ${REGION} (${ENVIRONMENT})"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Step 1: Create DynamoDB Table
echo "📝 Creating DynamoDB table..."
aws dynamodb create-table \
    --table-name "$TABLE_NAME" \
    --attribute-definitions \
        AttributeName=cache_key,AttributeType=S \
    --key-schema \
        AttributeName=cache_key,KeyType=HASH \
    --billing-mode PAY_PER_REQUEST \
    --time-to-live-specification \
        AttributeName=ttl,Enabled=true \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "DynamoDB table may already exist"

print_status "DynamoDB table ready"

# Step 2: Create IAM Role
echo "🔐 Creating IAM role..."
aws iam create-role \
    --role-name "$ROLE_NAME" \
    --assume-role-policy-document file://trust-policy.json \
    --no-cli-pager 2>/dev/null || print_warning "IAM role may already exist"

# Update the IAM policy with correct resource names
sed "s/wordweave-poems-python/${TABLE_NAME}/g" iam-policy.json > iam-policy-temp.json
sed -i.bak "s/wordweave-poem-generator-python/${FUNCTION_NAME}/g" iam-policy-temp.json

aws iam put-role-policy \
    --role-name "$ROLE_NAME" \
    --policy-name "WordWeaveLambdaPolicy" \
    --policy-document file://iam-policy-temp.json \
    --no-cli-pager

# Clean up temp file
rm iam-policy-temp.json iam-policy-temp.json.bak

print_status "IAM role configured"

# Step 3: Wait for role to be available
echo "⏳ Waiting for IAM role to propagate..."
sleep 10

# Step 4: Get AWS Account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ROLE_ARN="arn:aws:iam::${ACCOUNT_ID}:role/${ROLE_NAME}"

# Step 5: Create deployment package
echo "📦 Creating deployment package..."
rm -rf package deployment.zip
mkdir package

# Install dependencies
pip install -r requirements.txt -t package/

# Copy Lambda function
cp lambda_function.py package/

# Create deployment zip
cd package
zip -r ../deployment.zip .
cd ..

print_status "Deployment package created"

# Step 6: Create or update Lambda function
echo "🚀 Deploying Lambda function..."

# Check if function exists
if aws lambda get-function --function-name "$FUNCTION_NAME" --region "$REGION" --no-cli-pager >/dev/null 2>&1; then
    print_warning "Function exists, updating..."
    aws lambda update-function-code \
        --function-name "$FUNCTION_NAME" \
        --zip-file fileb://deployment.zip \
        --region "$REGION" \
        --no-cli-pager
    
    # Update function configuration
    aws lambda update-function-configuration \
        --function-name "$FUNCTION_NAME" \
        --environment Variables="{DYNAMODB_TABLE_NAME=${TABLE_NAME}}" \
        --timeout 30 \
        --memory-size 512 \
        --region "$REGION" \
        --no-cli-pager
else
    print_status "Creating new function..."
    aws lambda create-function \
        --function-name "$FUNCTION_NAME" \
        --runtime python3.11 \
        --role "$ROLE_ARN" \
        --handler lambda_function.lambda_handler \
        --zip-file fileb://deployment.zip \
        --timeout 30 \
        --memory-size 512 \
        --environment Variables="{DYNAMODB_TABLE_NAME=${TABLE_NAME}}" \
        --region "$REGION" \
        --no-cli-pager
fi

print_status "Lambda function deployed"

# Step 7: Create API Gateway
echo "🌐 Setting up API Gateway..."

# Create REST API
API_ID=$(aws apigateway create-rest-api \
    --name "$API_NAME" \
    --description "WordWeave Poetry Generation API (Python)" \
    --region "$REGION" \
    --query 'id' \
    --output text 2>/dev/null || aws apigateway get-rest-apis --region "$REGION" --query "items[?name=='${API_NAME}'].id" --output text)

# Get root resource ID
ROOT_RESOURCE_ID=$(aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --region "$REGION" \
    --query 'items[?path==`/`].id' \
    --output text)

# Create /generate resource
RESOURCE_ID=$(aws apigateway create-resource \
    --rest-api-id "$API_ID" \
    --parent-id "$ROOT_RESOURCE_ID" \
    --path-part "generate" \
    --region "$REGION" \
    --query 'id' \
    --output text 2>/dev/null || aws apigateway get-resources \
    --rest-api-id "$API_ID" \
    --region "$REGION" \
    --query 'items[?pathPart==`generate`].id' \
    --output text)

# Create POST method
aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --authorization-type NONE \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "POST method may already exist"

# Create OPTIONS method for CORS
aws apigateway put-method \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --authorization-type NONE \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "OPTIONS method may already exist"

# Set up Lambda integration for POST
FUNCTION_ARN="arn:aws:lambda:${REGION}:${ACCOUNT_ID}:function:${FUNCTION_NAME}"

aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --type AWS_PROXY \
    --integration-http-method POST \
    --uri "arn:aws:apigateway:${REGION}:lambda:path/2015-03-31/functions/${FUNCTION_ARN}/invocations" \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "POST integration may already exist"

# Set up CORS for OPTIONS
aws apigateway put-integration \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --type MOCK \
    --request-templates '{"application/json":"{\"statusCode\": 200}"}' \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "OPTIONS integration may already exist"

# Set up method responses
aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --status-code 200 \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "POST method response may already exist"

aws apigateway put-method-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":false,"method.response.header.Access-Control-Allow-Methods":false,"method.response.header.Access-Control-Allow-Origin":false}' \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "OPTIONS method response may already exist"

# Set up integration responses
aws apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method POST \
    --status-code 200 \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "POST integration response may already exist"

aws apigateway put-integration-response \
    --rest-api-id "$API_ID" \
    --resource-id "$RESOURCE_ID" \
    --http-method OPTIONS \
    --status-code 200 \
    --response-parameters '{"method.response.header.Access-Control-Allow-Headers":"'"'"'Content-Type,X-API-Key,Authorization'"'"'","method.response.header.Access-Control-Allow-Methods":"'"'"'GET,POST,OPTIONS'"'"'","method.response.header.Access-Control-Allow-Origin":"'"'"'*'"'"'"}' \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "OPTIONS integration response may already exist"

# Grant API Gateway permission to invoke Lambda
aws lambda add-permission \
    --function-name "$FUNCTION_NAME" \
    --statement-id "apigateway-invoke-${ENVIRONMENT}" \
    --action lambda:InvokeFunction \
    --principal apigateway.amazonaws.com \
    --source-arn "arn:aws:execute-api:${REGION}:${ACCOUNT_ID}:${API_ID}/*" \
    --region "$REGION" \
    --no-cli-pager 2>/dev/null || print_warning "API Gateway permission may already exist"

# Deploy API
aws apigateway create-deployment \
    --rest-api-id "$API_ID" \
    --stage-name "$ENVIRONMENT" \
    --region "$REGION" \
    --no-cli-pager

print_status "API Gateway configured"

# Step 8: Output important information
echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Deployment Summary:"
echo "  Function Name: $FUNCTION_NAME"
echo "  Region: $REGION"
echo "  Environment: $ENVIRONMENT"
echo "  API Gateway ID: $API_ID"
echo ""
echo "🔗 API Endpoint:"
echo "  https://${API_ID}.execute-api.${REGION}.amazonaws.com/${ENVIRONMENT}/generate"
echo ""
echo "📝 Test your API:"
echo "  curl -X POST https://${API_ID}.execute-api.${REGION}.amazonaws.com/${ENVIRONMENT}/generate \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"verb\":\"dance\",\"adjective\":\"ethereal\",\"noun\":\"moonlight\"}'"
echo ""
echo "🔍 Monitor logs:"
echo "  aws logs tail /aws/lambda/$FUNCTION_NAME --follow --region $REGION"

# Clean up
rm -rf package deployment.zip

print_status "Cleanup completed"
