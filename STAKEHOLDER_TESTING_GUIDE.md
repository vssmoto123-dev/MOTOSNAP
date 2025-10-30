## 🧪 Testing Scenarios

### **Scenario 1: Complete Service Booking Flow (3 Examples)**

**Purpose**: Test service revenue, booking completion rates, and mechanic performance

#### **Flow 1: Basic Oil Change Service**
1. **Login as CUSTOMER**
   - Go to http://localhost:3000
   - Login with customer credentials
   - Navigate to **Services** → select **"Oil Change"** service
   - Choose vehicle (register a motorcycle if needed)
   - Select appointment date/time (tomorrow at 10:00 AM)
   - Add notes: "Standard oil change service"
   - **Submit booking**

2. **Login as ADMIN**
   - Approve the booking: Dashboard → Bookings → find the booking
   - Change status to **"CONFIRMED"**
   - Assign to **MECHANIC USER**
   - **Save changes**

3. **Login as MECHANIC**
   - View assigned bookings
   - Start the job: Change status to **"IN_PROGRESS"**
   - **Request a part**: Oil Filter (part code OF-001, quantity 1)
   - Add reason: "Customer requested premium oil filter"
   - **Submit request**

4. **Login as ADMIN**
   - Go to **Parts Requests** → find the pending request
   - **Approve** the oil filter request
   - Check inventory stock adjustment

5. **Login as MECHANIC**
   - Mark job as **"COMPLETED"**
   - Add completion notes: "Service completed successfully"

6. **Login as ADMIN**
   - Generate invoice for the completed booking
   - Verify invoice includes: Service fee + Oil filter cost
   - **Save invoice**

#### **Flow 2: Complex Repair Service**
1. **Customer books**: "Brake Pad Replacement" (premium service)
2. **Admin confirms** → assigns senior mechanic
3. **Mechanic requests**: Brake pads (2 sets), brake fluid (1 bottle)
4. **Admin approves** both requests
5. **Mechanic completes** service with additional notes
6. **Admin generates** invoice with all parts

#### **Flow 3: Quick Maintenance Service**
1. **Customer books**: "Tire Rotation & Balance"
2. **Admin confirms** → no parts needed initially
3. **Mechanic starts** service, discovers worn valve stems
4. **Mechanic requests**: Valve stems (4 pieces)
5. **Admin approves** emergency request
6. **Complete service** → generate invoice

---

### **Scenario 2: Complete Parts Order Flow (3 Examples)**

**Purpose**: Test parts sales revenue, inventory usage, and category analytics

#### **Flow 1: Standard Parts Purchase**
1. **Login as CUSTOMER**
   - Navigate to **Parts Shop**
   - Add items to cart:
     - Oil Filter (2 units)
     - Engine Oil (1 bottle)
     - Air Filter (1 unit)
   - **Proceed to checkout**
   - Fill shipping details
   - **Place order**

2. **Wait for admin** (or login as admin)
3. **Login as ADMIN**
   - Go to **Parts Orders** → find pending order
   - Review order details
   - **Approve** the order
   - Check inventory stock reduced

4. **Login as CUSTOMER**
   - Make payment (upload receipt)
   - **Submit payment**

5. **Login as ADMIN**
   - Review payment receipt
   - **Approve** payment
   - Mark order as **PAID**

#### **Flow 2: Large Quantity Order**
1. **Customer orders**:
   - Brake pads (4 sets) - for multiple bikes
   - Spark plugs (10 pieces) - bulk purchase
   - Chain lubricant (3 bottles)
2. **Admin processes** bulk order approval
3. **Payment and completion**

#### **Flow 3: Specialized Parts Order**
1. **Customer orders**:
   - Performance exhaust system
   - Fuel controller
   - High-flow air filter
2. **Admin handles** specialized parts approval
3. **Complete purchase process**

---

### **Scenario 3: Mixed Business Operations**

**Purpose**: Test comprehensive reporting with mixed data types

#### **Timeline Testing (Spread over different dates)**

1. **Day 1 - Today**:
   - Complete Flow 1 (Oil Change) - creates recent data
   - Process Flow 1 (Standard Parts) - creates recent sales

2. **Day 2 - Tomorrow**:
   - Complete Flow 2 (Brake Repair) - creates upcoming booking
   - Start Flow 3 (Quick Maintenance) - creates in-progress job

3. **Day 3 - Next Week**:
   - Complete Flow 2 (Large Order) - creates future revenue
   - Process additional parts requests

---

## 🔍 Reports Testing Steps

### **Step 1: Access Reports Feature**
1. **Login as ADMIN**
2. Navigate to **Dashboard** → **Admin** → **Reports & Analytics**
3. **Verify page loads** without errors

