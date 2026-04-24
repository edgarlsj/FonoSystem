# Stage 1: Build frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend .
RUN npm run build

# Stage 2: Build backend
FROM maven:3.8.1-openjdk-17-slim AS backend-builder
WORKDIR /app
COPY backend ./backend
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
# Copy frontend dist to backend static resources
RUN mkdir -p backend/src/main/resources/static && \
    cp -r frontend/dist/* backend/src/main/resources/static/
# Build backend
WORKDIR /app/backend
RUN mvn clean package -DskipTests -q

# Stage 3: Runtime
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-builder /app/backend/target/*.jar app.jar
EXPOSE 3000
ENTRYPOINT ["java", "-Dserver.port=3000", "-jar", "app.jar"]
