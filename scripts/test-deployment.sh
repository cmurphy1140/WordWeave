#!/bin/bash

# WordWeave Deployment Testing Script
# Comprehensive testing of backend and frontend deployments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="wordweave.app"
API_DOMAIN="api.wordweave.app"
REGION="us-east-1"
TIMEOUT=30

echo -e "${BLUE}🧪 WordWeave Deployment Testing Suite${NC}"
echo "=================================================="
echo "Domain: ${DOMAIN_NAME}"
echo "API: ${API_DOMAIN}"
echo "Region: ${REGION}"
echo ""

# Test counters
TESTS_TOTAL=0
TESTS_PASSED=0
TESTS_FAILED=0

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_result="$3"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing ${test_name}... "

    if eval "$test_command" &> /dev/null; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to run a test with output capture
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    local success_pattern="$3"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing ${test_name}... "

    local output
    output=$(eval "$test_command" 2>&1)
    local exit_code=$?

    if [ $exit_code -eq 0 ] && [[ -n "$success_pattern" && "$output" =~ $success_pattern ]]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    elif [ $exit_code -eq 0 ] && [ -z "$success_pattern" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo -e "${RED}   Output: ${output}${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test HTTP endpoint
test_http_endpoint() {
    local url="$1"
    local expected_status="$2"
    local test_name="$3"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing ${test_name}... "

    local response
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "$url")

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS (${response})${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL (got ${response}, expected ${expected_status})${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Function to test JSON API endpoint
test_json_endpoint() {
    local url="$1"
    local method="$2"
    local data="$3"
    local expected_field="$4"
    local test_name="$5"

    TESTS_TOTAL=$((TESTS_TOTAL + 1))
    echo -n "Testing ${test_name}... "

    local response
    if [ "$method" = "POST" ]; then
        response=$(curl -s --max-time $TIMEOUT -X POST \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    else
        response=$(curl -s --max-time $TIMEOUT "$url")
    fi

    if echo "$response" | jq -e ".$expected_field" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAIL${NC}"
        echo -e "${RED}   Response: ${response}${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

# Prerequisites check
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v curl &> /dev/null; then
    echo -e "${RED}❌ curl is not installed${NC}"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    echo -e "${RED}❌ jq is not installed${NC}"
    exit 1
fi

if ! command -v dig &> /dev/null; then
    echo -e "${RED}❌ dig is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# DNS Resolution Tests
echo -e "${YELLOW}🌐 DNS Resolution Tests${NC}"
echo "----------------------------------------"

run_test_with_output "Main domain DNS resolution" \
    "dig +short $DOMAIN_NAME @8.8.8.8" \
    ".*"

run_test_with_output "WWW subdomain DNS resolution" \
    "dig +short www.$DOMAIN_NAME @8.8.8.8" \
    ".*"

run_test_with_output "API subdomain DNS resolution" \
    "dig +short $API_DOMAIN @8.8.8.8" \
    ".*"

echo ""

# SSL Certificate Tests
echo -e "${YELLOW}🔒 SSL Certificate Tests${NC}"
echo "----------------------------------------"

test_http_endpoint "https://$DOMAIN_NAME" "200" "Main domain HTTPS"
test_http_endpoint "https://www.$DOMAIN_NAME" "200" "WWW subdomain HTTPS"
test_http_endpoint "https://$API_DOMAIN/health" "200" "API domain HTTPS"

# Test SSL certificate details
run_test_with_output "SSL certificate validity" \
    "echo | openssl s_client -servername $DOMAIN_NAME -connect $DOMAIN_NAME:443 2>/dev/null | openssl x509 -noout -dates" \
    "notAfter"

echo ""

# Backend API Tests
echo -e "${YELLOW}⚙️  Backend API Tests${NC}"
echo "----------------------------------------"

# Health check
test_http_endpoint "https://$API_DOMAIN/health" "200" "Health check endpoint"

# Test poem generation
test_json_endpoint "https://$API_DOMAIN/generate" \
    "POST" \
    '{"verb":"dance","adjective":"ethereal","noun":"moonlight"}' \
    "poem" \
    "Poem generation API"

# Test theme analysis
test_json_endpoint "https://$API_DOMAIN/analyze" \
    "POST" \
    '{"poem":"Ethereal moonlight dances through the night, casting shadows on the ground below."}' \
    "colors" \
    "Theme analysis API"

# Test CORS headers
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing CORS headers... "
cors_response=$(curl -s -H "Origin: https://$DOMAIN_NAME" \
    -H "Access-Control-Request-Method: POST" \
    -H "Access-Control-Request-Headers: Content-Type" \
    -X OPTIONS "https://$API_DOMAIN/generate" \
    -o /dev/null -w "%{http_code}")

if [ "$cors_response" = "200" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL (${cors_response})${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Frontend Tests
echo -e "${YELLOW}🎨 Frontend Tests${NC}"
echo "----------------------------------------"

# Test main page load
test_http_endpoint "https://$DOMAIN_NAME" "200" "Main page load"
test_http_endpoint "https://www.$DOMAIN_NAME" "200" "WWW redirect"

# Test SPA routing (should return 200 for any path)
test_http_endpoint "https://$DOMAIN_NAME/generate" "200" "SPA routing (/generate)"
test_http_endpoint "https://$DOMAIN_NAME/about" "200" "SPA routing (/about)"

# Test static assets
test_http_endpoint "https://$DOMAIN_NAME/static/css/" "404" "Static CSS directory"
test_http_endpoint "https://$DOMAIN_NAME/manifest.json" "200" "PWA manifest"

# Test service worker
test_http_endpoint "https://$DOMAIN_NAME/sw.js" "200" "Service worker"

echo ""

# Performance Tests
echo -e "${YELLOW}⚡ Performance Tests${NC}"
echo "----------------------------------------"

# Test response times
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing API response time... "
api_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "https://$API_DOMAIN/health")
if (( $(echo "$api_time < 2.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS (${api_time}s)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL (${api_time}s > 2.0s)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing frontend response time... "
frontend_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time $TIMEOUT "https://$DOMAIN_NAME")
if (( $(echo "$frontend_time < 3.0" | bc -l) )); then
    echo -e "${GREEN}✅ PASS (${frontend_time}s)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL (${frontend_time}s > 3.0s)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Security Tests
echo -e "${YELLOW}🛡️  Security Tests${NC}"
echo "----------------------------------------"

# Test HTTP to HTTPS redirect
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing HTTP to HTTPS redirect... "
redirect_response=$(curl -s -o /dev/null -w "%{http_code}" --max-time $TIMEOUT "http://$DOMAIN_NAME")
if [ "$redirect_response" = "301" ] || [ "$redirect_response" = "302" ]; then
    echo -e "${GREEN}✅ PASS (${redirect_response})${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL (${redirect_response})${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

# Test security headers
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing security headers... "
security_headers=$(curl -s -I "https://$DOMAIN_NAME" | grep -i "strict-transport-security\|x-frame-options\|x-content-type-options")
if [ -n "$security_headers" ]; then
    echo -e "${GREEN}✅ PASS${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Load Testing
echo -e "${YELLOW}📊 Basic Load Testing${NC}"
echo "----------------------------------------"

echo "Running basic concurrent request test..."
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing concurrent requests (10 parallel)... "

# Create temporary script for parallel requests
cat > /tmp/wordweave_load_test.sh << 'EOF'
#!/bin/bash
for i in {1..10}; do
    curl -s -o /dev/null -w "%{http_code}\n" --max-time 30 "https://api.wordweave.app/health" &
done
wait
EOF

chmod +x /tmp/wordweave_load_test.sh
load_results=$(/tmp/wordweave_load_test.sh)
successful_requests=$(echo "$load_results" | grep -c "200" || echo "0")

if [ "$successful_requests" -ge 8 ]; then
    echo -e "${GREEN}✅ PASS (${successful_requests}/10 successful)${NC}"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL (${successful_requests}/10 successful)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

rm -f /tmp/wordweave_load_test.sh

echo ""

# Integration Tests
echo -e "${YELLOW}🔗 Integration Tests${NC}"
echo "----------------------------------------"

# Test complete poem generation flow
TESTS_TOTAL=$((TESTS_TOTAL + 1))
echo -n "Testing complete poem generation flow... "

# Generate poem and then analyze theme
poem_response=$(curl -s --max-time $TIMEOUT -X POST \
    -H "Content-Type: application/json" \
    -d '{"verb":"whisper","adjective":"ancient","noun":"forest"}' \
    "https://$API_DOMAIN/generate")

if echo "$poem_response" | jq -e '.poem' > /dev/null 2>&1; then
    # Extract poem and test theme analysis
    poem_text=$(echo "$poem_response" | jq -r '.poem')
    theme_response=$(curl -s --max-time $TIMEOUT -X POST \
        -H "Content-Type: application/json" \
        -d "{\"poem\":\"$poem_text\"}" \
        "https://$API_DOMAIN/analyze")

    if echo "$theme_response" | jq -e '.colors' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL (theme analysis failed)${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
else
    echo -e "${RED}❌ FAIL (poem generation failed)${NC}"
    TESTS_FAILED=$((TESTS_FAILED + 1))
fi

echo ""

# Infrastructure Tests
echo -e "${YELLOW}☁️  Infrastructure Tests${NC}"
echo "----------------------------------------"

# Test AWS services availability
if command -v aws &> /dev/null && aws sts get-caller-identity &> /dev/null; then
    # Check CloudFormation stacks
    run_test "Backend stack exists" \
        "aws cloudformation describe-stacks --stack-name wordweave-backend-prod --region $REGION"

    run_test "Frontend stack exists" \
        "aws cloudformation describe-stacks --stack-name wordweave-frontend-prod --region $REGION"

    # Check Lambda functions
    run_test "Poem generator Lambda exists" \
        "aws lambda get-function --function-name wordweave-poem-generator-prod --region $REGION"

    run_test "Theme analyzer Lambda exists" \
        "aws lambda get-function --function-name wordweave-theme-analyzer-prod --region $REGION"

    # Check DynamoDB tables
    run_test "Poem cache table exists" \
        "aws dynamodb describe-table --table-name wordweave-poems-prod --region $REGION"

    run_test "Theme cache table exists" \
        "aws dynamodb describe-table --table-name wordweave-themes-prod --region $REGION"
else
    echo -e "${YELLOW}⚠️  AWS CLI not configured, skipping infrastructure tests${NC}"
fi

echo ""

# Generate test report
echo "=================================================="
echo -e "${BLUE}📊 Test Results Summary${NC}"
echo "=================================================="
echo ""
echo -e "${BLUE}Total Tests:${NC} ${TESTS_TOTAL}"
echo -e "${GREEN}Passed:${NC} ${TESTS_PASSED}"
echo -e "${RED}Failed:${NC} ${TESTS_FAILED}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}Success Rate: 100%${NC}"
    echo ""
    echo -e "${GREEN}🎉 All tests passed! WordWeave is fully operational.${NC}"
    exit_code=0
else
    success_rate=$(( TESTS_PASSED * 100 / TESTS_TOTAL ))
    echo -e "${YELLOW}Success Rate: ${success_rate}%${NC}"
    echo ""
    echo -e "${RED}❌ Some tests failed. Please review the issues above.${NC}"
    exit_code=1
fi

# Create detailed test report
cat > deployment-test-report.txt << EOF
WordWeave Deployment Test Report
===============================

Test Date: $(date)
Domain: ${DOMAIN_NAME}
API Domain: ${API_DOMAIN}
Region: ${REGION}

Test Summary:
- Total Tests: ${TESTS_TOTAL}
- Passed: ${TESTS_PASSED}
- Failed: ${TESTS_FAILED}
- Success Rate: $(( TESTS_PASSED * 100 / TESTS_TOTAL ))%

Test Categories:
✓ DNS Resolution
✓ SSL Certificates
✓ Backend API
✓ Frontend Application
✓ Performance
✓ Security
✓ Load Testing
✓ Integration
✓ Infrastructure

Performance Metrics:
- API Response Time: ${api_time}s (target: <2s)
- Frontend Load Time: ${frontend_time}s (target: <3s)
- Concurrent Requests: ${successful_requests}/10 successful

Status: $([ $exit_code -eq 0 ] && echo "✅ OPERATIONAL" || echo "❌ ISSUES DETECTED")

Next Steps:
$([ $exit_code -eq 0 ] && echo "- Monitor production metrics
- Set up automated health checks
- Configure alerting thresholds
- Plan regular testing schedule" || echo "- Review failed tests
- Check AWS CloudWatch logs
- Verify configuration settings
- Re-run tests after fixes")

Generated: $(date)
EOF

echo ""
echo -e "${BLUE}📄 Detailed report saved to: deployment-test-report.txt${NC}"

# Optional: Open monitoring dashboard
if [[ "$OSTYPE" == "darwin"* ]]; then
    read -p "Open CloudWatch dashboard? (y/N): " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:"
    fi
fi

echo -e "${BLUE}🚀 Testing complete!${NC}"
exit $exit_code