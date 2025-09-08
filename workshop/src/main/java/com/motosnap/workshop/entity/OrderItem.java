package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer qty;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Price at time of order
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Inventory part;
    
    @Column(columnDefinition = "JSON")
    private String selectedVariations;
    
    // Constructor for creating new order items
    public OrderItem(Integer qty, BigDecimal price, Order order, Inventory part) {
        this.qty = qty;
        this.price = price;
        this.order = order;
        this.part = part;
        this.selectedVariations = null;
    }
    
    // Helper method to calculate total price
    public BigDecimal getTotalPrice() {
        return price.multiply(BigDecimal.valueOf(qty));
    }
    
    // ===============================================================================
    // VARIATION MANAGEMENT METHODS
    // ===============================================================================
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // Get selected variations as Map
    @SuppressWarnings("unchecked")
    public Map<String, String> getSelectedVariationsMap() {
        if (this.selectedVariations == null || this.selectedVariations.trim().isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            return objectMapper.readValue(this.selectedVariations, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    // Set selected variations from Map
    public void setSelectedVariationsMap(Map<String, String> selectedVariationsMap) {
        if (selectedVariationsMap == null || selectedVariationsMap.isEmpty()) {
            this.selectedVariations = null;
            return;
        }
        
        try {
            this.selectedVariations = objectMapper.writeValueAsString(selectedVariationsMap);
        } catch (Exception e) {
            this.selectedVariations = null;
        }
    }
    
    // Check if this order item has variation selection
    public boolean hasVariationSelection() {
        return this.selectedVariations != null && !this.selectedVariations.trim().isEmpty();
    }
    
    // Get formatted variation display string for UI
    public String getVariationDisplayString() {
        if (!hasVariationSelection()) {
            return "";
        }
        
        Map<String, String> variations = getSelectedVariationsMap();
        if (variations.isEmpty()) {
            return "";
        }
        
        return variations.entrySet().stream()
            .map(entry -> entry.getKey() + ": " + entry.getValue())
            .reduce((a, b) -> a + ", " + b)
            .orElse("");
    }
}