# 🚀 MOTOSNAP Render.com Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ **Step 1: Verify Local Setup**

Before deploying, ensure everything works locally:

```bash
# 1. Test backend build
cd workshop
./mvnw clean package -DskipTests

# 2. Test frontend build
cd ../motosnap-client
npm ci
npm run build

# 3. Test integration build
cd ..
chmod +x build.sh
./build.sh
```

### ✅ **Step 2: Commit and Push Changes**

```bash
# Add all changes to git
git add .
git commit -m "Prepare for Render.com deployment"
git push origin main
```

**⚠️ IMPORTANT**: Your GitHub repository should be public or you need a Render.com paid plan for private repos.

---

## 🌐 Render.com Account Setup

### **Step 3: Create Render Account**

1. Go to https://render.com
2. Click **"Get Started"**
3. Sign up with GitHub (recommended for easy repo access)
4. Connect your GitHub account when prompted

### **Step 4: Verify GitHub Connection**

1. In Render dashboard, go to **Account Settings**
2. Click **"Connected Accounts"**
3. Ensure GitHub is connected
4. Grant access to your repositories

---

## 🔧 Service Creation on Render

### **Step 5: Create New Web Service**

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Choose **"Build and deploy from a Git repository"**
4. Click **"Connect"** next to your GitHub account

### **Step 6: Repository Selection**

1. Find and select **"MOTOSNAP"** repository
2. Click **"Connect"**
3. Choose branch: **"main"** (or your deployment branch)

### **Step 7: Configure Service Settings**

**Basic Information:**

- **Name**: `motosnap` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`

**Build & Deploy Settings:**

- **Runtime**: `Java`
- **Build Command**: `./build.sh`
- **Start Command**: `java -Dserver.port=$PORT -jar workshop/target/workshop-*.jar`

**Instance Type:**

- **Free Tier**: Select "Free" (512 MB RAM, shared CPU)
- **Note**: Free tier has limitations (sleeps after 15 min inactivity)

---

## ⚙️ Environment Variables Configuration

### **Step 8: Set Environment Variables**

In the service settings, add these environment variables:

```
SPRING_PROFILES_ACTIVE=prod
SERVER_PORT=8080
UPLOAD_DIR=./uploads
JWT_SECRET=your-super-secret-jwt-key-at-least-32-characters-long-for-security
SPRING_DATASOURCE_URL=jdbc:h2:mem:motosnapdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE
SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
SPRING_JPA_DATABASE_PLATFORM=org.hibernate.dialect.H2Dialect
SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop
```

**🔐 Security Note**: Generate a strong JWT_SECRET:

```bash
# Generate random 32-character secret
openssl rand -base64 32
```

---

## 🏗️ Deployment Process

### **Step 9: Deploy the Application**

1. Click **"Create Web Service"**
2. Render will start the deployment process
3. Monitor the build logs in real-time
4. Wait for build completion (may take 5-10 minutes)

### **Step 10: Monitor Build Logs**

Watch for these key steps:

```
✅ Repository cloned
✅ Frontend dependencies installed
✅ Frontend built successfully
✅ Backend compiled
✅ JAR file created
✅ Service started
```

---

## 🔍 Post-Deployment Verification

### **Step 11: Test Your Deployment**

**Basic Health Check:**

```bash
# Replace YOUR_APP_URL with your Render service URL
curl https://your-app-name.onrender.com/actuator/health
```

**Expected Response:**

```json
{"status":"UP"}
```

**Test API Endpoints:**

```bash
# Test registration endpoint
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123","role":"CUSTOMER"}'
```

**Test Frontend:**

1. Open your Render service URL in browser
2. Verify the React app loads
3. Test navigation between pages
4. Check browser console for errors

---

## 🐛 Troubleshooting Common Issues

### **Build Failures**

**Issue: Maven Build Fails**

```bash
# Solution: Check Java version in logs
# Add to environment variables if needed:
JAVA_VERSION=17
```

**Issue: Frontend Build Fails**

```bash
# Check Node.js version in build logs
# Most common fix: Update package.json if needed
```

**Issue: Build Script Permission Denied**

```bash
# Solution: The build.sh should be executable
# Check git attributes or fix locally:
git update-index --chmod=+x build.sh
git commit -m "Fix build script permissions"
git push
```

### **Runtime Errors**

**Issue: Application Won't Start**

- Check environment variables are set correctly
- Verify PORT environment variable is used
- Check if JAR file path is correct in start command

**Issue: Database Connection Errors**

- Verify H2 database configuration
- Check if data directory is writable
- Ensure DDL auto-creation is enabled

**Issue: File Upload Errors**

- Verify UPLOAD_DIR environment variable
- Check if uploads directory exists and is writable
- Ensure proper file permissions

### **Performance Issues**

**Free Tier Limitations:**

- App sleeps after 15 minutes of inactivity
- Cold start time: 10-30 seconds
- Limited CPU and memory

**Solutions:**

- Upgrade to paid tier for always-on service
- Implement health check pings (not recommended for free tier)
- Optimize startup time

---

## 📝 Useful Commands

### **Redeploy Application**

```bash
# Method 1: From Render Dashboard
# Go to your service → Manual Deploy → "Deploy Latest Commit"

# Method 2: Push to trigger auto-deploy
git commit --allow-empty -m "Trigger deployment"
git push origin main
```

### **View Logs**

```bash
# In Render Dashboard:
# Service → Logs tab → View real-time logs
```

### **Service Management**

- **Suspend Service**: Service Settings → Suspend
- **Delete Service**: Service Settings → Delete Service
- **Environment Variables**: Service Settings → Environment

---

## 🔗 Important URLs

After successful deployment, you'll have:

- **Application URL**: `https://your-app-name.onrender.com`
- **API Base URL**: `https://your-app-name.onrender.com/api`
- **Health Check**: `https://your-app-name.onrender.com/actuator/health`
- **Dashboard**: Render.com dashboard for monitoring

---

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Build completes without errors
- ✅ Service shows "Live" status
- ✅ Health check endpoint returns 200 OK
- ✅ Frontend loads in browser
- ✅ API endpoints respond correctly
- ✅ File uploads work (test with inventory images)
- ✅ Authentication flow works

---

## 🆘 Getting Help

If you encounter issues:

1. Check Render build logs for specific errors
2. Review environment variables configuration
3. Test the same build process locally
4. Check Render.com status page for service issues
5. Contact Render support for platform-specific problems

**Next Steps After Deployment:**

- Set up custom domain (paid feature)
- Configure database backups
- Set up monitoring and alerts
- Implement CI/CD pipelines