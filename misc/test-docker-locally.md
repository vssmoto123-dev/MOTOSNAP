# 🧪 Local Docker Testing Commands

## Prerequisites
- Docker Desktop installed and running
- Navigate to project root directory

## Test Commands

### **1. Build Docker Image**
```bash
docker build -t motosnap-test .
```

**Expected Output:**
```
[+] Building 45.2s (23/23) FINISHED
 => [frontend-builder 1/6] FROM node:18-alpine
 => [backend-builder 1/8] FROM eclipse-temurin:17-jdk  
 => [runtime 1/5] FROM eclipse-temurin:17-jre-alpine
 => => naming to docker.io/library/motosnap-test
```

### **2. Run Container Locally**
```bash
docker run -p 8080:8080 -e PORT=8080 motosnap-test
```

**Expected Output:**
```
  .   ____          _            __ _ _
 /\\ / ___'_ __ _ _(_)_ __  __ _ \ \ \ \
( ( )\___ | '_ | '_| | '_ \/ _` | \ \ \ \
 \\/  ___)| |_)| | | | | || (_| |  ) ) ) )
  '  |____| .__|_| |_|_| |_\__, | / / / /
 =========|_|==============|___/=/_/_/_/
 :: Spring Boot ::               (v3.5.5)

INFO: Started WorkshopApplication in 2.847 seconds
```

### **3. Test Health Check**
```bash
curl http://localhost:8080/actuator/health
```

**Expected Response:**
```json
{"status":"UP"}
```

### **4. Test Frontend**
Open browser: `http://localhost:8080`

### **5. Stop Container**
```bash
docker ps
docker stop <container_id>
```

## Troubleshooting

### **If Build Fails:**
- Check Dockerfile syntax
- Ensure all files exist
- Review .dockerignore exclusions

### **If Container Won't Start:**
- Check port conflicts: `docker ps -a`
- View logs: `docker logs <container_id>`
- Check environment variables

### **Memory Issues:**
- Reduce JAVA_OPTS if needed
- Monitor usage: `docker stats`

## Quick Validation
Run this script to test everything:
```bash
#!/bin/bash
echo "Building Docker image..."
docker build -t motosnap-test . || exit 1

echo "Starting container..."
docker run -d -p 8080:8080 -e PORT=8080 --name motosnap-test motosnap-test

echo "Waiting for startup..."
sleep 30

echo "Testing health check..."
curl -f http://localhost:8080/actuator/health || echo "Health check failed"

echo "Cleaning up..."
docker stop motosnap-test
docker rm motosnap-test
docker rmi motosnap-test

echo "Local test complete!"
```