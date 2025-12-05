#!/bin/bash

# Deployment Validation Script
# This script validates that all required configuration is in place before deployment

set -e

ENVIRONMENT=${1:-dev}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "🔍 Validating deployment configuration for environment: $ENVIRONMENT"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track validation status
VALIDATION_PASSED=true

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print success message
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print error message
print_error() {
    echo -e "${RED}✗${NC} $1"
    VALIDATION_PASSED=false
}

# Function to print warning message
print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    print_success "Node.js installed: $NODE_VERSION"
    
    # Check if version is 20.x or higher
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
    if [ "$MAJOR_VERSION" -lt 20 ]; then
        print_error "Node.js version must be 20.x or higher"
    fi
else
    print_error "Node.js is not installed"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm is not installed"
fi

# Check AWS CLI
if command_exists aws; then
    AWS_VERSION=$(aws --version)
    print_success "AWS CLI installed: $AWS_VERSION"
else
    print_warning "AWS CLI is not installed (optional for local development)"
fi

# Check CDK CLI
if command_exists cdk; then
    CDK_VERSION=$(cdk --version)
    print_success "AWS CDK installed: $CDK_VERSION"
else
    print_error "AWS CDK is not installed. Install with: npm install -g aws-cdk"
fi

echo ""
echo "📦 Checking project dependencies..."
echo ""

# Check if node_modules exists
if [ -d "$PROJECT_ROOT/node_modules" ]; then
    print_success "Dependencies installed"
else
    print_error "Dependencies not installed. Run: npm install"
fi

# Check if package-lock.json exists
if [ -f "$PROJECT_ROOT/package-lock.json" ]; then
    print_success "package-lock.json exists"
else
    print_warning "package-lock.json not found. Run: npm install"
fi

echo ""
echo "🔧 Checking build artifacts..."
echo ""

# Check if TypeScript is compiled
if [ -d "$PROJECT_ROOT/dist" ]; then
    print_success "TypeScript compiled"
else
    print_warning "TypeScript not compiled. Run: npm run build"
fi

echo ""
echo "☁️  Checking AWS configuration..."
echo ""

# Check AWS credentials
if [ -n "$AWS_ACCESS_KEY_ID" ] && [ -n "$AWS_SECRET_ACCESS_KEY" ]; then
    print_success "AWS credentials found in environment variables"
elif [ -f "$HOME/.aws/credentials" ]; then
    print_success "AWS credentials file exists"
else
    print_warning "AWS credentials not configured. Set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY"
fi

# Check AWS region
if [ -n "$AWS_REGION" ]; then
    print_success "AWS region set: $AWS_REGION"
elif [ -n "$CDK_DEFAULT_REGION" ]; then
    print_success "CDK default region set: $CDK_DEFAULT_REGION"
else
    print_warning "AWS region not set. Will default to us-east-1"
fi

# Check AWS account
if [ -n "$CDK_DEFAULT_ACCOUNT" ]; then
    print_success "AWS account ID set: $CDK_DEFAULT_ACCOUNT"
else
    print_warning "AWS account ID not set in CDK_DEFAULT_ACCOUNT"
fi

echo ""
echo "🧪 Checking tests..."
echo ""

# Check if tests pass
cd "$PROJECT_ROOT"
if npm test -- --passWithNoTests > /dev/null 2>&1; then
    print_success "All tests pass"
else
    print_error "Tests are failing. Run: npm test"
fi

echo ""
echo "🔐 Checking environment-specific configuration..."
echo ""

case $ENVIRONMENT in
    dev|development)
        print_success "Environment: Development"
        print_warning "This will deploy to the development environment"
        ;;
    staging|stage)
        print_success "Environment: Staging"
        print_warning "This will deploy to the staging environment"
        if [ "$ENVIRONMENT" = "staging" ] || [ "$ENVIRONMENT" = "stage" ]; then
            print_warning "Ensure you have approval to deploy to staging"
        fi
        ;;
    prod|production)
        print_success "Environment: Production"
        print_error "⚠️  WARNING: This will deploy to PRODUCTION!"
        print_warning "Ensure you have:"
        print_warning "  - Tested in staging"
        print_warning "  - Obtained necessary approvals"
        print_warning "  - Reviewed the deployment diff"
        print_warning "  - Prepared rollback plan"
        ;;
    *)
        print_error "Unknown environment: $ENVIRONMENT"
        print_error "Valid environments: dev, staging, prod"
        ;;
esac

echo ""
echo "📊 Summary"
echo ""

if [ "$VALIDATION_PASSED" = true ]; then
    echo -e "${GREEN}✓ All validation checks passed!${NC}"
    echo ""
    echo "Ready to deploy. Run:"
    echo "  npm run deploy:$ENVIRONMENT"
    echo ""
    echo "Or to see what will change:"
    echo "  cdk diff --context environment=$ENVIRONMENT"
    exit 0
else
    echo -e "${RED}✗ Validation failed. Please fix the errors above.${NC}"
    exit 1
fi
