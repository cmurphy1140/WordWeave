#!/bin/bash

# WordWeave Domain and SSL Setup Script
# This script sets up Route53 hosted zone and ACM SSL certificate

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="wordweave.app"
REGION="us-east-1"
TTL=300

echo -e "${BLUE}🌐 WordWeave Domain and SSL Setup${NC}"
echo "================================================"
echo "Domain: ${DOMAIN_NAME}"
echo "Region: ${REGION}"
echo ""

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed${NC}"
    exit 1
fi

if ! aws sts get-caller-identity &> /dev/null; then
    echo -e "${RED}❌ AWS credentials not configured${NC}"
    exit 1
fi

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
echo -e "${GREEN}✅ AWS Account: ${ACCOUNT_ID}${NC}"

# Function to wait for user input
wait_for_confirmation() {
    local message="$1"
    echo -e "${YELLOW}⏳ ${message}${NC}"
    read -p "Press Enter when ready to continue..."
    echo ""
}

# Step 1: Create Route53 Hosted Zone
echo -e "${YELLOW}🏗️  Step 1: Setting up Route53 Hosted Zone${NC}"

# Check if hosted zone already exists
EXISTING_ZONE=$(aws route53 list-hosted-zones-by-name --dns-name $DOMAIN_NAME --query 'HostedZones[0].Id' --output text 2>/dev/null || echo "None")

