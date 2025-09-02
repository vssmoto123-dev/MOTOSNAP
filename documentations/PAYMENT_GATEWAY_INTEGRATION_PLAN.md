# Payment Gateway Integration Plan

## 1. Overview

This document outlines the plan to integrate a payment gateway into the MOTOSNAP application. The goal is to replace the current manual receipt upload and approval process with an automated online payment system. This will streamline the checkout process, reduce manual work for administrators, and provide a better user experience for customers.

We will use **Stripe** as the payment gateway for this integration due to its comprehensive documentation, developer-friendly APIs, and robust feature set.

## 2. Backend Implementation Plan (Spring Boot)

### 2.1. Dependencies and Configuration

* **Add Stripe Dependency**: Add the Stripe Java SDK to the `pom.xml`.
  
  ```xml
  <dependency>
      <groupId>com.stripe</groupId>
      <artifactId>stripe-java</artifactId>
      <version>22.4.0</version> <!-- Use the latest version -->
  </dependency>
  ```
* **Configure Stripe API Keys**: Add Stripe API keys to `application.properties`. Use environment variables for production.
  
  ```properties
  stripe.api.key.secret=${STRIPE_SECRET_KEY}
  stripe.api.key.public=${STRIPE_PUBLIC_KEY}
  stripe.webhook.secret=${STRIPE_WEBHOOK_SECRET}
  ```

### 2.2. Database (Entity) Changes

* **Modify `Order` Entity**:
  
  * Add `String paymentIntentId`: To store the Stripe Payment Intent ID.
  * Add `String clientSecret`: To pass the client secret to the frontend.
  * Add `String paymentStatus`: To store the payment status from Stripe (e.g., `succeeded`, `failed`).

* **Modify `OrderStatus` Enum**:
  
  * Add a new status: `AWAITING_PAYMENT`.

### 2.3. Service Layer Changes

* **Create `PaymentService`**:
  
  * `createPaymentIntent(Order order)`: Creates a Payment Intent with Stripe, updates the `Order` entity with the `paymentIntentId` and `clientSecret`, and returns the `clientSecret` to the controller.
  * `handleStripeWebhook(String payload, String signature)`: Verifies and processes webhook events from Stripe.

* **Update `OrderService`**:
  
  * Modify `createOrderFromCart()`:
    * After creating the order, set its status to `AWAITING_PAYMENT`.
    * Call `paymentService.createPaymentIntent(order)`.
    * The method will now return a response containing the `clientSecret`.
  * Create `handlePaymentSuccess(String paymentIntentId)`:
    * Finds the order by `paymentIntentId`.
    * Updates the order status to `APPROVED`.
    * (Optional) Sends an order confirmation email.
  * Create `handlePaymentFailure(String paymentIntentId)`:
    * Finds the order by `paymentIntentId`.
    * Updates the order status to `PAYMENT_FAILED`.
    * (Optional) Sends a payment failure notification to the customer.

### 2.4. Controller Layer Changes

* **Create `PaymentController`**:
  
  * `POST /api/orders/{orderId}/create-payment-intent`: An endpoint for the frontend to request the creation of a Payment Intent for an order. This will be called after the order is created.
  * `POST /api/webhooks/stripe`: A public endpoint to receive webhook events from Stripe. This endpoint will not be protected by JWT authentication.

* **Update `OrderController`**:
  
  * The `createOrder` endpoint will now return the `orderId` and the `clientSecret` for the payment.

## 3. Frontend Implementation Plan (Next.js)

### 3.1. Dependencies

* **Add Stripe.js**: Add the Stripe.js and React Stripe.js libraries to the project.
  
  ```bash
  npm install @stripe/stripe-js @stripe/react-stripe-js
  ```

### 3.2. UI/Component Changes

* **Create `CheckoutForm` Component**:
  
  * This component will contain the Stripe Elements for collecting card details securely.
  * It will be wrapped with the `Elements` provider from `@stripe/react-stripe-js`.

* **Create a `CheckoutPage`**:
  
  * This page will display the order summary and the `CheckoutForm`.
  * It will be loaded after the user clicks "Proceed to Checkout" from the cart.

* **Update `CartPage`**:
  
  * The "Proceed to Checkout" button will now navigate to the new `CheckoutPage`, passing the `orderId`.

* **Update `OrderSuccessPage`**:
  
  * This page will be shown after a successful payment. It will no longer need to handle receipt uploads.

### 3.3. API and State Management

* **Update `api.ts`**:
  
  * Add a new method `createPaymentIntent(orderId)` to call the new backend endpoint.

* **Checkout Flow**:
  
  1. User clicks "Proceed to Checkout" on the `CartPage`.
  2. The app calls `apiClient.createOrder()` to create an order.
  3. The user is redirected to the `CheckoutPage` with the `orderId`.
  4. On the `CheckoutPage`, the app calls `apiClient.createPaymentIntent(orderId)` to get the `clientSecret`.
  5. The `clientSecret` is used to initialize the Stripe Elements.
  6. The user enters their payment details and submits the form.
  7. The frontend uses Stripe.js to confirm the payment.
  8. On successful payment, the user is redirected to the `OrderSuccessPage`.

## 4. Webhook Handling

* The `/api/webhooks/stripe` endpoint on the backend will listen for events from Stripe.
* The `PaymentService` will handle the `payment_intent.succeeded` and `payment_intent.payment_failed` events.
* When a `payment_intent.succeeded` event is received, the `OrderService` will update the order status to `APPROVED`.
* This ensures that the order status is updated reliably, even if the user closes their browser after paying.

## 5. Security Considerations

* **API Keys**: Stripe secret keys will be stored securely as environment variables on the backend and never exposed to the frontend.
* **Webhook Security**: The webhook endpoint will be secured by verifying the Stripe signature in the `Stripe-Signature` header. The webhook secret will be stored as an environment variable.

## 6. Rollout Strategy

* **Phase 1: Implement and Test**: Develop and thoroughly test the Stripe integration in a development environment.
* **Phase 2: A/B Testing or Gradual Rollout (Optional)**: If desired, we can initially show the new payment flow to a subset of users.
* **Phase 3: Full Rollout**: Make the Stripe payment flow the default for all users.
* **Fallback**: We can choose to keep the manual receipt upload feature as an alternative payment method for users who prefer it. The UI can be designed to offer both options.

This plan provides a comprehensive roadmap for integrating a payment gateway into the MOTOSNAP application. By following these steps, we can deliver a more modern and efficient payment experience for our users.