### **Step 2: Test Dashboard Summary**
1. **Check Summary Cards**:
   - Total Revenue should show combined service + parts revenue
   - Total Orders should count all approved orders
   - Total Bookings should count all bookings (all statuses)
   - Period should reflect "Last 30 days"

2. **Expected Results**:
   - Revenue: Service fees + Parts costs from completed flows
   - Orders: Count of approved parts orders
   - Bookings: Count of all bookings (pending, confirmed, in-progress, completed)

### **Step 3: Test Sales Report**
1. **Select Different Periods**:
   - **Monthly**: Should show revenue by month
   - **Weekly**: Should show revenue by week
   - **Daily**: Should show daily revenue trends

2. **Verify Data Points**:
   - Service Revenue: From completed bookings
   - Parts Revenue: From approved parts orders + requests
   - Order Count: Number of transactions
   - Total Revenue: Combined amount

3. **Change Date Range**:
   - Test 7 days, 30 days, 90 days, 365 days
   - Verify chart updates correctly
   - Check summary statistics recalculate

### **Step 4: Test Parts Usage Report**
1. **Verify Parts Display**:
   - Most used parts should include: Oil Filter, Brake Pads, etc.
   - Quantities should reflect actual usage
   - Revenue should show sales amounts

2. **Test Data Accuracy**:
   - Oil Filter: Should show 2-3 units (from booking + order)
   - Brake Pads: Should show 4 sets (from bulk order)
   - Categories should be correctly grouped

### **Step 5: Test Mechanic Performance**
1. **Check Mechanics Display**:
   - Assigned mechanics should appear
   - Job counts should reflect assignments
   - Completion rates should calculate correctly

2. **Performance Metrics**:
   - Total Jobs: All assigned bookings
   - Completed Jobs: Successfully finished services
   - Parts Requests: Number of requests made
   - Average Time: Completion duration

### **Step 6: Test Export Functionality**
1. **Test CSV Exports**:
   - **Sales CSV**: Should download sales data
   - **Parts CSV**: Should download parts usage data
   - **Mechanic CSV**: Should download performance data

2. **Test PDF Export**:
   - **Export PDF with Charts**: Should generate PDF with all charts
   - Verify PDF includes all three charts
   - Check data accuracy in exported PDF

---

## 📊 Expected Results

### **Revenue Reports**
```
Service Revenue: $XXX.XX (from completed bookings)
Parts Revenue: $XXX.XX (from orders + approved requests)
Total Revenue: $XXX.XX (combined)
Order Count: X (number of transactions)
```

### **Parts Usage Reports**
```
Top Parts:
1. Oil Filter - X units, $XX.XX revenue
2. Brake Pads - X sets, $XX.XX revenue
3. Engine Oil - X bottles, $XX.XX revenue
```

### **Mechanic Performance**
```
Mechanic Name:
- Total Jobs: X
- Completed Jobs: X
- Completion Rate: XX%
- Parts Requests: X
- Avg Completion Time: X.X hours
```

---

## 🚨 Troubleshooting Guide

### **If Reports Show No Data:**
1. Check that bookings were completed (status = COMPLETED)
2. Verify orders were approved (status = APPROVED)
3. Ensure invoice was generated for completed bookings
4. Confirm date range includes test data

### **If Numbers Don't Match:**
1. Manually calculate expected totals
2. Check invoice amounts vs service fees
3. Verify parts were approved and included
4. Review transaction dates

### **If Charts Don't Render:**
1. Check browser console for JavaScript errors
2. Verify network requests are successful
3. Check data types are correct (numbers, not strings)
4. Refresh the page and retry

### **If Export Fails:**
1. Check browser popup blockers
2. Verify html2canvas library loaded
3. Try different browser
4. Check console for specific error messages

---

## ✅ Success Criteria

The testing is successful when:

1. **✅ All Business Flows Complete**: All 3 booking flows + 3 order flows work end-to-end
2. **✅ Reports Load Without Errors**: No JavaScript errors, charts render properly
3. **✅ Data Accuracy**: Report numbers match manual calculations
4. **✅ Date Filtering Works**: Different date ranges show correct data
5. **✅ Export Functionality**: All CSV and PDF exports work correctly
6. **✅ Performance**: Reports load quickly, charts are responsive

---

## 📝 Notes for Stakeholder

- **Take screenshots** of each report for documentation
- **Record any discrepancies** between expected and actual results
- **Test with different browsers** (Chrome, Firefox, Safari)
- **Verify responsive design** on mobile devices
- **Check accessibility** features (keyboard navigation, screen readers)

The new reports feature represents a major improvement in business intelligence for MOTOSNAP, providing real-time insights into workshop operations, revenue trends, and performance metrics.