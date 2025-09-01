# MOTOSNAP Development Plan

Here is a structured development plan to guide you from your current project setup to a fully functional MOTOSNAP application.

This plan is broken down into logical milestones. Focus on completing one milestone at a time to build the application step-by-step.

---

### **Milestone 1: The Foundation (Data Models & Security)** ✅ COMPLETED

~~This is the most critical phase. The goal is to set up your database structure and secure your application before building any features.~~

1. **Configure Database Connection:**
   
   * In your `src/main/resources/application.properties` file, add the configuration to connect Spring Boot to your local MySQL database (URL, username, password).

2. **Create JPA Entities:**
   
   * Create the Java classes for your core database tables. Start with the main ones:
     * `User` (with fields for email, password, roles)
     * `Vehicle`
     * `Inventory` (for spare parts)
     * `Service` (for service types)
     * **(New)** `Cart` and `CartItem` to manage shopping carts.
     * **(New)** `PurchaseOrder` and `Receipt` to manage customer orders.

3. **Set Up Repositories:**
   
   * Create Spring Data JPA repository interfaces for each entity (e.g., `UserRepository extends JpaRepository<User, Long>`).

4. **Implement Authentication & JWT:**
   
   * Configure Spring Security.
   * Create a `UserDetailsService` to load user data from your database.
   * Build the REST endpoints for user **registration** (`POST /api/auth/register`) and **login** (`POST /api/auth/login`).
   * On successful login, generate a JWT token and send it back to the user.

5. **Implement Role-Based Access:**
   
   * Secure your future API endpoints by specifying which roles (Admin, Mechanic, Customer) can access them.

---

### **Milestone 2: Core Admin & System Management** ✅ COMPLETED

~~Now, build the features that allow the administrator to manage the system's core data. All these endpoints should be secured and accessible only to users with the 'ADMIN' role.~~

1. **Inventory Management API:**
   
   * Create a `InventoryController` with CRUD (Create, Read, Update, Delete) endpoints to manage spare parts.
   * Example: `GET /api/inventory`, `POST /api/inventory`, `PUT /api/inventory/{partId}`.

2. **Service Management API:**
   
   * Create a `ServiceController` with CRUD endpoints to manage the types of services the workshop offers and their prices.
   * Example: `GET /api/services`, `POST /api/services`.

3. **User Management API:**
   
   * Create a `UserController` that allows an admin to view and manage user accounts.
   * Example: `GET /api/users`, `PUT /api/users/{userId}/role`.

---

### **Milestone 3: Customer & Mechanic Features** 🟡 PARTIALLY COMPLETED

**Milestone 3.1: Customer E-Commerce Features** ✅ COMPLETED
**Milestone 3.2: Service Booking & Workshop Operations** 🔴 PENDING

With the core data managed by the admin, you can now build the features for your other users.

1. **Public Parts API:**
   * Create an endpoint for customers to browse available parts (`GET /api/parts`).

2. **Shopping Cart API:**
   * Implement endpoints for authenticated customers to manage their shopping cart.
   * `GET /api/cart`: View cart contents.
   * `POST /api/cart/items`: Add/update items in the cart.
   * `DELETE /api/cart/items/{itemId}`: Remove an item from the cart.

3. **Customer Purchase API:**
   * `POST /api/orders`: Convert the shopping cart into a formal `PurchaseOrder`.
   * `POST /api/orders/{orderId}/receipt`: Upload a payment receipt for the order.

4. **Customer Profile & Service Booking:**
   * Create endpoints for customers to manage their profile/vehicles (`GET /api/me`, `POST /api/me/vehicles`).
   * Implement service booking (`POST /api/bookings`).

5. **Mechanic/Admin Booking Management:**
   * Implement endpoints to view and manage all appointments (`GET /api/bookings`).
   * Create an endpoint for a mechanic to request parts for a job (`POST /api/bookings/{bookingId}/request-part`), which should deduct from inventory.

---

### **Milestone 4: The Service Workflow & Notifications** 🔴 PENDING

Connect all the pieces into a complete service workflow, from booking to completion.

1. **Admin Order Management:**
    * Create endpoints for an admin to manage customer purchases.
    * `GET /api/admin/orders`: View pending orders.
    * `PUT /api/admin/orders/{orderId}/status`: Approve or reject an order.

2. **Job Status Updates & Service History:**
   * Allow a mechanic to update the status of a booking (`PUT /api/bookings/{bookingId}/status`).
   * When a booking is 'COMPLETED', automatically generate a service history record.

3. **Email Notifications:**
   * Use `JavaMailSender` to send emails for key events (new booking, service completion, order confirmation, etc.).