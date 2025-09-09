package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @JsonBackReference("cart-cartItems")
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventory;

    @Column(name = "quantity", nullable = false)
    private Integer quantity;

    @Column(name = "unit_price", nullable = false)
    private Double unitPrice;

    @Column(name = "added_at", nullable = false)
    private LocalDateTime addedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(columnDefinition = "JSON")
    private String selectedVariations;

    @PrePersist
    protected void onCreate() {
        addedAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public double getSubtotal() {
        return unitPrice * quantity;
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
    
    // Check if this cart item has variation selection
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