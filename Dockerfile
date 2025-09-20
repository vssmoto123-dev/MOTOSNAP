# Single-stage build for MOTOSNAP Backend (Spring Boot with Maven)
FROM eclipse-temurin:17-jdk AS backend-builder

WORKDIR /app

# Copy Maven wrapper and pom.xml first for dependency caching
COPY workshop/mvnw workshop/mvnw.cmd workshop/pom.xml ./
COPY workshop/.mvn ./.mvn

# Make Maven wrapper executable and verify directory structure
RUN chmod +x mvnw && ls -la mvnw && ls -la .mvn/wrapper/

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy backend source
COPY workshop/src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Runtime (JRE for production)
FROM eclipse-temurin:17-jre-alpine AS runtime

# Create app user for security
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

# Set working directory
WORKDIR /app

# Create uploads directory
RUN mkdir -p uploads && chown appuser:appgroup uploads

# Copy JAR from builder stage
COPY --from=backend-builder /app/target/workshop-*.jar app.jar

# Change ownership to app user
RUN chown appuser:appgroup app.jar

# Switch to non-root user
USER appuser

# Expose port (Render will set $PORT)
EXPOSE 8080

# Environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8080}/actuator/health || exit 1

# Start command
CMD java $JAVA_OPTS -Dserver.port=${PORT:-8080} -jar app.jar