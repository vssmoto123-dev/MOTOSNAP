# MOTOSNAP API Documentation

## Base URL
- **Development**: `http://localhost:8080/api`
- **Production**: `https://your-domain.com/api`

## Authentication
All protected endpoints require JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

---

## 📝 Authentication Endpoints

### Register User
**POST** `/auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!",
  "name": "User Name",
  "phone": "012-3456789",
  "role": "CUSTOMER" // CUSTOMER, MECHANIC, ADMIN
}
```

**Success Response (201):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900000,
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "CUSTOMER"
  }
}
```

**Error Response (400):**
```json
{
  "error": "Email already registered"
}
```

### Login User
**POST** `/auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "StrongPass123!"
}
```

**Success Response (200):** Same as register
**Error Response (400):** `{"error": "Invalid email or password"}`

### Refresh Token
**POST** `/auth/refresh`

**Headers:**
```
Authorization: Bearer <refresh_token>
```

**Success Response (200):** Same as login with new access token

---

## 👤 User Roles & Permissions

### CUSTOMER
- Can register/login
- Can view own profile and service history
- Can create service bookings
- Can view own vehicles and add new ones

### MECHANIC  
- All customer permissions
- Can view assigned service jobs
- Can update job statuses
- Can request parts for jobs
- Can view job schedules

### ADMIN
- All permissions
- Can manage inventory (CRUD operations)
- Can manage services and pricing
- Can manage users (view, activate/deactivate)
- Can approve parts orders and receipts
- Can assign mechanics to jobs
- Can view all reports and analytics

---

## 🚧 Planned API Endpoints (Milestone 2+)

### 📦 Inventory Management (ADMIN only)

#### Get All Parts
**GET** `/inventory`
**Query Parameters:**
- `search` - Search by name/code/description
- `category` - Filter by category
- `lowStock` - boolean, show only low stock items

#### Get Part by ID
**GET** `/inventory/{id}`

#### Create New Part
**POST** `/inventory`
```json
{
  "partName": "Brake Pad Set",
  "partCode": "BP001",
  "description": "Front brake pads for motorcycles",
  "qty": 50,
  "unitPrice": 89.90,
  "minStockLevel": 10,
  "category": "Brakes",
  "brand": "Honda"
}
```

#### Update Part
**PUT** `/inventory/{id}`

#### Delete Part
**DELETE** `/inventory/{id}`

---

### 🔧 Service Management (ADMIN only)

#### Get All Services
**GET** `/services`

#### Create Service
**POST** `/services`
```json
{
  "name": "Oil Change",
  "category": "Maintenance",
  "description": "Full engine oil change with filter",
  "basePrice": 45.00,
  "estimatedDurationMinutes": 30
}
```

#### Update Service
**PUT** `/services/{id}`

#### Service Pricing Rules
**POST** `/services/{id}/pricing`
```json
{
  "vehicleCategory": "SMALL", // SMALL, MEDIUM, LARGE, SPORTS
  "price": 45.00
}
```

---

### 📅 Booking Management

#### Create Booking (CUSTOMER)
**POST** `/bookings`
```json
{
  "vehicleId": 1,
  "serviceId": 2,
  "scheduledDateTime": "2024-09-01T10:00:00",
  "notes": "Strange noise from engine"
}
```

#### Get User Bookings (CUSTOMER)
**GET** `/me/bookings`

#### Get All Bookings (ADMIN/MECHANIC)
**GET** `/bookings`
**Query Parameters:**
- `status` - Filter by booking status
- `mechanicId` - Filter by assigned mechanic
- `date` - Filter by date

#### Update Booking Status (MECHANIC)
**PUT** `/bookings/{id}/status`
```json
{
  "status": "IN_PROGRESS", // PENDING, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED
  "notes": "Started working on the issue"
}
```

#### Assign Mechanic (ADMIN)
**PUT** `/bookings/{id}/assign`
```json
{
  "mechanicId": 3
}
```

---

### 🏍️ Vehicle Management

#### Get User Vehicles (CUSTOMER)
**GET** `/me/vehicles`

#### Add Vehicle (CUSTOMER)
**POST** `/me/vehicles`
```json
{
  "plateNo": "ABC1234",
  "model": "CBR600RR",
  "brand": "Honda",
  "year": 2022,
  "color": "Red",
  "engineCapacity": "600cc"
}
```

---

### 🛒 Parts Ordering & Receipts

#### Create Parts Order (CUSTOMER)
**POST** `/orders`
```json
{
  "items": [
    {
      "partId": 1,
      "qty": 2
    }
  ]
}
```

#### Upload Receipt (CUSTOMER)
**POST** `/orders/{id}/receipt`
**Content-Type:** `multipart/form-data`
- `file` - Receipt image/PDF

#### Approve/Reject Receipt (ADMIN)
**PUT** `/receipts/{id}/approve`
```json
{
  "approved": true,
  "adminNotes": "Payment verified"
}
```

---

### 🔧 Parts Requests (MECHANIC)

#### Request Parts for Job
**POST** `/requests`
```json
{
  "bookingId": 1,
  "partId": 5,
  "qty": 1
}
```
*Note: This will auto-deduct from inventory*

#### Get Mechanic Requests
**GET** `/me/requests`

---

### 📊 Reports & Analytics (ADMIN)

#### Inventory Reports
**GET** `/reports/inventory`
- Low stock alerts
- Most used parts
- Stock value

#### Revenue Reports  
**GET** `/reports/revenue`
**Query Parameters:**
- `startDate`, `endDate` - Date range
- `period` - daily/weekly/monthly

#### Service Reports
**GET** `/reports/services`
- Popular services
- Mechanic performance
- Service completion rates

---

## 🔄 Real-time Features (Future)

### WebSocket Endpoints
- `/ws/notifications` - Real-time notifications
- `/ws/booking-updates` - Live booking status updates
- `/ws/inventory-alerts` - Stock level alerts

---

## 📱 Frontend Integration Notes

### Authentication Flow
1. **Login/Register** → Store `accessToken` in memory, `refreshToken` in httpOnly cookie
2. **API Calls** → Include `Authorization: Bearer ${accessToken}` 
3. **Token Refresh** → Use refresh token when access token expires
4. **Logout** → Clear tokens and redirect to login

### State Management Recommendations
- **User Context** → Current user info and role
- **Auth Context** → Login state and token management  
- **Notifications** → Success/error messages
- **Loading States** → For better UX

### Route Protection
```javascript
// Example route protection by role
const ProtectedRoute = ({ children, requiredRole }) => {
  const { user } = useAuth();
  
  if (!user) return <Redirect to="/login" />;
  if (requiredRole && user.role !== requiredRole) {
    return <div>Access Denied</div>;
  }
  
  return children;
};
```

### API Client Setup
```javascript
// Example Axios interceptor for token management
axios.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await refreshToken();
      // Retry original request
    }
    return Promise.reject(error);
  }
);
```

---

## 🚨 Error Handling

### Common HTTP Status Codes
- **200** - Success
- **201** - Created successfully  
- **400** - Bad request (validation errors)
- **401** - Unauthorized (invalid/expired token)
- **403** - Forbidden (insufficient permissions)
- **404** - Resource not found
- **500** - Internal server error

### Standard Error Response
```json
{
  "error": "Descriptive error message",
  "details": "Additional details if applicable"
}
```

---

## 🔧 Development Setup

### Environment Variables
```bash
# Backend
DATABASE_URL=jdbc:mysql://localhost:3306/motosnap_dev
JWT_SECRET=your-secret-key
SPRING_PROFILES_ACTIVE=dev

# Frontend  
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

### CORS Configuration
Backend is configured to allow:
- `http://localhost:3000` (Next.js dev)
- `http://localhost:3001` (Alternative port)

---

This documentation will be updated as we implement Milestone 2 features!