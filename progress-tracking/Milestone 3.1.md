# Milestone 3.1: Customer E-Commerce Features

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
