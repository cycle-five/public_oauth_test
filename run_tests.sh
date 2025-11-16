#!/bin/bash
# OAuth Testing Script
# This script provides easy commands for running different types of tests

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Print colored message
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f ".env" ]; then
        print_error ".env file not found!"
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and add your Google credentials"
        exit 1
    fi
}

# Check if virtual environment is activated
check_venv() {
    if [ -z "$VIRTUAL_ENV" ]; then
        print_warning "Virtual environment not activated"
        print_info "Consider running: source venv/bin/activate"
    fi
}

# Install dependencies
install_deps() {
    print_info "Installing dependencies..."
    pip install -r requirements.txt
    print_info "Installing Playwright browsers..."
    playwright install chromium
    print_info "Dependencies installed successfully!"
}

# Run unit tests
run_unit_tests() {
    print_info "Running unit tests..."
    pytest test_oauth_automated.py::TestCredentials -v
    pytest test_oauth_automated.py::TestGoogleButtonDetection -v
    print_info "Unit tests completed!"
}

# Run tests in headless mode
run_headless() {
    print_info "Running tests in headless mode..."
    HEADLESS=true pytest test_oauth_automated.py -v
    print_info "Headless tests completed!"
}

# Run tests with visible browser
run_headed() {
    print_info "Running tests with visible browser..."
    HEADLESS=false pytest test_oauth_automated.py -v
    print_info "Tests completed!"
}

# Run OAuth integration tests
run_oauth_tests() {
    print_warning "Running OAuth integration tests (clicks Google button)..."
    RUN_OAUTH_TESTS=true HEADLESS=false pytest test_oauth_automated.py::TestOAuthFlow::test_oauth_login_basic -v
    print_info "OAuth tests completed!"
}

# Run full OAuth tests
run_full_oauth() {
    print_warning "Running FULL OAuth tests (performs complete login)..."
    print_warning "This may trigger rate limits - use sparingly!"
    read -p "Are you sure you want to continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        RUN_FULL_OAUTH_TESTS=true HEADLESS=false pytest test_oauth_automated.py::TestOAuthFlow::test_oauth_login_complete -v
        print_info "Full OAuth tests completed!"
    else
        print_info "Cancelled."
    fi
}

# Run 2FA tests
run_2fa_tests() {
    print_warning "Running 2FA tests (requires manual interaction)..."
    print_info "You will need to manually enter your 2FA code or press your security key"
    read -p "Continue? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        RUN_2FA_TESTS=true HEADLESS=false pytest test_oauth_automated.py::Test2FAFlow -v
        print_info "2FA tests completed!"
    else
        print_info "Cancelled."
    fi
}

# Run manual test script
run_manual() {
    print_info "Running manual test script..."
    python test_google_oauth.py --url "${1:-https://public-oauth-test.netlify.app/}"
}

# Run with coverage
run_coverage() {
    print_info "Running tests with coverage..."
    pytest test_oauth_automated.py --cov=. --cov-report=html --cov-report=term -v
    print_info "Coverage report generated in htmlcov/"
}

# Show usage
show_usage() {
    cat << EOF
${GREEN}OAuth Testing Script${NC}

Usage: $0 [command]

Commands:
  ${GREEN}install${NC}       Install dependencies and Playwright browsers
  ${GREEN}unit${NC}          Run unit tests only (fast, no browser automation)
  ${GREEN}headless${NC}      Run all tests in headless mode (default)
  ${GREEN}headed${NC}        Run tests with visible browser
  ${GREEN}oauth${NC}         Run OAuth integration tests (clicks button, no login)
  ${GREEN}full${NC}          Run FULL OAuth tests (complete login - use sparingly!)
  ${GREEN}2fa${NC}           Run 2FA tests (requires manual interaction)
  ${GREEN}manual${NC}        Run manual test script with visible browser
  ${GREEN}coverage${NC}      Run tests with coverage report
  ${GREEN}help${NC}          Show this help message

Examples:
  $0 install          # Install all dependencies
  $0 unit            # Run unit tests
  $0 headless        # Run all tests in headless mode
  $0 manual          # Run manual test with default URL
  $0 coverage        # Generate coverage report

Environment Variables:
  HEADLESS           Run in headless mode (true/false)
  TEST_URL           URL to test against
  GOOGLE_EMAIL       Your Google account email (from .env)
  GOOGLE_PASSWORD    Your Google account password (from .env)

For more information, see TESTING.md
EOF
}

# Main script
main() {
    check_venv

    case "${1:-help}" in
        install)
            install_deps
            ;;
        unit)
            check_env_file
            run_unit_tests
            ;;
        headless)
            check_env_file
            run_headless
            ;;
        headed)
            check_env_file
            run_headed
            ;;
        oauth)
            check_env_file
            run_oauth_tests
            ;;
        full)
            check_env_file
            run_full_oauth
            ;;
        2fa)
            check_env_file
            run_2fa_tests
            ;;
        manual)
            check_env_file
            run_manual "$2"
            ;;
        coverage)
            check_env_file
            run_coverage
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $1"
            echo
            show_usage
            exit 1
            ;;
    esac
}

main "$@"
