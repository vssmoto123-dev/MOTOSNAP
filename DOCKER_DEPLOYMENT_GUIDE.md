# 🐳 MOTOSNAP Docker Deployment Guide for Render.com

## 🎯 **Why Docker is Required**

**Critical Discovery**: Render.com does NOT support Java natively. Docker is the ONLY way to deploy Java applications on Render.

- ❌ **Java Runtime**: Causes JAVA_HOME issues, Maven wrapper failures
- ✅ **Docker Runtime**: Full control over Java environment, proper JDK/JRE setup

## 📁 **What We Created**

### **1. Multi-Stage Dockerfile**

```dockerfile
Stage 1: Frontend Builder (Node.js) → Builds Next.js app
Stage 2: Backend Builder (JDK + Maven) → Builds Spring Boot JAR  
Stage 3: Runtime (JRE) → Runs the application
```

### **2. Updated Configuration**

- **render.yaml**: Changed to `runtime: docker`
- **.dockerignore**: Optimizes build context
- **Environment**: H2 database for production

## 🚀 **Deployment Steps**

### **Step 1: Commit Docker Changes**

```bash
git add Dockerfile .dockerignore render.yaml
git commit -m "Switch to Docker deployment for Render"
git push origin main
```

### **Step 2: Update Render Service**

#### **Option A: Create New Service (Recommended)**

1. Go to Render Dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your repository
4. **Runtime**: Will auto-detect Docker
5. **Service Name**: `motosnap-docker`
6. Click **"Create Web Service"**

#### **Option B: Update Existing Service**

1. Go to existing service settings
2. **Runtime**: Change to "Docker"
3. **Build Command**: Remove (Docker handles this)
4. **Start Command**: Remove (defined in Dockerfile)
5. **Save Changes** → **Manual Deploy**

### **Step 3: Monitor Docker Build**

Expected build process:

```
✅ Building Docker image...
✅ [Stage 1] Building frontend with Node.js
✅ [Stage 2] Building backend with Maven + JDK
✅ [Stage 3] Creating runtime image with JRE
✅ Image built successfully
✅ Container starting on port $PORT
```

## 🔧 **Docker Build Process Explained**

### **Stage 1: Frontend (Node.js 18)**

- Installs npm dependencies
- Builds Next.js application
- Creates optimized static files

### **Stage 2: Backend (Eclipse Temurin JDK 17)**

- Downloads Maven dependencies (cached layer)
- Copies built frontend to static resources
- Compiles and packages Spring Boot JAR
- **Solves**: JAVA_HOME issues, Maven wrapper problems

### **Stage 3: Runtime (Eclipse Temurin JRE 17)**

- Lightweight Alpine Linux base
- Only includes JRE (smaller image)
- Non-root user for security
- Proper environment setup

## 📊 **Environment Variables**

Docker deployment uses the same environment variables:

```yaml
SPRING_PROFILES_ACTIVE: prod
UPLOAD_DIR: /app/uploads
JWT_SECRET: (auto-generated)
SPRING_DATASOURCE_URL: jdbc:h2:mem:motosnapdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
SPRING_DATASOURCE_DRIVER_CLASS_NAME: org.h2.Driver
SPRING_JPA_DATABASE_PLATFORM: org.hibernate.dialect.H2Dialect
SPRING_JPA_HIBERNATE_DDL_AUTO: create-drop
JAVA_OPTS: -Xmx400m -Xms200m
```

## ✅ **Success Indicators**

### **Build Success:**

- All 3 Docker stages complete
- No JAVA_HOME errors
- JAR file created successfully
- Image built and pushed

### **Runtime Success:**

- Container starts on port $PORT
- Health check returns 200 OK
- Frontend loads correctly
- API endpoints respond
- H2 database initializes

## 🔍 **Docker Build Optimization**

### **Build Context Size**

**.dockerignore** excludes:

- Git files and documentation
- node_modules (reinstalled in container)
- Build artifacts
- Development files

### **Layer Caching**

- Dependencies downloaded first (cached)
- Source code copied last (changes frequently)
- Multi-stage reduces final image size

### **Security Features**

- Non-root user (`appuser`)
- Minimal Alpine Linux base
- Only production dependencies

## 🐛 **Troubleshooting Docker Issues**

### **Build Failures**

**Docker Build Context Too Large:**

```
Error: Context size exceeded
```

**Solution**: Check .dockerignore includes all unnecessary files

**Frontend Build Fails:**

```
npm ERR! Cannot resolve dependency
```

**Solution**: Ensure package.json has correct dependencies

**Backend Build Fails:**

```
Maven compilation error
```

**Solution**: Check Java code compiles locally first

### **Runtime Issues**

**Container Exits Immediately:**

```
Container exited with code 1
```

**Solution**: Check environment variables, especially PORT

**Health Check Fails:**

```
Health check timeout
```

**Solution**: Verify application starts and /actuator/health endpoint works

**Out of Memory:**

```
Java heap space error
```

**Solution**: Adjust JAVA_OPTS memory settings (current: 400MB max)

## 📈 **Performance & Limits**

### **Free Tier Resources**

- **RAM**: 512MB (Docker container gets ~400MB)
- **CPU**: Shared
- **Disk**: Ephemeral (uploads lost on restart)
- **Sleep**: After 15 minutes inactivity

### **Memory Configuration**

```
JAVA_OPTS: "-Xmx400m -Xms200m"
```

- **Xmx400m**: Max heap 400MB (fits in 512MB limit)
- **Xms200m**: Initial heap 200MB (faster startup)

## 🎉 **Expected Results**

After successful Docker deployment:

1. **Build Time**: ~3-5 minutes (first build)
2. **Startup Time**: ~30-60 seconds
3. **Memory Usage**: ~300-400MB
4. **Application URL**: `https://motosnap-docker.onrender.com`

## 🔄 **Redeployment**

For future updates:

```bash
git add .
git commit -m "Update application"
git push origin main
```

Render automatically triggers Docker rebuild and deployment.

## 📚 **Docker Commands for Local Testing**

If you have Docker installed locally:

```bash
# Build image
docker build -t motosnap .

# Run container
docker run -p 8080:8080 -e PORT=8080 motosnap

# Test health
curl http://localhost:8080/actuator/health
```

## 🎯 **Summary**

Docker deployment on Render:

- ✅ Solves all Java environment issues
- ✅ Provides full control over build process
- ✅ Uses industry-standard deployment method
- ✅ Enables proper production configuration
- ✅ Supports advanced features (health checks, security)

Your MOTOSNAP app will now deploy reliably with Docker! 🚀