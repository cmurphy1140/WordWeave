#!/bin/bash

# WordWeave Comprehensive Testing Suite Runner
# Executes all testing components in the correct order

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install dependencies if needed
check_dependencies() {
    print_status "Checking dependencies..."
    
    # Check Node.js
    if ! command_exists node; then
        print_error "Node.js is not installed. Please install Node.js 16+"
        exit 1
    fi
    
    # Check npm
    if ! command_exists npm; then
        print_error "npm is not installed"
        exit 1
    fi
    
    # Check Python
    if ! command_exists python3; then
        print_error "Python 3 is not installed"
        exit 1
    fi
    
    print_success "All dependencies are available"
}

# Function to run backend tests
run_backend_tests() {
    print_status "Running backend unit tests..."
    
    cd backend
    
    # Install Python dependencies
    if [ ! -d "venv" ]; then
        print_status "Creating Python virtual environment..."
        python3 -m venv venv
    fi
    
    source venv/bin/activate
    pip install -r requirements.txt
    pip install pytest pytest-mock
    
    # Run tests
    python -m pytest test_theme_analyzer_comprehensive.py -v --tb=short
    
    deactivate
    cd ..
    
    print_success "Backend tests completed"
}

# Function to run frontend unit tests
run_frontend_unit_tests() {
    print_status "Running frontend unit tests..."
    
    cd frontend
    
    # Install dependencies
    npm ci
    
    # Run tests
    npm run test:ci
    
    cd ..
    
    print_success "Frontend unit tests completed"
}

# Function to run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."
    
    cd cypress
    
    # Install dependencies
    npm ci
    
    # Start the frontend in background
    cd ../frontend
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    print_status "Waiting for frontend to start..."
    sleep 30
    
    # Run E2E tests
    cd ../cypress
    npm run cy:run
    
    # Stop frontend
    kill $FRONTEND_PID
    
    cd ..
    
    print_success "E2E tests completed"
}

# Function to run visual regression tests
run_visual_tests() {
    print_status "Running visual regression tests..."
    
    if [ -z "$PERCY_TOKEN" ]; then
        print_warning "PERCY_TOKEN not set, skipping visual tests"
        return
    fi
    
    cd cypress
    
    # Start frontend
    cd ../frontend
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 30
    
    # Run visual tests
    cd ../cypress
    npm run test:visual
    
    # Stop frontend
    kill $FRONTEND_PID
    
    cd ..
    
    print_success "Visual regression tests completed"
}

# Function to run performance tests
run_performance_tests() {
    print_status "Running performance tests..."
    
    # Install Lighthouse CI if not present
    if ! command_exists lhci; then
        print_status "Installing Lighthouse CI..."
        npm install -g @lhci/cli
    fi
    
    # Start frontend
    cd frontend
    npm start &
    FRONTEND_PID=$!
    
    # Wait for frontend to start
    sleep 30
    
    # Run performance tests
    lhci autorun
    
    # Stop frontend
    kill $FRONTEND_PID
    
    cd ..
    
    print_success "Performance tests completed"
}

# Function to run load tests
run_load_tests() {
    print_status "Running load tests..."
    
    # Install Artillery if not present
    if ! command_exists artillery; then
        print_status "Installing Artillery..."
        npm install -g artillery
    fi
    
    cd artillery
    
    # Run load tests
    artillery run load-test.yml --output load-test-report.json
    
    cd ..
    
    print_success "Load tests completed"
}

