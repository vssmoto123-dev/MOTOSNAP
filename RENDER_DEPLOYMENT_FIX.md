# 🔧 Render.com Java Runtime Fix

## ❌ **The Problem**

```
bash: line 1: java: command not found
```

## ✅ **The Solution**

The issue occurs because Render's Java runtime doesn't automatically set up the Java executable in PATH. Here's how we fixed it:

### **1. Updated Start Command**

Changed from:

```bash
java -Dserver.port=$PORT -jar workshop/target/workshop-*.jar
```

To:

```bash
./workshop/mvnw -Dspring-boot.run.jvmArguments=-Dserver.port=$PORT -f workshop/pom.xml spring-boot:run
```

**Why this works:**

- Uses Maven Wrapper (`mvnw`) which includes Java path detection
- Runs Spring Boot directly instead of using pre-built JAR
- Automatically handles Java runtime setup

### **2. Updated Render Configuration**

**In `render.yaml`:**

```yaml
startCommand: "./workshop/mvnw -Dspring-boot.run.jvmArguments=-Dserver.port=$PORT -f workshop/pom.xml spring-boot:run"
envVars:
  - key: JAVA_OPTS
    value: "-Dserver.port=$PORT"
```

### **3. Enhanced Build Script**

Added Java detection to `build.sh`:

```bash
# Set JAVA_HOME if not set
if [ -z "$JAVA_HOME" ]; then
    export JAVA_HOME=$(readlink -f /usr/bin/java | sed "s:bin/java::")
fi

# Build with explicit Java version
./mvnw clean package -DskipTests -Djava.version=17
```

### **4. Added Production Configuration**

Created `application-prod.properties` with H2 database settings for production.

## 🚀 **Deploy Again**

After these changes:

1. Commit and push your changes
2. Go to Render Dashboard
3. Click **"Manual Deploy"** → **"Deploy Latest Commit"**
4. Monitor the build logs

**Expected Success Indicators:**

- ✅ `chmod +x mvnw` runs successfully
- ✅ Maven builds without Java errors
- ✅ Spring Boot starts with `mvnw spring-boot:run`
- ✅ Application responds on the assigned port

## 📋 **Alternative Deployment Commands**

If the Maven Wrapper approach doesn't work, try these alternatives in Render's service settings:

**Option 1 (Current):**

```bash
./workshop/mvnw -Dspring-boot.run.jvmArguments=-Dserver.port=$PORT -f workshop/pom.xml spring-boot:run
```

**Option 2 (JAR with full path):**

```bash
$JAVA_HOME/bin/java -Dserver.port=$PORT -jar workshop/target/workshop-*.jar
```

**Option 3 (Using which):**

```bash
$(which java) -Dserver.port=$PORT -jar workshop/target/workshop-*.jar
```

## 🔍 **Debugging Tips**

If you still get errors:

1. **Check Build Logs** for Java version detection
2. **Verify Environment Variables** are set correctly
3. **Check File Permissions** on mvnw script
4. **Monitor Startup Logs** for Spring Boot initialization

The fix should resolve the Java runtime issue and get your MOTOSNAP app running on Render! 🎉