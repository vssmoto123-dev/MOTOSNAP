
```
workshop
├─ .env.local
├─ .mvn
│  └─ wrapper
│     └─ maven-wrapper.properties
├─ mvnw
├─ mvnw.cmd
├─ pom.xml
└─ src
   ├─ main
   │  ├─ java
   │  │  └─ com
   │  │     └─ motosnap
   │  │        └─ workshop
   │  │           ├─ config
   │  │           │  ├─ CorsConfig.java
   │  │           │  ├─ FileUploadProperties.java
   │  │           │  ├─ JwtAuthenticationFilter.java
   │  │           │  ├─ JwtConfig.java
   │  │           │  ├─ SecurityConfig.java
   │  │           │  └─ WebConfig.java
   │  │           ├─ controller
   │  │           │  ├─ AuthController.java
   │  │           │  ├─ CartController.java
   │  │           │  ├─ CustomerController.java
   │  │           │  ├─ DebugController.java
   │  │           │  ├─ InventoryController.java
   │  │           │  ├─ OrderController.java
   │  │           │  ├─ PartsController.java
   │  │           │  ├─ ServiceController.java
   │  │           │  └─ UserController.java
   │  │           ├─ dto
   │  │           │  ├─ AuthResponse.java
   │  │           │  ├─ CartItemRequest.java
   │  │           │  ├─ CartItemResponse.java
   │  │           │  ├─ CartResponse.java
   │  │           │  ├─ InventoryRequest.java
   │  │           │  ├─ InventoryResponse.java
   │  │           │  ├─ LoginRequest.java
   │  │           │  ├─ OrderItemResponse.java
   │  │           │  ├─ OrderResponse.java
   │  │           │  ├─ ReceiptUploadRequest.java
   │  │           │  ├─ RegisterRequest.java
   │  │           │  ├─ ServiceRequest.java
   │  │           │  ├─ UpdateRoleRequest.java
   │  │           │  ├─ UserProfileResponse.java
   │  │           │  ├─ UserResponse.java
   │  │           │  └─ VehicleRequest.java
   │  │           ├─ entity
   │  │           │  ├─ Booking.java
   │  │           │  ├─ BookingStatus.java
   │  │           │  ├─ Cart.java
   │  │           │  ├─ CartItem.java
   │  │           │  ├─ Inventory.java
   │  │           │  ├─ Invoice.java
   │  │           │  ├─ Order.java
   │  │           │  ├─ OrderItem.java
   │  │           │  ├─ OrderStatus.java
   │  │           │  ├─ PricingRule.java
   │  │           │  ├─ Receipt.java
   │  │           │  ├─ ReceiptStatus.java
   │  │           │  ├─ Request.java
   │  │           │  ├─ RequestStatus.java
   │  │           │  ├─ Role.java
   │  │           │  ├─ Service.java
   │  │           │  ├─ User.java
   │  │           │  └─ Vehicle.java
   │  │           ├─ repository
   │  │           │  ├─ BookingRepository.java
   │  │           │  ├─ CartItemRepository.java
   │  │           │  ├─ CartRepository.java
   │  │           │  ├─ InventoryRepository.java
   │  │           │  ├─ InvoiceRepository.java
   │  │           │  ├─ OrderItemRepository.java
   │  │           │  ├─ OrderRepository.java
   │  │           │  ├─ PricingRuleRepository.java
   │  │           │  ├─ ReceiptRepository.java
   │  │           │  ├─ RequestRepository.java
   │  │           │  ├─ ServiceRepository.java
   │  │           │  ├─ UserRepository.java
   │  │           │  └─ VehicleRepository.java
   │  │           ├─ service
   │  │           │  ├─ CartService.java
   │  │           │  ├─ CustomerService.java
   │  │           │  ├─ FileStorageService.java
   │  │           │  ├─ InventoryService.java
   │  │           │  ├─ JwtService.java
   │  │           │  ├─ OrderService.java
   │  │           │  ├─ PasswordValidationService.java
   │  │           │  ├─ ServiceManagementService.java
   │  │           │  ├─ UserDetailsServiceImpl.java
   │  │           │  └─ UserManagementService.java
   │  │           └─ WorkshopApplication.java
   │  └─ resources
   │     ├─ application-dev.yml
   │     ├─ application-h2.properties
   │     ├─ application-prod.yml
   │     ├─ application-test.yml
   │     ├─ application.properties
   │     ├─ static
   │     │  ├─ 404.html
   │     │  ├─ dashboard
   │     │  │  ├─ admin
   │     │  │  │  ├─ inventory.html
   │     │  │  │  ├─ inventory.txt
   │     │  │  │  ├─ services.html
   │     │  │  │  ├─ services.txt
   │     │  │  │  ├─ users.html
   │     │  │  │  └─ users.txt
   │     │  │  ├─ admin.html
   │     │  │  └─ admin.txt
   │     │  ├─ dashboard.html
   │     │  ├─ dashboard.txt
   │     │  ├─ favicon.ico
   │     │  ├─ file.svg
   │     │  ├─ globe.svg
   │     │  ├─ index.html
   │     │  ├─ index.txt
   │     │  ├─ login.html
   │     │  ├─ login.txt
   │     │  ├─ next.svg
   │     │  ├─ register.html
   │     │  ├─ register.txt
   │     │  ├─ vercel.svg
   │     │  ├─ window.svg
   │     │  └─ _next
   │     │     ├─ k1dI80OeyymjxwqIqcgJs
   │     │     └─ static
   │     │        ├─ chunks
   │     │        │  ├─ 0f83c911d6d5f328.js
   │     │        │  ├─ 13bd227470452296.js
   │     │        │  ├─ 17722e3ac4e00587.js
   │     │        │  ├─ 1de422039fe8ca6e.css
   │     │        │  ├─ 3607badfc8f47673.js
   │     │        │  ├─ 38a77f9165765bc6.js
   │     │        │  ├─ 4225aebce0f820e9.js
   │     │        │  ├─ 538cc02e54714b23.js
   │     │        │  ├─ 63dba52cde864d84.js
   │     │        │  ├─ 74338fda797bc898.js
   │     │        │  ├─ 7bf33e10e853e9f6.js
   │     │        │  ├─ 7dd66bdf8a7e5707.js
   │     │        │  ├─ 7f3408d1215c830a.js
   │     │        │  ├─ 8082ab48faca5ea1.js
   │     │        │  ├─ 823bae1cbf8a249b.js
   │     │        │  ├─ 91adb7bdb9870c6a.js
   │     │        │  ├─ 94ebe97a0825155c.js
   │     │        │  ├─ a6dad97d9634a72d.js
   │     │        │  ├─ aaea1e64ef7e0faa.js
   │     │        │  ├─ b6c7451ea54d311a.js
   │     │        │  ├─ bd2dcf98c9b362f6.js
   │     │        │  ├─ bd7f46f31869d98a.js
   │     │        │  ├─ e46cdc7002381940.js
   │     │        │  ├─ e4b4c84d09b54377.js
   │     │        │  ├─ e60ef129113f6e24.js
   │     │        │  ├─ ff1a16fafef87110.js
   │     │        │  ├─ turbopack-797c016623fe5def.js
   │     │        │  ├─ turbopack-bb10986f9b5a0943.js
   │     │        │  └─ turbopack-dc7c7a37cb0408b4.js
   │     │        ├─ k1dI80OeyymjxwqIqcgJs
   │     │        │  ├─ _buildManifest.js
   │     │        │  ├─ _clientMiddlewareManifest.json
   │     │        │  └─ _ssgManifest.js
   │     │        └─ media
   │     │           ├─ 1bffadaabf893a1e-s.7cd81963.woff2
   │     │           ├─ 2bbe8d2671613f1f-s.76dcb0b2.woff2
   │     │           ├─ 2c55a0e60120577a-s.2447d0f0.woff2
   │     │           ├─ 5476f68d60460930-s.9fa39156.woff2
   │     │           ├─ 83afe278b6a6bb3c-s.p.3a6ba036.woff2
   │     │           ├─ 9c72aa0f40e4eef8-s.a746726d.woff2
   │     │           ├─ ad66f9afd8947f86-s.a23984fd.woff2
   │     │           └─ favicon.0b3bf435.ico
   │     └─ templates
   └─ test
      └─ java
         └─ com
            └─ motosnap
               └─ workshop
                  └─ WorkshopApplicationTests.java

```