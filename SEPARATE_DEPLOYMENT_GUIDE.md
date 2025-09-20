# Separate Deployment Guide

This guide explains how to deploy MOTOSNAP with separate frontend and backend deployments.

## Architecture Overview

- **Backend**: Spring Boot API deployed on Render.com
- **Frontend**: Next.js application deployed on Vercel
- **Communication**: HTTPS API calls with proper CORS configuration

## Backend Deployment (Render.com)

### 1. Updated Build Configuration

The `build.sh` has been updated to build only the backend:

```bash
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
```

### 2. Render Configuration (`render.yaml`)

```yaml
services:
  - type: web
    name: motosnap-backend
    runtime: docker
    plan: free
    env: production
    envVars:
      - key: SPRING_PROFILES_ACTIVE
        value: prod
      - key: UPLOAD_DIR
        value: "/app/uploads"
      - key: JWT_SECRET
        generateValue: true
      - key: SPRING_DATASOURCE_URL
        value: "jdbc:h2:mem:motosnapdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE"
      - key: SPRING_DATASOURCE_DRIVER_CLASS_NAME
        value: "org.h2.Driver"
      - key: SPRING_JPA_DATABASE_PLATFORM
        value: "org.hibernate.dialect.H2Dialect"
      - key: SPRING_JPA_HIBERNATE_DDL_AUTO
        value: "create-drop"
      - key: JAVA_OPTS
        value: "-Xmx400m -Xms200m"
      - key: CORS_ALLOWED_ORIGINS
        value: "https://your-vercel-app.vercel.app,http://localhost:3000"
      - key: CORS_ALLOWED_METHODS
        value: "GET,POST,PUT,DELETE,OPTIONS"
      - key: CORS_ALLOWED_HEADERS
        value: "*"
    healthCheckPath: /actuator/health
```

### 3. CORS Configuration

The CORS configuration has been updated to use environment variables:

```java
@Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,http://localhost:3001,file://,null,https://*.onrender.com}")
private String allowedOrigins;

@Value("${CORS_ALLOWED_METHODS:GET,POST,PUT,DELETE,PATCH,OPTIONS}")
private String allowedMethods;

@Value("${CORS_ALLOWED_HEADERS:Authorization,Content-Type,X-Requested-With}")
private String allowedHeaders;
```

### 4. Static File Serving Removed

The `WebConfig.java` has been simplified to only handle uploaded files:

```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Serve uploaded files only (frontend will be deployed separately)
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/")
            .setCachePeriod(3600);
}
```

## Frontend Deployment (Vercel)

### 1. Vercel Configuration (`motosnap-client/vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_API_URL": "https://motosnap-backend.onrender.com/api"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "out",
  "installCommand": "npm install",
  "framework": "nextjs",
  "functions": {
    "pages/api/**": {
      "maxDuration": 30
    }
  }
}
```

### 2. API Configuration

The frontend already uses a centralized API client with environment variable support:

```typescript
// src/lib/api.ts
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ||
           (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')
             ? `${window.location.origin}/api`
             : 'http://localhost:8080/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});
```

### 3. Image URL Configuration

Fixed hardcoded image URL to use proper configuration:

```typescript
// Before (fixed):
imagePreview: item.imageUrl ? `http://localhost:8080${item.imageUrl}` : undefined

// After:
imagePreview: item.imageUrl ? `${getImageBaseUrl()}${item.imageUrl}` : undefined
```

## Deployment Steps

### 1. Deploy Backend to Render

1. Push changes to your repository
2. Connect repository to Render.com
3. Configure environment variables:
   - `CORS_ALLOWED_ORIGINS`: `https://your-vercel-app.vercel.app,http://localhost:3000`
   - Other required environment variables (see render.yaml)

### 2. Deploy Frontend to Vercel

1. Install Vercel CLI or use GitHub integration
2. Deploy the `motosnap-client` directory
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL`: `https://your-backend-url.onrender.com/api`

### 3. Update CORS Configuration

After deploying both services:
1. Get your Vercel app URL
2. Update the `CORS_ALLOWED_ORIGINS` environment variable in Render
3. Restart the backend service

## Environment Variables

### Backend (Render.com)
- `SPRING_PROFILES_ACTIVE`: `prod`
- `UPLOAD_DIR`: `/app/uploads`
- `JWT_SECRET`: Generate secure value
- `SPRING_DATASOURCE_URL`: Your database URL
- `CORS_ALLOWED_ORIGINS`: Your Vercel app URL + local development
- `CORS_ALLOWED_METHODS`: `GET,POST,PUT,DELETE,OPTIONS`
- `CORS_ALLOWED_HEADERS`: `*`

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL`: Your backend API URL

## Testing

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/actuator/health`
2. **Frontend Access**: Visit `https://your-app.vercel.app`
3. **API Connectivity**: Test login and other API calls
4. **File Uploads**: Test upload functionality

## Troubleshooting

### CORS Issues
- Verify `CORS_ALLOWED_ORIGINS` includes your Vercel domain
- Check browser dev tools for CORS errors
- Ensure backend environment variables are correctly set

### API Connection Issues
- Verify `NEXT_PUBLIC_API_URL` is correct
- Check backend deployment logs
- Test API endpoints directly

### Build Issues
- Ensure Java 17 is available
- Check Maven build logs
- Verify all dependencies are accessible

## Benefits of Separate Deployment

1. **Independent Scaling**: Scale frontend and backend separately
2. **Better Caching**: Vercel provides excellent CDN for static assets
3. **Simplified Deployment**: Each service can be deployed independently
4. **Better Security**: Reduced attack surface
5. **Cost Optimization**: Optimize resources for each service type