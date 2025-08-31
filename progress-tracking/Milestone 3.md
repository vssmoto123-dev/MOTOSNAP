# Milestone 3: Customer & Mechanic Features

**Public Parts & Profile API:**
[ ] `GET /api/parts` - Allow public/customers to browse all available parts.
[ ] `GET /api/me` - Allow an authenticated customer to view their own profile.
[ ] `POST /api/me/vehicles` - Allow a customer to add a vehicle to their profile.

**Shopping Cart API:**
[ ] `GET /api/cart` - Get the contents of the currently logged-in user's cart.
[ ] `POST /api/cart/items` - Add an item (or update its quantity) in the cart.
[ ] `DELETE /api/cart/items/{itemId}` - Remove an item from the cart.

**Customer Purchase API:**
[ ] `POST /api/orders` - Convert the user's cart into a formal `Order`.
[ ] `POST /api/orders/{orderId}/receipt` - Upload a payment receipt for the order.

**Service Booking & Parts Request:**
[ ] `POST /api/bookings` - Allow a customer to book a new service appointment.
[ ] `GET /api/bookings` - Allow ADMINs or MECHANICs to view all appointments.
[ ] `POST /api/bookings/{bookingId}/request-part` - Allow a mechanic to request a part for a job.
[ ] **Inventory Logic:** Ensure the parts request automatically deducts the quantity from the inventory.