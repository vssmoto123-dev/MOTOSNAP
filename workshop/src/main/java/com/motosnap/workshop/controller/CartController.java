package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.CartItemRequest;
import com.motosnap.workshop.dto.CartResponse;
import com.motosnap.workshop.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@PreAuthorize("isAuthenticated()")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping
    public ResponseEntity<?> getUserCart(Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting cart for user: " + authentication.getName());
            String email = authentication.getName();
            CartResponse cart = cartService.getUserCart(email);
            System.out.println("DEBUG: Cart retrieved successfully, items count: " + cart.getTotalItems());
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get cart - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting cart - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/items")
    public ResponseEntity<?> addItemToCart(
            @Valid @RequestBody CartItemRequest request,
            Authentication authentication) {
        
        try {
            System.out.println("DEBUG: Adding item to cart - User: " + authentication.getName());
            System.out.println("DEBUG: Request - InventoryId: " + request.getInventoryId() + ", Quantity: " + request.getQuantity());
            
            String email = authentication.getName();
            CartResponse cart = cartService.addItemToCart(email, request);
            
            System.out.println("DEBUG: Cart created/updated successfully");
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to add item to cart - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<?> updateCartItemQuantity(
            @PathVariable Long itemId,
            @RequestBody Map<String, Integer> request,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            Integer newQuantity = request.get("quantity");
            
            if (newQuantity == null || newQuantity < 1) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Quantity must be at least 1"));
            }
            
            System.out.println("DEBUG: Updating cart item " + itemId + " to quantity " + newQuantity);
            CartResponse cart = cartService.updateCartItemQuantity(email, itemId, newQuantity);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to update cart item quantity - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error updating cart item quantity - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItemFromCart(
            @PathVariable Long itemId,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            CartResponse cart = cartService.removeItemFromCart(email, itemId);
            return ResponseEntity.ok(cart);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}