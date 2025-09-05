#!/bin/bash
# Pre-deployment verification script for MOTOSNAP

echo "🔍 MOTOSNAP Pre-Deployment Verification"
echo "======================================="

# Check if git repository is clean
echo "📋 Checking git status..."
if [[ -n $(git status --porcelain) ]]; then
    echo "❌ Git repository has uncommitted changes. Please commit and push first."
    git status
    exit 1
else
    echo "✅ Git repository is clean"
fi

# Check if we're on the right branch
BRANCH=$(git branch --show-current)
echo "📋 Current branch: $BRANCH"

# Check if essential files exist
echo "📋 Checking essential files..."
FILES=("build.sh" "render.yaml" "README.md" "workshop/pom.xml" "motosnap-client/package.json")

for file in "${FILES[@]}"; do
    if [[ -f "$file" ]]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check if build.sh is executable
if [[ -x "build.sh" ]]; then
    echo "✅ build.sh is executable"
else
    echo "⚠️  Making build.sh executable..."
    chmod +x build.sh
fi

# Test frontend build
echo "📋 Testing frontend build..."
cd motosnap-client
if npm ci --silent; then
    echo "✅ Frontend dependencies installed"
else
    echo "❌ Frontend dependency installation failed"
    exit 1
fi

if npm run build > /dev/null 2>&1; then
    echo "✅ Frontend build successful"
else
    echo "❌ Frontend build failed"
    exit 1
fi

cd ..

# Test backend build
echo "📋 Testing backend build..."
cd workshop
if ./mvnw clean package -DskipTests -q; then
    echo "✅ Backend build successful"
else
    echo "❌ Backend build failed"
    exit 1
fi

cd ..

# Check JAR file exists
JAR_FILE=$(find workshop/target -name "workshop-*.jar" -type f | head -1)
if [[ -f "$JAR_FILE" ]]; then
    echo "✅ JAR file created: $(basename $JAR_FILE)"
else
    echo "❌ JAR file not found"
    exit 1
fi

echo ""
echo "🎉 All checks passed! Your project is ready for Render.com deployment."
echo ""
echo "📝 Next steps:"
echo "1. Commit and push any remaining changes"
echo "2. Go to https://render.com"
echo "3. Follow the RENDER_DEPLOYMENT_GUIDE.md"
echo ""
echo "📊 Project size: $(du -sh . --exclude=.git --exclude=node_modules --exclude=target | cut -f1)"