if [ "$EXISTING_ZONE" != "None" ] && [ "$EXISTING_ZONE" != "null" ]; then
    HOSTED_ZONE_ID=${EXISTING_ZONE#/hostedzone/}
    echo -e "${GREEN}✅ Hosted zone already exists: ${HOSTED_ZONE_ID}${NC}"
else
    echo "Creating hosted zone for ${DOMAIN_NAME}..."

    # Create hosted zone
    ZONE_RESPONSE=$(aws route53 create-hosted-zone \
        --name $DOMAIN_NAME \
        --caller-reference "wordweave-$(date +%s)" \
        --hosted-zone-config Comment="WordWeave hosted zone" \
        --query 'HostedZone.Id' \
        --output text)

    HOSTED_ZONE_ID=${ZONE_RESPONSE#/hostedzone/}
    echo -e "${GREEN}✅ Created hosted zone: ${HOSTED_ZONE_ID}${NC}"
fi

# Get name servers
echo -e "${YELLOW}📋 Getting name servers...${NC}"
NAME_SERVERS=$(aws route53 get-hosted-zone --id $HOSTED_ZONE_ID --query 'DelegationSet.NameServers' --output json)

echo -e "${BLUE}Name Servers for ${DOMAIN_NAME}:${NC}"
echo "$NAME_SERVERS" | jq -r '.[]' | while read ns; do
    echo "  - $ns"
done

echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Update your domain registrar with these name servers${NC}"
echo "Log into your domain registrar (GoDaddy, Namecheap, etc.) and update the name servers"
echo "for ${DOMAIN_NAME} to use the AWS Route53 name servers listed above."
echo ""

wait_for_confirmation "Update your domain registrar with the name servers above"

# Step 2: Request SSL Certificate
echo -e "${YELLOW}🔒 Step 2: Requesting SSL Certificate${NC}"

# Check if certificate already exists
EXISTING_CERT=$(aws acm list-certificates \
    --region $REGION \
    --query "CertificateSummaryList[?DomainName=='*.${DOMAIN_NAME}'].CertificateArn" \
    --output text 2>/dev/null || echo "")

if [ -n "$EXISTING_CERT" ] && [ "$EXISTING_CERT" != "None" ]; then
    CERTIFICATE_ARN="$EXISTING_CERT"
    echo -e "${GREEN}✅ SSL certificate already exists: ${CERTIFICATE_ARN}${NC}"

    # Check certificate status
    CERT_STATUS=$(aws acm describe-certificate \
        --certificate-arn $CERTIFICATE_ARN \
        --region $REGION \
        --query 'Certificate.Status' \
        --output text)

    echo -e "${BLUE}Certificate status: ${CERT_STATUS}${NC}"
else
    echo "Requesting SSL certificate for *.${DOMAIN_NAME}..."

    # Request certificate
    CERTIFICATE_ARN=$(aws acm request-certificate \
        --domain-name "*.${DOMAIN_NAME}" \
        --subject-alternative-names "$DOMAIN_NAME" \
        --validation-method DNS \
        --region $REGION \
        --query 'CertificateArn' \
        --output text)

    echo -e "${GREEN}✅ Requested certificate: ${CERTIFICATE_ARN}${NC}"
fi

# Step 3: Get DNS validation records
echo -e "${YELLOW}📝 Step 3: Setting up DNS validation${NC}"

# Wait for certificate to be in pending validation state
echo "Waiting for certificate validation records..."
sleep 10

# Get validation records
VALIDATION_RECORDS=$(aws acm describe-certificate \
    --certificate-arn $CERTIFICATE_ARN \
    --region $REGION \
    --query 'Certificate.DomainValidationOptions' \
    --output json)

echo -e "${BLUE}DNS Validation Records:${NC}"
echo "$VALIDATION_RECORDS" | jq -r '.[] | "Domain: \(.DomainName)\nName: \(.ResourceRecord.Name)\nType: \(.ResourceRecord.Type)\nValue: \(.ResourceRecord.Value)\n"'

# Step 4: Create DNS validation records automatically
echo -e "${YELLOW}🤖 Step 4: Creating DNS validation records${NC}"

# Create validation records for each domain
echo "$VALIDATION_RECORDS" | jq -c '.[]' | while read record; do
    DOMAIN=$(echo $record | jq -r '.DomainName')
    RECORD_NAME=$(echo $record | jq -r '.ResourceRecord.Name')
    RECORD_TYPE=$(echo $record | jq -r '.ResourceRecord.Type')
    RECORD_VALUE=$(echo $record | jq -r '.ResourceRecord.Value')

    echo "Creating validation record for ${DOMAIN}..."

    # Create change batch
    CHANGE_BATCH=$(cat <<EOF
{
    "Changes": [{
        "Action": "UPSERT",
        "ResourceRecordSet": {
            "Name": "${RECORD_NAME}",
            "Type": "${RECORD_TYPE}",
            "TTL": ${TTL},
            "ResourceRecords": [{
                "Value": "${RECORD_VALUE}"
            }]
        }
    }]
}
EOF
)

    # Apply DNS record
    CHANGE_ID=$(aws route53 change-resource-record-sets \
        --hosted-zone-id $HOSTED_ZONE_ID \
        --change-batch "$CHANGE_BATCH" \
        --query 'ChangeInfo.Id' \
        --output text)

    echo -e "${GREEN}✅ Created DNS record for ${DOMAIN} (Change ID: ${CHANGE_ID})${NC}"
done

# Step 5: Wait for certificate validation
echo -e "${YELLOW}⏳ Step 5: Waiting for certificate validation${NC}"
echo "This may take 5-10 minutes..."

aws acm wait certificate-validated \
    --certificate-arn $CERTIFICATE_ARN \
    --region $REGION

echo -e "${GREEN}✅ Certificate validated successfully!${NC}"

# Step 6: Verify certificate status
FINAL_STATUS=$(aws acm describe-certificate \
    --certificate-arn $CERTIFICATE_ARN \
    --region $REGION \
    --query 'Certificate.Status' \
    --output text)

echo -e "${BLUE}Final certificate status: ${FINAL_STATUS}${NC}"

# Step 7: Create parameter store entries for deployment scripts
echo -e "${YELLOW}💾 Step 7: Storing configuration in Parameter Store${NC}"

aws ssm put-parameter \
    --name "/wordweave/prod/domain-name" \
    --value "$DOMAIN_NAME" \
    --type "String" \
    --overwrite \
    --description "WordWeave production domain name" \
    --region $REGION

aws ssm put-parameter \
    --name "/wordweave/prod/hosted-zone-id" \
    --value "$HOSTED_ZONE_ID" \
    --type "String" \
    --overwrite \
    --description "WordWeave Route53 hosted zone ID" \
    --region $REGION

aws ssm put-parameter \
    --name "/wordweave/prod/certificate-arn" \
    --value "$CERTIFICATE_ARN" \
    --type "String" \
    --overwrite \
    --description "WordWeave SSL certificate ARN" \
    --region $REGION

echo -e "${GREEN}✅ Configuration stored in Parameter Store${NC}"

# Step 8: Create domain summary file
echo -e "${YELLOW}📄 Step 8: Creating domain configuration summary${NC}"

cat > domain-setup-summary.txt << EOF
WordWeave Domain Setup Summary
=============================

Setup Date: $(date)
AWS Account: ${ACCOUNT_ID}
Region: ${REGION}

Domain Configuration:
- Domain Name: ${DOMAIN_NAME}
- Hosted Zone ID: ${HOSTED_ZONE_ID}
- Certificate ARN: ${CERTIFICATE_ARN}
- Certificate Status: ${FINAL_STATUS}

Name Servers:
$(echo "$NAME_SERVERS" | jq -r '.[]' | sed 's/^/- /')

Next Steps:
1. Verify domain propagation: dig ${DOMAIN_NAME}
2. Test certificate: openssl s_client -connect ${DOMAIN_NAME}:443
3. Deploy backend: cd backend && ./deploy-production.sh
4. Deploy frontend: cd frontend && ./deploy-production.sh

Environment Variables for Deployment:
export DOMAIN_NAME="${DOMAIN_NAME}"
export HOSTED_ZONE_ID="${HOSTED_ZONE_ID}"
export CERTIFICATE_ARN="${CERTIFICATE_ARN}"

Parameter Store Locations:
- /wordweave/prod/domain-name
- /wordweave/prod/hosted-zone-id
- /wordweave/prod/certificate-arn
EOF

echo -e "${GREEN}✅ Domain setup summary created${NC}"

# Step 9: Test domain configuration
echo -e "${YELLOW}🧪 Step 9: Testing domain configuration${NC}"

echo "Testing DNS resolution..."
if dig +short $DOMAIN_NAME @8.8.8.8 | grep -q .; then
    echo -e "${GREEN}✅ Domain resolves correctly${NC}"
else
    echo -e "${YELLOW}⚠️  Domain may still be propagating${NC}"
fi

echo "Testing certificate validation..."
if [ "$FINAL_STATUS" = "ISSUED" ]; then
    echo -e "${GREEN}✅ Certificate is valid and ready for use${NC}"
else
    echo -e "${RED}❌ Certificate validation failed: ${FINAL_STATUS}${NC}"
    exit 1
fi

# Final output
echo ""
echo "================================================"
echo -e "${GREEN}🎉 Domain Setup Complete!${NC}"
echo "================================================"
echo ""
echo -e "${BLUE}Domain Name:${NC} ${DOMAIN_NAME}"
echo -e "${BLUE}Hosted Zone ID:${NC} ${HOSTED_ZONE_ID}"
echo -e "${BLUE}Certificate ARN:${NC} ${CERTIFICATE_ARN}"
echo ""
echo -e "${YELLOW}📋 Next Steps:${NC}"
echo "1. Wait for DNS propagation (may take up to 48 hours)"
echo "2. Test domain resolution: dig ${DOMAIN_NAME}"
echo "3. Run deployment scripts with the generated configuration"
echo "4. Monitor certificate expiration (auto-renewal enabled)"
echo ""
echo -e "${BLUE}📄 Check domain-setup-summary.txt for full details${NC}"

# Optional: Test immediate DNS resolution
echo ""
read -p "Test DNS resolution now? (y/N): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Testing DNS resolution from multiple servers..."

    for server in "8.8.8.8" "1.1.1.1" "208.67.222.222"; do
        echo -n "Testing ${server}: "
        if timeout 5 dig +short $DOMAIN_NAME @$server | grep -q .; then
            echo -e "${GREEN}✅ Resolves${NC}"
        else
            echo -e "${YELLOW}⚠️  No response${NC}"
        fi
    done
fi

echo -e "${GREEN}🚀 Domain setup successful!${NC}"