#!/bin/bash
# Build script for Render.com deployment

echo "Building MOTOSNAP for production..."

# Build frontend
cd motosnap-client
echo "Installing frontend dependencies..."
npm ci --production=false
echo "Building frontend..."
npm run build

# Copy built frontend to backend static resources
echo "Copying frontend build to backend..."
rm -rf ../workshop/src/main/resources/static/*
cp -r out/* ../workshop/src/main/resources/static/

cd ../workshop
echo "Building backend..."
chmod +x mvnw

# Set JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# Build with explicit Java version
./mvnw clean package -DskipTests -Djava.version=17

echo "Build completed successfully!"