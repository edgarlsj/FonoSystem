#!/bin/bash
set -e

echo "Building FonoSystem for Render..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build
echo "Frontend built successfully"

# Copy frontend to backend static resources
echo "Copying frontend to backend static resources..."
rm -rf ../backend/src/main/resources/static
mkdir -p ../backend/src/main/resources/static
cp -r dist/* ../backend/src/main/resources/static/

# Build backend
echo "Building backend..."
cd ../backend
mvn clean package -DskipTests
echo "Backend built successfully"

echo "Build completed! JAR ready at backend/target/fonosystem-backend-1.0.0.jar"
