# Local Testing Guide for Separate Deployment

## ✅ **Your Setup is Ready for Local Testing**

### Architecture Verification
**Frontend (localhost:3000):**
- ✅ Uses `NEXT_PUBLIC_API_URL=http://localhost:8080/api`
- ✅ `getImageBaseUrl()` returns `http://localhost:8080`
- ✅ All images point to `http://localhost:8080/uploads/*`

**Backend (localhost:8080):**
- ✅ Files stored in `./uploads/` (backend directory)
- ✅ Serves files via `/uploads/**` endpoints
- ✅ CORS allows `http://localhost:3000`
- ✅ Returns full URLs: `/uploads/filename.ext`

## 🚀 **Local Testing Steps**

### Phase 1: Start Backend
```bash
# Start Spring Boot backend
cd workshop
./mvnw spring-boot:run
```

**Verify backend is running:**
- Open: `http://localhost:8080/actuator/health`
- Expected: `{"status":"UP"}` or similar health status

### Phase 2: Start Frontend
```bash
# In a NEW terminal window, start Next.js frontend
cd motosnap-client
npm run dev
```

**Verify frontend is running:**
- Open: `http://localhost:3000`
- Expected: Application loads without errors

### Phase 3: Test File Upload Flow

#### Test 1: Inventory Image Upload
1. **Login as admin** (or create admin account)
2. **Navigate to:** Admin Dashboard → Inventory
3. **Click:** "Add New Item" or edit existing item
4. **Upload:** an image file (JPG, PNG, etc.)
5. **Check:**
   - File appears in `workshop/uploads/` directory
   - Database stores `/uploads/filename.ext`
   - Image displays in frontend

#### Test 2: Order Receipt Upload
1. **Login as customer**
2. **Create an order** with items
3. **Go to:** Orders → Upload Receipt
4. **Upload:** a receipt file
5. **Check:**
   - File saved in `workshop/uploads/`
   - Receipt accessible via backend

#### Test 3: Direct File Access
1. **Upload any image** through the application
2. **Copy the image URL** from browser dev tools
3. **Paste URL directly** in browser: `http://localhost:8080/uploads/filename.ext`
4. **Expected:** Image displays directly

### Phase 4: Verify Cross-Origin Communication

**Open Browser Dev Tools (F12) and check:**

#### Network Tab:
- API calls go to: `http://localhost:8080/api/*`
- Status codes: 200 (OK) for successful requests
- No failed requests

#### Console Tab:
- No CORS errors
- No 404 errors for images
- Clean loading without errors

#### Application Behavior:
- Images load correctly in all components
- File uploads complete successfully
- Navigation works smoothly

## 🔍 **Success Criteria**

### ✅ **File Upload and Display**
- [ ] New image uploads work immediately
- [ ] Images display correctly in frontend
- [ ] Files stored in `workshop/uploads/` directory
- [ ] Database stores full URLs: `/uploads/filename.ext`

### ✅ **Cross-Origin Communication**
- [ ] Frontend on port 3000 communicates with backend on port 8080
- [ ] No CORS errors in browser console
- [ ] All API calls succeed

### ✅ **File Serving**
- [ ] Direct file access: `http://localhost:8080/uploads/filename.ext`
- [ ] Proper content-type headers for images
- [ ] No authentication required for file access

### ✅ **Existing Files (Migration Status)**
- [ ] **Expected:** Some existing images may not display (using old relative paths)
- [ ] **This is normal** - will be fixed when you run database migration
- [ ] **New uploads** should work perfectly

## 🔧 **Troubleshooting**

### Issue: Backend Won't Start
**Symptoms:** Port 8080 in use, compilation errors
**Solutions:**
```bash
# Check if port 8080 is in use
lsof -i :8080

# Kill process if needed
kill -9 <PID>

# Clean and recompile
cd workshop
./mvnw clean compile
./mvnw spring-boot:run
```

### Issue: Frontend Won't Start
**Symptoms:** Port 3000 in use, dependency errors
**Solutions:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Install dependencies
cd motosnap-client
npm install

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Issue: Files Not Found (404)
**Symptom:** `GET http://localhost:8080/uploads/filename.jpg 404 (Not Found)`
**Solutions:**
```bash
# Check if uploads directory exists
ls -la workshop/uploads/

# Create if missing
mkdir -p workshop/uploads

# Check file permissions
chmod 755 workshop/uploads/
```

### Issue: CORS Errors
**Symptom:** Browser shows "CORS policy" errors
**Solutions:**
1. **Check backend CORS configuration:**
   ```java
   // Should include: http://localhost:3000
   @Value("${CORS_ALLOWED_ORIGINS:http://localhost:3000,...}")
   ```

2. **Verify frontend API calls:**
   ```javascript
   // Should be: http://localhost:8080/api/...
   // Not: /api/... or http://localhost:3000/api/...
   ```

### Issue: Upload Fails with 500 Error
**Symptom:** Upload returns internal server error
**Solutions:**
```bash
# Check backend logs for specific errors
tail -f target/spring-boot-app.log

# Verify upload directory permissions
ls -la workshop/

# Check disk space
df -h
```

### Issue: Images Don't Display
**Symptom:** Image placeholders show, but no actual images
**Solutions:**
1. **Check image URL in browser dev tools**
2. **Try accessing image URL directly**
3. **Verify file exists in uploads directory**
4. **Check image format is supported**

## 🎯 **Testing Checklist**

### Before Testing:
- [ ] Backend compiles successfully
- [ ] Frontend dependencies installed
- [ ] No processes using ports 3000 or 8080
- [ ] Upload directory exists: `workshop/uploads/`

### During Testing:
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can access both: `localhost:3000` and `localhost:8080`
- [ ] Login functionality works
- [ ] File upload works for all types
- [ ] Images display correctly
- [ ] No CORS errors

### After Testing:
- [ ] All test scenarios pass
- [ ] No errors in browser console
- [ ] Files properly stored in `workshop/uploads/`
- [ ] Database contains correct URL paths

## 🎉 **What Successful Testing Proves**

When local testing succeeds, you've verified:

1. ✅ **Separate deployment architecture works**
2. ✅ **No tight coupling between FE and BE**
3. ✅ **Cross-origin communication functions**
4. ✅ **File serving across domains works**
5. ✅ **Production-ready configuration**

## 🚀 **Next Steps After Local Testing**

### 1. **Run Database Migration** (Optional for Production)
```sql
-- Run this before production deployment
UPDATE inventory SET image_url = CONCAT('/uploads/', image_url)
WHERE image_url IS NOT NULL AND image_url NOT LIKE '/uploads/%';
-- Repeat for other tables...
```

### 2. **Deploy to Production**
- Backend: Deploy to Render with same configuration
- Frontend: Deploy to Vercel with `NEXT_PUBLIC_API_URL` updated

### 3. **Production Testing**
- Test all functionality with deployed URLs
- Verify CORS works with production domains
- Confirm file uploads work in production

---

**Bottom Line: Your setup is ready for local testing and will demonstrate that separate deployment works perfectly!**