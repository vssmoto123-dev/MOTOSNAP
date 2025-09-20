# Backend Deployment Guide for Separate Deployment

## Summary of Changes Made

### ✅ **Completed Backend Changes**

#### 1. **FileStorageService Updated**
**File:** `/workshop/src/main/java/com/motosnap/workshop/service/FileStorageService.java`

**Change:** Modified `storeFile()` method to return full URL paths
```java
// Before: return fileName; (e.g., "uuid.jpg")
// After:  return "/uploads/" + fileName; (e.g., "/uploads/uuid.jpg")
```

**Impact:** All new file uploads will automatically return paths compatible with separate deployment.

#### 2. **CORS Configuration Updated**
**File:** `render.yaml`

**Change:** Added CORS environment variables for cross-origin file access
```yaml
envVars:
  - key: CORS_ALLOWED_ORIGINS
    value: "https://your-vercel-app.vercel.app,http://localhost:3000"
  - key: CORS_ALLOWED_METHODS
    value: "GET,POST,PUT,DELETE,OPTIONS"
  - key: CORS_ALLOWED_HEADERS
    value: "*"
```

#### 3. **WebConfig Simplified**
**File:** `/workshop/src/main/java/com/motosnap/workshop/config/WebConfig.java`

**Change:** Removed static frontend serving, kept only file serving
```java
@Override
public void addResourceHandlers(ResourceHandlerRegistry registry) {
    // Serve uploaded files only (frontend will be deployed separately)
    registry.addResourceHandler("/uploads/**")
            .addResourceLocations("file:" + uploadDir + "/")
            .setCachePeriod(3600);
}
```

#### 4. **Database Migration Scripts Created**
**Files:**
- `/workshop/src/main/resources/db/migration/V001__update_file_urls_for_separate_deployment.sql`
- `/workshop/src/main/resources/db/migration/V001__rollback_file_url_update.sql`

## Services Impact Analysis

### ✅ **Automatically Compatible Services**
These services use `FileStorageService.storeFile()` and will automatically work with full URLs:

1. **OrderService** - Receipt uploads for orders
2. **InvoicePaymentService** - Payment receipt uploads
3. **InventoryService** - Already returns correct format (`/uploads/filename`)

### ✅ **No Changes Needed**
- **InventoryController** - Already handles full URLs correctly
- **OrderController** - Uses FileStorageService automatically
- **InvoicePaymentController** - Uses FileStorageService automatically

## Deployment Steps

### Phase 1: Deploy Backend to Render

1. **Push Changes to Repository**
```bash
git add .
git commit -m "Configure backend for separate deployment"
git push origin staging/CR/separate-login
```

2. **Render Deployment Configuration**
```yaml
# render.yaml (already updated)
services:
  - type: web
    name: motosnap-backend
    runtime: docker
    envVars:
      # ... existing variables ...
      - key: CORS_ALLOWED_ORIGINS
        value: "https://your-vercel-app.vercel.app,http://localhost:3000"
      - key: CORS_ALLOWED_METHODS
        value: "GET,POST,PUT,DELETE,OPTIONS"
      - key: CORS_ALLOWED_HEADERS
        value: "*"
```

3. **Environment Variables in Render**
- `CORS_ALLOWED_ORIGINS`: Update with your actual Vercel domain
- `UPLOAD_DIR`: `/app/uploads` (for Render filesystem)

### Phase 2: Database Migration

**IMPORTANT:** Run this migration AFTER deploying the updated backend:

```sql
-- Execute this in your database:
UPDATE inventory
SET image_url = CONCAT('/uploads/', image_url)
WHERE image_url IS NOT NULL
  AND image_url != ''
  AND image_url NOT LIKE '/uploads/%';

UPDATE receipt
SET file_url = CONCAT('/uploads/', file_url)
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url NOT LIKE '/uploads/%';

UPDATE invoice_receipt
SET file_url = CONCAT('/uploads/', file_url)
WHERE file_url IS NOT NULL
  AND file_url != ''
  AND file_url NOT LIKE '/uploads/%';
```

### Phase 3: Frontend Deployment (Vercel)

1. **Set Environment Variable in Vercel**
```
NEXT_PUBLIC_API_URL=https://motosnap-backend.onrender.com/api
```

2. **Deploy Frontend**
```bash
cd motosnap-client
vercel --prod
```

## Testing Checklist

### ✅ **Backend Tests**
- [ ] Backend compiles successfully ✅
- [ ] Backend starts without errors
- [ ] `/actuator/health` endpoint returns 200
- [ ] CORS headers are present in responses

### ✅ **File Upload Tests**
- [ ] Inventory image upload returns `/uploads/filename.ext`
- [ ] Order receipt upload works correctly
- [ ] Invoice receipt upload works correctly
- [ ] Files are accessible via `/uploads/filename.ext` URLs

### ✅ **Cross-Origin Tests**
- [ ] Frontend can access files from backend domain
- [ ] No CORS errors in browser console
- [ ] Images load correctly in frontend components

### ✅ **Database Tests**
- [ ] Migration runs successfully
- [ ] Existing file URLs are updated correctly
- [ ] New file uploads store full URLs in database

## File URL Format Examples

### Before Changes
- **Database stores:** `"filename.jpg"`
- **Frontend generates:** `http://localhost:8080/filename.jpg` ❌ **Broken**

### After Changes
- **Database stores:** `"/uploads/filename.jpg"`
- **Frontend generates:** `https://backend.onrender.com/uploads/filename.jpg` ✅ **Works**

## Troubleshooting

### CORS Issues
**Symptom:** Browser shows CORS errors
**Solution:** Update `CORS_ALLOWED_ORIGINS` in Render with your Vercel domain

### File Not Found
**Symptom:** 404 errors for uploaded files
**Solution:**
1. Verify `UPLOAD_DIR` is set correctly in Render
2. Check file permissions in upload directory
3. Ensure WebConfig is serving `/uploads/**`

### Database Migration Issues
**Symptom:** Existing images don't load
**Solution:** Run the migration script to update existing URLs

### Wrong URL Format
**Symptom:** Images try to load from wrong domain
**Solution:** Verify `NEXT_PUBLIC_API_URL` in Vercel settings

## Rollback Plan

If issues occur, you can rollback:

1. **Database Rollback:**
```sql
-- Use V001__rollback_file_url_update.sql
UPDATE inventory SET image_url = REPLACE(image_url, '/uploads/', '') WHERE image_url LIKE '/uploads/%';
-- Repeat for other tables...
```

2. **Code Rollback:** Revert FileStorageService change to return just filename

## Success Criteria

✅ **Frontend and backend deployed separately**
✅ **File uploads work correctly**
✅ **Images display properly in frontend**
✅ **No CORS errors**
✅ **Existing files continue to work**
✅ **New uploads store correct URLs**

## Next Steps

1. Deploy backend to Render
2. Get backend URL
3. Run database migration
4. Deploy frontend to Vercel with correct environment variables
5. Test all functionality

Your backend is now ready for separate deployment! 🚀