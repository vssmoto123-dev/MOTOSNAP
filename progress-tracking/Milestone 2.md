# Milestone 2: Detailed Full-Stack Implementation Plan

This document provides a detailed, actionable development plan for completing Milestone 2. It defines the specific backend APIs and the corresponding frontend components required to build the administrator-facing features.

---

## **Part 1: Backend API Implementation**

This section details the REST APIs to be built in the Spring Boot application.

### **1.1. Inventory Management API**

The goal is to create endpoints for managing spare parts. We'll create an `InventoryService` to handle logic and an `InventoryController` for the API endpoints, secured for 'ADMIN' access.

**File to Create:** `workshop/src/main/java/com/motosnap/workshop/controller/InventoryController.java`

```java
@RestController
@RequestMapping("/api/inventory")
@PreAuthorize("hasRole('ADMIN')") // Secures all endpoints in this controller
public class InventoryController {
    // You will need to inject an InventoryService here
}
```

**Detailed Endpoints for `InventoryController`:**

* **`POST /api/inventory` - Create a New Part**
  
  * **Method:** `createInventoryItem(@RequestBody InventoryItemRequest request)`
  * **Request Body (`InventoryItemRequest` DTO):** A new DTO you would create with fields like `String name`, `String partNumber`, `double price`, `int quantity`.
  * **Logic:** The method should call the `inventoryService` to create and save a new `Inventory` entity from the DTO.
  * **Response:** `201 Created` with the newly created `Inventory` item.

* **`GET /api/inventory` - Get All Parts**
  
  * **Method:** `getAllInventoryItems()`
  * **Logic:** Calls `inventoryService` to find and return a list of all `Inventory` items.
  * **Response:** `200 OK` with a `List<Inventory>`.

* **`GET /api/inventory/{id}` - Get a Single Part**
  
  * **Method:** `getInventoryItemById(@PathVariable Long id)`
  * **Logic:** Calls `inventoryService` to find an item by its ID. Should handle the case where the item is not found.
  * **Response:** `200 OK` with the `Inventory` item or `404 Not Found`.

* **`PUT /api/inventory/{id}` - Update a Part**
  
  * **Method:** `updateInventoryItem(@PathVariable Long id, @RequestBody InventoryItemRequest request)`
  * **Request Body:** Same `InventoryItemRequest` DTO as the create method.
  * **Logic:** Calls `inventoryService` to find the existing item by `id` and update its fields from the request.
  * **Response:** `200 OK` with the updated `Inventory` item.

* **`DELETE /api/inventory/{id}` - Delete a Part**
  
  * **Method:** `deleteInventoryItem(@PathVariable Long id)`
  * **Logic:** Calls `inventoryService` to delete the item by its `id`.
  * **Response:** `204 No Content`.

---

### **1.2. Service Management API**

This follows the same pattern as Inventory Management but for workshop services.

**File to Create:** `workshop/src/main/java/com/motosnap/workshop/controller/ServiceController.java`

**Detailed Endpoints for `ServiceController`:**

* **`POST /api/services` - Create a New Service**
  
  * **Method:** `createService(@RequestBody ServiceRequest request)`
  * **Request Body (`ServiceRequest` DTO):** A new DTO with fields like `String name`, `String description`, `double price`.
  * **Response:** `201 Created` with the new `Service` object.

* **`GET /api/services` - Get All Services**
  
  * **Method:** `getAllServices()`
  * **Response:** `200 OK` with a `List<Service>`.

* **`PUT /api/services/{id}` - Update a Service**
  
  * **Method:** `updateService(@PathVariable Long id, @RequestBody ServiceRequest request)`
  * **Response:** `200 OK` with the updated `Service` object.

* **`DELETE /api/services/{id}` - Delete a Service**
  
  * **Method:** `deleteService(@PathVariable Long id)`
  * **Response:** `204 No Content`.

---

### **1.3. User Management API**

This API is for an admin to manage other users. It's critical to use DTOs here to avoid exposing sensitive data like passwords.

**File to Create:** `workshop/src/main/java/com/motosnap/workshop/controller/UserController.java`

**Detailed Endpoints for `UserController`:**

* **`GET /api/users` - Get All Users**
  
  * **Method:** `getAllUsers()`
  * **Logic:** This method would fetch all `User` entities and, most importantly, map them to a `UserResponse` DTO.
  * **Response Body (`UserResponse` DTO):** A new DTO with fields like `Long id`, `String email`, `String firstName`, `String lastName`, `Role role`. **It must not include the password.**
  * **Response:** `200 OK` with a `List<UserResponse>`.

* **`PUT /api/users/{id}/role` - Update a User's Role**
  
  * **Method:** `updateUserRole(@PathVariable Long id, @RequestBody UpdateRoleRequest request)`
  * **Request Body (`UpdateRoleRequest` DTO):** A new DTO with a single field: `Role newRole`.
  * **Logic:** Calls a `userService` to find the user by `id` and update their role.
  * **Response:** `200 OK` with the updated `UserResponse` DTO.

---

## **Part 2: Frontend Implementation**

This section outlines the necessary React components, API functions, and routing for the admin dashboard.

### **2.1. Admin Dashboard Structure & Routing**

Create a protected area for administrators within the existing dashboard.

* **Create Admin Layout:**
  
  * **File:** `motosnap-client/src/app/dashboard/admin/layout.tsx`
  * **Logic:** This layout will verify if the logged-in user has the 'ADMIN' role using the `AuthContext`. If not, it redirects them. It should contain a sidebar for navigating the admin sections.

* **Create Admin Pages:**
  
  * `motosnap-client/src/app/dashboard/admin/inventory/page.tsx`
  * `motosnap-client/src/app/dashboard/admin/services/page.tsx`
  * `motosnap-client/src/app/dashboard/admin/users/page.tsx`

### **2.2. API Layer (`src/lib/api.ts`)**

Add new functions to communicate with the backend APIs. These functions must include the user's auth token in the request headers.

* `getInventory()`, `createInventoryItem(itemData)`, `updateInventoryItem(id, itemData)`, `deleteInventoryItem(id)`
* `getServices()`, `createService(serviceData)`, `updateService(id, serviceData)`, `deleteService(id)`
* `getUsers()`, `updateUserRole(id, newRole)`

### **2.3. Inventory Management UI**

* **Location:** `motosnap-client/src/components/admin/inventory/`
* **Components to Create:**
  * `InventoryTable.tsx`: Fetches and displays inventory items in a table. Each row needs 'Edit' and 'Delete' buttons.
  * `InventoryForm.tsx`: A form (can be in a a modal) for creating and editing items.
  * `DeleteConfirmationModal.tsx`: A reusable modal to confirm deletions.

### **2.4. Service Management UI**

* **Location:** `motosnap-client/src/components/admin/services/`
* **Components to Create:**
  * `ServiceTable.tsx`: Similar to `InventoryTable`.
  * `ServiceForm.tsx`: Similar to `InventoryForm`.

### **2.5. User Management UI**

* **Location:** `motosnap-client/src/components/admin/users/`
* **Components to Create:**
  * `UserTable.tsx`: Fetches and displays users. Each row needs a button or dropdown to trigger a role change.
  * `UpdateRoleModal.tsx`: A modal that allows the admin to select a new role for a user and submit the change.