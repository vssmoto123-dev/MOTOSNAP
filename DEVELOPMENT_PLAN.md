# MOTOSNAP Development Plan

Here is a structured development plan to guide you from your current project setup to a fully functional MOTOSNAP application.

This plan is broken down into logical milestones. Focus on completing one milestone at a time to build the application step-by-step.

---

### **Milestone 1: The Foundation (Data Models & Security)**

This is the most critical phase. The goal is to set up your database structure and secure your application before building any features.

1. **Configure Database Connection:**
   
   * In your `src/main/resources/application.properties` file, add the configuration to connect Spring Boot to your local MySQL database (URL, username, password).

2. **Create JPA Entities:**
   
   * Create the Java classes for your core database tables as defined in your architecture draft. Start with the main ones:
     * `User` (with fields for email, password, roles)
     * `Vehicle`
     * `Inventory` (for spare parts)
     * `Service` (for service types)
   * Annotate these classes with `@Entity` to mark them as JPA entities.

3. **Set Up Repositories:**
   
   * Create Spring Data JPA repository interfaces for each entity (e.g., `UserRepository extends JpaRepository<User, Long>`). This will give you standard database operations for free.

4. **Implement Authentication & JWT:**
   
   * Configure Spring Security.
   * Create a `UserDetailsService` to load user data from your database.
   * Build the REST endpoints for user **registration** (`POST /api/auth/register`) and **login** (`POST /api/auth/login`).
   * On successful login, generate a JWT token and send it back to the user.

5. **Implement Role-Based Access:**
   
   * Secure your future API endpoints by specifying which roles (Admin, Mechanic, Customer) can access them.

---

### **Milestone 2: Core Admin & System Management**

Now, build the features that allow the administrator to manage the system's core data. All these endpoints should be secured and accessible only to users with the 'ADMIN' role.

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

### **Milestone 3: Customer & Mechanic Features**

With the core data managed by the admin, you can now build the features for your other users.

1. **Customer Profile API:**
   
   * Create endpoints for authenticated customers to view their own profile and manage their vehicles.
   * Example: `GET /api/me`, `POST /api/me/vehicles`.

2. **Service Booking API:**
   
   * Implement the endpoints for customers to book a new service appointment (`POST /api/bookings`).
   * Implement endpoints for mechanics/admins to view and manage all appointments (`GET /api/bookings`).

3. **Parts Request Workflow:**
   
   * Create an endpoint for a mechanic to request parts for a specific job (`POST /api/bookings/{bookingId}/request-part`).
   * This service should automatically deduct the part quantity from the `Inventory` table as per your requirements.

---

### **Milestone 4: The Service Workflow & Notifications**

Connect all the pieces into a complete service workflow, from booking to completion.

1. **Job Status Updates:**
   
   * Allow a mechanic to update the status of a booking (e.g., 'IN_PROGRESS', 'COMPLETED').
   * Example: `PUT /api/bookings/{bookingId}/status`.

2. **Service History:**
   
   * When a booking is marked as 'COMPLETED', automatically generate a service history record linked to the customer and vehicle.

3. **Email Notifications:**
   
   * Use the `JavaMailSender` provided by the mail starter to send emails for key events:
     * After a customer books an appointment.
     * When a service is completed.
     * (Optional) Low-stock warnings to the admin.
