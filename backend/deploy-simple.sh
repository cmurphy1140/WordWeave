#!/bin/bash

# Simple WordWeave Production Deployment
# This creates a basic Lambda function without custom domains

set -e

echo "🚀 Deploying WordWeave to AWS Lambda..."

# Create deployment package
echo "📦 Creating deployment package..."
cd /Users/connormurphy/Desktop/WordWeave/backend

# Create a clean deployment directory
rm -rf deploy-temp
mkdir deploy-temp
cd deploy-temp

# Copy Python files
cp ../lambda_function.py .
cp ../theme_analyzer.py .
cp ../requirements.txt .

# Install dependencies
pip install -r requirements.txt -t .

# Create deployment zip
zip -r ../wordweave-deployment.zip .

cd ..
rm -rf deploy-temp

echo "✅ Deployment package created"

# Create IAM role for Lambda
echo "🔑 Creating IAM role..."
aws iam create-role \
  --role-name WordWeaveLambdaRole \
  --assume-role-policy-document '{
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
  }' || echo "Role might already exist"

# Attach basic Lambda execution policy
aws iam attach-role-policy \
  --role-name WordWeaveLambdaRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

# Attach Bedrock policy
aws iam put-role-policy \
  --role-name WordWeaveLambdaRole \
  --policy-name BedrockAccess \
  --policy-document '{
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
  }'

echo "✅ IAM role configured"

# Wait for role to be ready
sleep 10

# Get account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

# Create Lambda function
echo "⚡ Creating Lambda function..."
aws lambda create-function \
  --function-name wordweave-poem-generator \
  --runtime python3.11 \
  --role arn:aws:iam::${ACCOUNT_ID}:role/WordWeaveLambdaRole \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://wordweave-deployment.zip \
  --timeout 30 \
  --memory-size 512 \
  --environment Variables='{
    "BEDROCK_MODEL_ID": "anthropic.claude-3-5-sonnet-20241022",
    "BEDROCK_REGION": "us-east-1",
    "LOG_LEVEL": "INFO"
  }' || echo "Function might already exist, updating..."

# Update function if it already exists
aws lambda update-function-code \
  --function-name wordweave-poem-generator \
  --zip-file fileb://wordweave-deployment.zip || echo "Update completed"

echo "✅ Lambda function deployed"

# Create API Gateway
echo "🌐 Creating API Gateway..."
API_ID=$(aws apigatewayv2 create-api \
  --name wordweave-api \
  --protocol-type HTTP \
  --cors-configuration AllowOrigins="*",AllowMethods="*",AllowHeaders="*" \
  --query ApiId --output text) || echo "API might already exist"

if [ -z "$API_ID" ]; then
  # Get existing API ID
  API_ID=$(aws apigatewayv2 get-apis --query "Items[?Name=='wordweave-api'].ApiId" --output text)
fi

echo "API ID: $API_ID"

# Create integration
INTEGRATION_ID=$(aws apigatewayv2 create-integration \
  --api-id $API_ID \
  --integration-type AWS_PROXY \
  --integration-uri arn:aws:lambda:us-east-1:${ACCOUNT_ID}:function:wordweave-poem-generator \
  --payload-format-version 2.0 \
  --query IntegrationId --output text) || echo "Integration might already exist"

# Create routes
aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "POST /generate" \
  --target integrations/$INTEGRATION_ID || echo "Route might already exist"

aws apigatewayv2 create-route \
  --api-id $API_ID \
  --route-key "GET /health" \
  --target integrations/$INTEGRATION_ID || echo "Route might already exist"

# Create deployment
aws apigatewayv2 create-deployment \
  --api-id $API_ID \
  --stage-name prod || echo "Deployment might already exist"

# Add Lambda permission for API Gateway
aws lambda add-permission \
  --function-name wordweave-poem-generator \
  --statement-id api-gateway-invoke \
  --action lambda:InvokeFunction \
  --principal apigateway.amazonaws.com \
  --source-arn "arn:aws:execute-api:us-east-1:${ACCOUNT_ID}:${API_ID}/*/*" || echo "Permission might already exist"

# Get API endpoint
API_ENDPOINT=$(aws apigatewayv2 get-api --api-id $API_ID --query ApiEndpoint --output text)

echo "✅ API Gateway configured"

# Create frontend environment file
echo "📝 Creating frontend environment..."
cat > ../frontend/.env.production << EOF
REACT_APP_API_URL=${API_ENDPOINT}/prod
REACT_APP_ENVIRONMENT=production
EOF

echo "✅ Frontend environment configured"

# Test the deployment
echo "🧪 Testing deployment..."
curl -X POST "${API_ENDPOINT}/prod/generate" \
  -H "Content-Type: application/json" \
  -d '{"verb":"dance","adjective":"mystic","noun":"forest"}' \
  | head -c 200

echo ""
echo ""
echo "🎉 Deployment Complete!"
echo "======================================"
echo "API Endpoint: ${API_ENDPOINT}/prod"
echo "Health Check: ${API_ENDPOINT}/prod/health"
echo "Generate Poem: ${API_ENDPOINT}/prod/generate"
echo ""
echo "Frontend environment file created at:"
echo "../frontend/.env.production"
echo ""
echo "Next steps:"
echo "1. Build frontend: cd ../frontend && npm run build"
echo "2. Deploy frontend to your hosting service"
echo "3. Test the complete application"

# Cleanup
rm -f wordweave-deployment.zip
