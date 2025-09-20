#!/bin/bash
# Build script for macOS - MOTOSNAP Frontend Deployment
# Usage: ./build-macos.sh [options]
# Options:
#   --frontend-only    Only build frontend, skip backend compilation
#   --full-build       Build both frontend and backend (default)
#   --help             Show this help message

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default build mode
BUILD_MODE="full"

# Parse command line arguments
for arg in "$@"; do
    case $arg in
        --frontend-only)
            BUILD_MODE="frontend-only"
            shift
            ;;
        --full-build)
            BUILD_MODE="full"
            shift
            ;;
        --help)
            echo "Usage: $0 [options]"
            echo "Options:"
            echo "  --frontend-only    Only build frontend, skip backend compilation"
            echo "  --full-build       Build both frontend and backend (default)"
            echo "  --help             Show this help message"
            exit 0
            ;;
        *)
            # Unknown option
            ;;
    esac
done

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

echo -e "${BLUE}=====================================================${NC}"
echo -e "${BLUE}    MOTOSNAP macOS Build Script - Build Mode: $BUILD_MODE${NC}"
echo -e "${BLUE}=====================================================${NC}"

# Check if we're in the correct directory
if [ ! -d "motosnap-client" ] || [ ! -d "workshop" ]; then
    print_error "This script must be run from the MOTOSNAP root directory"
    echo "Expected directories: motosnap-client/ and workshop/"
    exit 1
fi

# Step 1: Build Frontend
print_status "Building Next.js frontend..."
cd motosnap-client

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

# Build the frontend
print_status "Running Next.js build..."
if npm run build; then
    print_success "Frontend build completed successfully"
else
    print_error "Frontend build failed"
    exit 1
fi

# Check if build output exists
if [ ! -d "out" ]; then
    print_error "Frontend build output directory 'out' not found"
    exit 1
fi

# Step 2: Copy to Backend Static Resources
print_status "Copying frontend build to backend..."
cd ..

# Clean existing static directory
if [ -d "workshop/src/main/resources/static" ]; then
    print_status "Cleaning existing static directory..."
    rm -rf workshop/src/main/resources/static/*
else
    print_status "Creating static directory..."
    mkdir -p workshop/src/main/resources/static
fi

# Copy build files
print_status "Copying build files..."
cp -r motosnap-client/out/* workshop/src/main/resources/static/

# Verify copy was successful
if [ -d "workshop/src/main/resources/static/staff" ]; then
    print_success "Frontend files copied successfully to backend"
else
    print_error "Failed to copy frontend files to backend"
    exit 1
fi

# Step 3: Build Backend (if not frontend-only)
if [ "$BUILD_MODE" = "full" ]; then
    print_status "Building Spring Boot backend..."
    cd workshop

    # Make Maven wrapper executable
    chmod +x mvnw

    # Set JAVA_HOME for macOS
    if [ -z "$JAVA_HOME" ]; then
        export JAVA_HOME=$(/usr/libexec/java_home)
        print_status "Set JAVA_HOME to: $JAVA_HOME"
    fi

    # Verify Java installation
    if ! command -v java &> /dev/null; then
        print_error "Java is not installed or not in PATH"
        exit 1
    fi

    # Build the backend
    print_status "Running Maven build..."
    if ./mvnw clean package -DskipTests; then
        print_success "Backend build completed successfully"
    else
        print_error "Backend build failed"
        exit 1
    fi

    cd ..
fi

# Final verification
print_status "Verifying build..."
if [ -f "workshop/src/main/resources/static/staff/register/admin/index.html" ]; then
    print_success "Admin registration page found in build output"
else
    print_warning "Admin registration page not found in expected location"
fi

echo -e "${BLUE}=====================================================${NC}"
echo -e "${GREEN}            BUILD COMPLETED SUCCESSFULLY!${NC}"
echo -e "${BLUE}=====================================================${NC}"

if [ "$BUILD_MODE" = "full" ]; then
    echo "To run the application:"
    echo "  cd workshop"
    echo "  ./mvnw spring-boot:run"
    echo ""
    echo "Then access: http://localhost:8080/staff/admin/register"
else
    echo "Frontend-only build completed."
    echo "To run the backend separately:"
    echo "  cd workshop"
    echo "  ./mvnw spring-boot:run"
    echo ""
    echo "Then access: http://localhost:8080/staff/admin/register"
fi

echo ""
print_success "Build script completed!"
exit 0