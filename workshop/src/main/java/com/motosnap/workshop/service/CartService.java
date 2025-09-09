package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.CartItemRequest;
import com.motosnap.workshop.dto.CartResponse;
import com.motosnap.workshop.dto.CartItemResponse;
import com.motosnap.workshop.dto.InventoryResponse;
import com.motosnap.workshop.entity.*;
import com.motosnap.workshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryService inventoryService;

    public CartResponse getUserCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createNewCart(user));

        return convertToCartResponse(cart);
    }

    public CartResponse addItemToCart(String userEmail, CartItemRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Inventory inventory = inventoryRepository.findById(request.getInventoryId())
                .orElseThrow(() -> new RuntimeException("Inventory item not found"));

        // Validate variation selection and check stock
        if (inventory.hasVariations()) {
            if (request.getSelectedVariations() == null || request.getSelectedVariations().isEmpty()) {
                throw new RuntimeException("Variation selection is required for this product");
            }
            
            // Validate selected variations against product's variation definitions
            if (!inventoryService.validateVariationSelection(inventory.getId(), request.getSelectedVariations())) {
                throw new RuntimeException("Invalid variation selection");
            }
            
            // Check variation-specific stock availability
            if (!inventoryService.checkVariationStockAvailability(inventory.getId(), request.getSelectedVariations(), request.getQuantity())) {
                throw new RuntimeException("Insufficient stock for selected variation");
            }
        } else {
            // For non-varied products, check regular stock
            if (inventory.getQty() < request.getQuantity()) {
                throw new RuntimeException("Insufficient stock. Available: " + inventory.getQty());
            }
        }

        Cart cart = cartRepository.findByUser(user)
                .orElseGet(() -> createNewCart(user));

        // Check if item with same variations already exists in cart
        Optional<CartItem> existingItem = findExistingCartItem(cart, inventory, request.getSelectedVariations());

        if (existingItem.isPresent()) {
            // Update existing item quantity
            CartItem cartItem = existingItem.get();
            int newQuantity = cartItem.getQuantity() + request.getQuantity();
            
            // Re-check stock availability for updated quantity
            if (inventory.hasVariations()) {
                if (!inventoryService.checkVariationStockAvailability(inventory.getId(), request.getSelectedVariations(), newQuantity)) {
                    throw new RuntimeException("Insufficient stock for selected variation. Cannot add more items.");
                }
            } else {
                if (inventory.getQty() < newQuantity) {
                    throw new RuntimeException("Insufficient stock. Available: " + inventory.getQty());
                }
            }
            
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        } else {
            // Add new item to cart
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setInventory(inventory);
            cartItem.setQuantity(request.getQuantity());
            cartItem.setUnitPrice(inventory.getUnitPrice().doubleValue());
            
            // Set selected variations if provided
            if (request.getSelectedVariations() != null && !request.getSelectedVariations().isEmpty()) {
                cartItem.setSelectedVariationsMap(request.getSelectedVariations());
            }
            
            cartItemRepository.save(cartItem);
        }

        cart = cartRepository.findById(cart.getId()).orElseThrow();
        return convertToCartResponse(cart);
    }

    public CartResponse removeItemFromCart(String userEmail, Long itemId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to remove this item");
        }

        Cart cart = cartItem.getCart();
        cartItemRepository.delete(cartItem);

        cart = cartRepository.findById(cart.getId()).orElseThrow();
        return convertToCartResponse(cart);
    }

    public CartResponse updateCartItemQuantity(String userEmail, Long cartItemId, Integer newQuantity) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!cartItem.getCart().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to update this cart item");
        }

        // Check if there's enough inventory (variation-aware)
        Inventory inventory = cartItem.getInventory();
        if (inventory.hasVariations() && cartItem.hasVariationSelection()) {
            if (!inventoryService.checkVariationStockAvailability(inventory.getId(), cartItem.getSelectedVariationsMap(), newQuantity)) {
                throw new RuntimeException("Insufficient stock for selected variation");
            }
        } else {
            if (inventory.getQty() < newQuantity) {
                throw new RuntimeException("Insufficient stock. Available: " + inventory.getQty());
            }
        }

        cartItem.setQuantity(newQuantity);
        cartItemRepository.save(cartItem);

        Cart cart = cartItem.getCart();
        cart = cartRepository.findById(cart.getId()).orElseThrow();
        return convertToCartResponse(cart);
    }

    private Cart createNewCart(User user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setCartItems(new ArrayList<>()); // Ensure cartItems is initialized
        return cartRepository.save(cart);
    }

    private CartResponse convertToCartResponse(Cart cart) {
        CartResponse response = new CartResponse();
        response.setId(cart.getId());
        
        // Convert cart items to DTOs (null-safe)
        List<CartItemResponse> cartItemResponses = cart.getCartItems() != null 
                ? cart.getCartItems().stream()
                    .map(this::convertToCartItemResponse)
                    .collect(Collectors.toList())
                : new ArrayList<>();
        response.setCartItems(cartItemResponses);
        
        response.setTotalAmount(cart.getTotalAmount());
        response.setTotalItems(cart.getTotalItems());
        response.setCreatedAt(cart.getCreatedAt());
        response.setUpdatedAt(cart.getUpdatedAt());
        return response;
    }
    
    private CartItemResponse convertToCartItemResponse(CartItem cartItem) {
        CartItemResponse response = new CartItemResponse();
        response.setId(cartItem.getId());
        response.setQuantity(cartItem.getQuantity());
        response.setUnitPrice(cartItem.getUnitPrice());
        response.setAddedAt(cartItem.getAddedAt());
        response.setInventory(convertToInventoryResponse(cartItem.getInventory()));
        
        // Include variation information if available
        if (cartItem.hasVariationSelection()) {
            response.setSelectedVariations(cartItem.getSelectedVariationsMap());
            response.setSelectedVariationsDisplay(cartItem.getVariationDisplayString());
        }
        
        return response;
    }
    
    private InventoryResponse convertToInventoryResponse(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setPartName(inventory.getPartName());
        response.setPartCode(inventory.getPartCode());
        response.setDescription(inventory.getDescription());
        response.setQty(inventory.getQty());
        response.setUnitPrice(inventory.getUnitPrice());
        response.setCategory(inventory.getCategory());
        response.setBrand(inventory.getBrand());
        response.setActive(inventory.getActive());
        response.setImageUrl(inventory.getImageUrl());
        return response;
    }
    
    // Helper method to find existing cart item with same product and variations
    private Optional<CartItem> findExistingCartItem(Cart cart, Inventory inventory, Map<String, String> selectedVariations) {
        if (cart.getCartItems() == null) {
            return Optional.empty();
        }
        
        return cart.getCartItems().stream()
            .filter(item -> item.getInventory().getId().equals(inventory.getId()))
            .filter(item -> {
                // For products without variations, just match the inventory
                if (!inventory.hasVariations()) {
                    return !item.hasVariationSelection();
                }
                
                // For products with variations, match the selected variations
                if (selectedVariations == null || selectedVariations.isEmpty()) {
                    return !item.hasVariationSelection();
                }
                
                Map<String, String> itemVariations = item.getSelectedVariationsMap();
                return selectedVariations.equals(itemVariations);
            })
            .findFirst();
    }
}