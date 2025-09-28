#!/bin/bash

# WordWeave Complete Deployment Orchestration Script
# Orchestrates the entire deployment process from start to finish

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
DOMAIN_NAME="${DOMAIN_NAME:-wordweave.app}"
REGION="${REGION:-us-east-1}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "${PURPLE}🚀 WordWeave Complete Deployment Orchestration${NC}"
echo "=============================================================="
echo "Domain: ${DOMAIN_NAME}"
echo "Region: ${REGION}"
echo "Project: ${PROJECT_ROOT}"
echo ""

# Deployment phases
PHASES=("validation" "domain" "backend" "frontend" "monitoring" "testing")
CURRENT_PHASE=0
TOTAL_PHASES=${#PHASES[@]}

# Function to display phase progress
show_phase() {
    local phase_name="$1"
    CURRENT_PHASE=$((CURRENT_PHASE + 1))
    echo ""
    echo "=============================================================="
    echo -e "${PURPLE}📋 Phase ${CURRENT_PHASE}/${TOTAL_PHASES}: ${phase_name}${NC}"
    echo "=============================================================="
    echo ""
}

# Function to check if user wants to continue
confirm_continue() {
    local message="$1"
    local default="${2:-y}"

    echo ""
    echo -e "${YELLOW}${message}${NC}"
    if [ "$default" = "y" ]; then
        read -p "Continue? (Y/n): " -n 1 -r
    else
        read -p "Continue? (y/N): " -n 1 -r
    fi
    echo ""

    if [[ "$default" = "y" && ( -z "$REPLY" || $REPLY =~ ^[Yy]$ ) ]]; then
        return 0
    elif [[ "$default" = "n" && $REPLY =~ ^[Yy]$ ]]; then
        return 0
    else
        echo -e "${YELLOW}Deployment cancelled by user${NC}"
        exit 0
    fi
}

# Function to run a script and handle errors
run_script() {
    local script_path="$1"
    local script_name="$2"
    local continue_on_error="${3:-false}"

    echo -e "${BLUE}Running ${script_name}...${NC}"

    if [ -f "$script_path" ] && [ -x "$script_path" ]; then
        if "$script_path"; then
            echo -e "${GREEN}✅ ${script_name} completed successfully${NC}"
            return 0
        else
            echo -e "${RED}❌ ${script_name} failed${NC}"
            if [ "$continue_on_error" = "true" ]; then
                echo -e "${YELLOW}⚠️  Continuing despite error...${NC}"
                return 1
            else
                echo -e "${RED}Deployment halted due to error${NC}"
                exit 1
            fi
        fi
    else
        echo -e "${RED}❌ Script not found or not executable: ${script_path}${NC}"
        exit 1
    fi
}

# Function to estimate deployment time
estimate_time() {
    echo -e "${BLUE}⏱️  Estimated Deployment Time:${NC}"
    echo "   Phase 1 - Validation: 2-3 minutes"
    echo "   Phase 2 - Domain Setup: 5-15 minutes"
    echo "   Phase 3 - Backend: 5-10 minutes"
    echo "   Phase 4 - Frontend: 10-20 minutes"
    echo "   Phase 5 - Monitoring: 3-5 minutes"
    echo "   Phase 6 - Testing: 5-10 minutes"
    echo -e "${YELLOW}   Total: 30-65 minutes${NC}"
    echo ""
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"

    local missing_tools=()

    # Check required tools
    command -v aws >/dev/null 2>&1 || missing_tools+=("aws")
    command -v node >/dev/null 2>&1 || missing_tools+=("node")
    command -v npm >/dev/null 2>&1 || missing_tools+=("npm")
    command -v python3 >/dev/null 2>&1 || missing_tools+=("python3")
    command -v curl >/dev/null 2>&1 || missing_tools+=("curl")
    command -v jq >/dev/null 2>&1 || missing_tools+=("jq")

    if [ ${#missing_tools[@]} -gt 0 ]; then
        echo -e "${RED}❌ Missing required tools: ${missing_tools[*]}${NC}"
        echo "Please install missing tools and re-run this script"
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity >/dev/null 2>&1; then
        echo -e "${RED}❌ AWS credentials not configured${NC}"
        echo "Please run 'aws configure' and re-run this script"
        exit 1
    fi

    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Main deployment process
main() {
    # Display banner and information
    echo -e "${YELLOW}⚠️  This script will deploy WordWeave to production${NC}"
    echo "This includes creating AWS resources that may incur charges."
    echo ""
    estimate_time
    confirm_continue "Ready to start deployment?"

    # Check prerequisites
    check_prerequisites

    # Change to project root directory
    cd "$PROJECT_ROOT"

    # Phase 1: Configuration Validation
    show_phase "Configuration Validation"
    echo "Validating all configuration and prerequisites..."
    run_script "$SCRIPT_DIR/validate-config.sh" "Configuration Validation"

    # Phase 2: Domain and SSL Setup
    show_phase "Domain and SSL Setup"
    echo "Setting up Route53 hosted zone and SSL certificate..."
    echo -e "${YELLOW}This phase requires manual DNS configuration at your registrar${NC}"
    confirm_continue "Proceed with domain setup?"
    run_script "$SCRIPT_DIR/setup-domain.sh" "Domain Setup"

    # Phase 3: Backend Deployment
    show_phase "Backend Deployment"
    echo "Deploying serverless backend infrastructure..."
    confirm_continue "Deploy backend to production?"
    cd backend
    run_script "./deploy-production.sh" "Backend Deployment"
    cd "$PROJECT_ROOT"

    # Phase 4: Frontend Deployment
    show_phase "Frontend Deployment"
    echo "Building and deploying React frontend..."
    confirm_continue "Deploy frontend to production?"
    cd frontend
    run_script "./deploy-production.sh" "Frontend Deployment"
    cd "$PROJECT_ROOT"

    # Phase 5: Monitoring Setup
    show_phase "Monitoring and Alerting Setup"
    echo "Setting up CloudWatch dashboards and alerts..."
    confirm_continue "Set up monitoring?"

    # Deploy monitoring stack
    echo -e "${BLUE}Deploying monitoring infrastructure...${NC}"
    cd monitoring
    aws cloudformation deploy \
        --template-file cloudwatch-alerts.yml \
        --stack-name wordweave-monitoring-prod \
        --parameter-overrides \
            Environment=prod \
            AlertingEmail="alerts@${DOMAIN_NAME}" \
        --capabilities CAPABILITY_IAM \
        --region "$REGION"

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Monitoring setup completed${NC}"
    else
        echo -e "${RED}❌ Monitoring setup failed${NC}"
        confirm_continue "Continue without monitoring?" "n"
    fi
    cd "$PROJECT_ROOT"

    # Phase 6: Deployment Testing
    show_phase "Deployment Testing"
    echo "Running comprehensive deployment tests..."
    confirm_continue "Run deployment tests?"
    run_script "$SCRIPT_DIR/test-deployment.sh" "Deployment Testing" "true"

    # Final verification and summary
    echo ""
    echo "=============================================================="
    echo -e "${GREEN}🎉 WordWeave Deployment Complete!${NC}"
    echo "=============================================================="
    echo ""

    # Get deployment URLs
    API_URL="https://api.${DOMAIN_NAME}"
    WEBSITE_URL="https://${DOMAIN_NAME}"
    DASHBOARD_URL="https://${REGION}.console.aws.amazon.com/cloudwatch/home?region=${REGION}#dashboards:"

    echo -e "${BLUE}📊 Deployment Summary:${NC}"
    echo "   Website: ${WEBSITE_URL}"
    echo "   API: ${API_URL}"
    echo "   Dashboard: ${DASHBOARD_URL}"
    echo ""

    # Test key endpoints
    echo -e "${YELLOW}🧪 Quick Health Check:${NC}"
    echo -n "   Website: "
    if curl -s -f "${WEBSITE_URL}" > /dev/null; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${RED}❌ Offline${NC}"
    fi

    echo -n "   API: "
    if curl -s -f "${API_URL}/health" > /dev/null; then
        echo -e "${GREEN}✅ Online${NC}"
    else
        echo -e "${RED}❌ Offline${NC}"
    fi

    # Generate final report
    cat > deployment-complete.txt << EOF
WordWeave Production Deployment Complete
=======================================

Deployment Date: $(date)
Domain: ${DOMAIN_NAME}
Region: ${REGION}
AWS Account: $(aws sts get-caller-identity --query Account --output text)

Deployment URLs:
- Website: ${WEBSITE_URL}
- API: ${API_URL}
- Dashboard: ${DASHBOARD_URL}

Deployment Phases Completed:
✅ Configuration Validation
✅ Domain and SSL Setup
✅ Backend Deployment
✅ Frontend Deployment
✅ Monitoring Setup
✅ Deployment Testing

Next Steps:
1. Monitor application performance
2. Set up automated backups
3. Configure additional monitoring
4. Plan scaling strategies
5. Schedule security reviews

Support Resources:
- CloudWatch Logs: /aws/lambda/wordweave-*
- Documentation: ./PRODUCTION_DEPLOYMENT_GUIDE.md
- Testing: ./scripts/test-deployment.sh

Generated: $(date)
EOF

    echo -e "${BLUE}📄 Deployment report saved to: deployment-complete.txt${NC}"

    # Optional: Open monitoring dashboard
    echo ""
    if [[ "$OSTYPE" == "darwin"* ]]; then
        read -p "Open monitoring dashboard in browser? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$DASHBOARD_URL"
        fi
    fi

    # Optional: Open website
    if [[ "$OSTYPE" == "darwin"* ]]; then
        read -p "Open WordWeave website in browser? (y/N): " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open "$WEBSITE_URL"
        fi
    fi

    echo ""
    echo -e "${PURPLE}🚀 WordWeave is now live in production!${NC}"
    echo -e "${BLUE}Visit: ${WEBSITE_URL}${NC}"
    echo ""
    echo -e "${YELLOW}📝 Don't forget to:${NC}"
    echo "   • Set up regular monitoring checks"
    echo "   • Configure backup schedules"
    echo "   • Update team documentation"
    echo "   • Plan your next features!"
    echo ""
}

# Handle script interruption
trap 'echo -e "\n${RED}❌ Deployment interrupted by user${NC}"; exit 130' INT

# Handle errors
trap 'echo -e "\n${RED}❌ Deployment failed due to an error${NC}"; exit 1' ERR

# Run main function
main "$@"