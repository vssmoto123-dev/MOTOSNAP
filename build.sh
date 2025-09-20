#!/bin/bash
# Build script for backend-only deployment on Render.com

echo "Building MOTOSNAP backend..."

cd workshop
echo "Building backend..."
chmod +x mvnw

# Set JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# Build with explicit Java version
./mvnw clean package -DskipTests -Djava.version=17

echo "Backend build completed successfully!"