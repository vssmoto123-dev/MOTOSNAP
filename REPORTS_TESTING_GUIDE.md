# Reports Functionality Testing Guide

## 🚀 Setup Complete

Both servers are running successfully:
- **Frontend**: http://localhost:3000 (Next.js with Turbopack)
- **Backend**: http://localhost:8080 (Spring Boot)

## 🧪 Testing Instructions

### Step 1: Access the Application
1. Open your browser and go to: **http://localhost:3000**
2. Login as an ADMIN user (you'll need existing admin credentials)

### Step 2: Navigate to Reports
1. From the dashboard, click on **"Admin"** in the sidebar
2. Click on **"Reports & Analytics"** in the admin menu

### Step 3: Test the Reports Dashboard

The reports page should load with the following features:

#### 📊 Expected Components:
1. **Header Section**: "Reports & Analytics" title with refresh button
2. **Report Controls**:
   - Sales Report Period selector (Daily/Weekly/Monthly)
   - Report Period selector (7/30/90/365 days)
3. **Summary Statistics Cards**:
   - Total Revenue
   - Total Orders
   - Total Bookings
   - Period indicator
4. **Charts Section**:
   - Sales Report Chart
   - Most Used Parts Chart
   - Mechanic Performance Chart
5. **Export Section**: CSV and PDF export buttons

### Step 4: Run the Test Script

1. Open **Browser Developer Tools** (F12)
2. Go to the **Console** tab
3. Copy and paste the contents of `test-reports-fix.js` (provided separately)
4. Press Enter to run the test

**Expected Test Results:**
- ✅ All API calls should succeed (200 status)
- ✅ Data structures should match TypeScript interfaces
- ✅ No undefined values or array access errors
- ✅ Proper type alignment between backend DTOs and frontend interfaces

### Step 5: Manual Testing

#### Test Sales Report Periods:
1. Change "Sales Report Period" from Monthly to Daily
2. Click "Apply Filters"
3. Verify the chart updates correctly
4. Repeat for Weekly period

#### Test Date Ranges:
1. Change "Report Period" to 7 days
2. Click "Apply Filters"
3. Verify data updates and summary statistics change
4. Try 90 days and 365 days

#### Test Export Functionality:
1. Click "Sales CSV" - should download a CSV file
2. Click "Parts CSV" - should download a CSV file
3. Click "Mechanic CSV" - should download a CSV file
4. Click "Export PDF with Charts" - should generate and download PDF

## 🔍 Expected Data Structure Validation

### Backend Should Return:
```json
{
  "monthlySales": [
    {
      "month": 10,
      "year": 2025,
      "revenue": 1500.00,
      "serviceRevenue": 1000.00,
      "partsRevenue": 500.00,
      "orderCount": 5
    }
  ],
  "mostUsedParts": [
    {
      "partId": 1,
      "partName": "Oil Filter",
      "partCode": "OF-001",
      "brand": "Yamaha",
      "category": "Filters",
      "totalQuantity": 10,
      "totalRevenue": 500.00
    }
  ],
  "mechanicPerformance": [
    {
      "mechanicId": 1,
      "mechanicName": "John Doe",
      "mechanicEmail": "john@example.com",
      "totalJobs": 8,
      "completedJobs": 7,
      "completionRate": 87.5,
      "avgCompletionHours": 2.5
    }
  ],
  "summary": {
    "totalRevenue": 1500.00,
    "totalOrders": 15,
    "totalBookings": 10,
    "period": "Last 30 days"
  }
}
```

### Frontend Should Display:
- ✅ No console errors related to undefined array access
- ✅ Charts render with proper data
- ✅ Summary cards show correct values
- ✅ Export buttons work without errors

## 🐛 Common Issues & Solutions

### If you see "Access denied" error:
- Ensure you're logged in as ADMIN user
- Check browser localStorage for valid accessToken

### If charts don't render:
- Check browser console for JavaScript errors
- Verify data is being fetched (check Network tab)
- Data might be empty if no invoices/bookings exist

### If exports don't work:
- Check browser console for PDF generation errors
- Ensure html2canvas library is loaded properly
- Check if popup blockers are interfering

## 🎯 Success Criteria

The implementation is successful when:

1. **✅ Reports page loads without JavaScript errors**
2. **✅ All API endpoints return 200 status**
3. **✅ Data structures match between backend and frontend**
4. **✅ Charts render with real data**
5. **✅ Export functionality works**
6. **✅ No array index access errors in console**

## 📝 Testing Notes

- The implementation uses **proper DTOs** instead of Object[] arrays
- **COALESCE** functions prevent NULL value issues
- **Type safety** is maintained from database to UI
- **Error handling** follows existing codebase patterns

## 🔧 Debug Commands

If issues occur, check these in browser console:

```javascript
// Check API client status
console.log('API Client:', apiClient);

// Check authentication
console.log('Access Token:', localStorage.getItem('accessToken'));

// Test API directly
fetch('/api/reports/dashboard?days=30', {
  headers: {'Authorization': 'Bearer ' + localStorage.getItem('accessToken')}
}).then(r => r.json()).then(console.log);
```