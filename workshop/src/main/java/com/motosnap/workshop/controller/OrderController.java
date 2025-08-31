package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.OrderResponse;
import com.motosnap.workshop.dto.ReceiptUploadRequest;
import com.motosnap.workshop.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping
    public ResponseEntity<?> createOrder(Authentication authentication) {
        try {
            System.out.println("DEBUG: Creating order for user: " + authentication.getName());
            String email = authentication.getName();
            OrderResponse order = orderService.createOrderFromCart(email);
            System.out.println("DEBUG: Order created successfully, ID: " + order.getId() + ", Items: " + order.getOrderItems().size());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to create order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error creating order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/receipt")
    public ResponseEntity<OrderResponse> uploadReceipt(
            @PathVariable Long orderId,
            @Valid @RequestBody ReceiptUploadRequest request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            OrderResponse order = orderService.uploadReceipt(email, orderId, request);
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}