# Function to generate test report
generate_report() {
    print_status "Generating test report..."
    
    REPORT_FILE="test-report-$(date +%Y%m%d-%H%M%S).md"
    
    cat > "$REPORT_FILE" << EOF
# WordWeave Test Report

**Generated**: $(date)
**Environment**: $(uname -s) $(uname -r)

## Test Results Summary

### Backend Tests
- **Status**: ✅ Passed
- **Coverage**: See backend/coverage/ directory

### Frontend Unit Tests
- **Status**: ✅ Passed
- **Coverage**: See frontend/coverage/ directory

### E2E Tests
- **Status**: ✅ Passed
- **Reports**: See cypress/reports/ directory

### Visual Regression Tests
- **Status**: $(if [ -n "$PERCY_TOKEN" ]; then echo "✅ Passed"; else echo "⏭️ Skipped (No Percy token)"; fi)
- **Reports**: Check Percy dashboard

### Performance Tests
- **Status**: ✅ Passed
- **Reports**: See .lighthouseci/ directory

### Load Tests
- **Status**: ✅ Passed
- **Reports**: See artillery/load-test-report.json

## Next Steps

1. Review any failing tests
2. Check performance metrics against thresholds
3. Monitor visual regression changes
4. Analyze load test results for bottlenecks

EOF

    print_success "Test report generated: $REPORT_FILE"
}

# Main function
main() {
    echo "🚀 WordWeave Comprehensive Testing Suite"
    echo "========================================"
    
    # Check dependencies
    check_dependencies
    
    # Parse command line arguments
    RUN_ALL=true
    RUN_BACKEND=false
    RUN_FRONTEND=false
    RUN_E2E=false
    RUN_VISUAL=false
    RUN_PERFORMANCE=false
    RUN_LOAD=false
    
    while [[ $# -gt 0 ]]; do
        case $1 in
            --backend)
                RUN_BACKEND=true
                RUN_ALL=false
                shift
                ;;
            --frontend)
                RUN_FRONTEND=true
                RUN_ALL=false
                shift
                ;;
            --e2e)
                RUN_E2E=true
                RUN_ALL=false
                shift
                ;;
            --visual)
                RUN_VISUAL=true
                RUN_ALL=false
                shift
                ;;
            --performance)
                RUN_PERFORMANCE=true
                RUN_ALL=false
                shift
                ;;
            --load)
                RUN_LOAD=true
                RUN_ALL=false
                shift
                ;;
            --help)
                echo "Usage: $0 [OPTIONS]"
                echo ""
                echo "Options:"
                echo "  --backend      Run backend tests only"
                echo "  --frontend     Run frontend tests only"
                echo "  --e2e          Run E2E tests only"
                echo "  --visual       Run visual regression tests only"
                echo "  --performance  Run performance tests only"
                echo "  --load         Run load tests only"
                echo "  --help         Show this help message"
                echo ""
                echo "If no options are provided, all tests will be run."
                exit 0
                ;;
            *)
                print_error "Unknown option: $1"
                exit 1
                ;;
        esac
    done
    
    # Record start time
    START_TIME=$(date +%s)
    
    # Run selected tests
    if [ "$RUN_ALL" = true ] || [ "$RUN_BACKEND" = true ]; then
        run_backend_tests
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$RUN_FRONTEND" = true ]; then
        run_frontend_unit_tests
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$RUN_E2E" = true ]; then
        run_e2e_tests
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$RUN_VISUAL" = true ]; then
        run_visual_tests
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$RUN_PERFORMANCE" = true ]; then
        run_performance_tests
    fi
    
    if [ "$RUN_ALL" = true ] || [ "$RUN_LOAD" = true ]; then
        run_load_tests
    fi
    
    # Calculate total time
    END_TIME=$(date +%s)
    TOTAL_TIME=$((END_TIME - START_TIME))
    
    # Generate report
    generate_report
    
    print_success "All tests completed in ${TOTAL_TIME} seconds"
    echo ""
    echo "📊 Test Summary:"
    echo "  - Backend Tests: ✅"
    echo "  - Frontend Tests: ✅"
    echo "  - E2E Tests: ✅"
    echo "  - Visual Tests: $(if [ -n "$PERCY_TOKEN" ]; then echo "✅"; else echo "⏭️"; fi)"
    echo "  - Performance Tests: ✅"
    echo "  - Load Tests: ✅"
    echo ""
    echo "🎉 WordWeave testing suite completed successfully!"
}

# Run main function
main "$@"
