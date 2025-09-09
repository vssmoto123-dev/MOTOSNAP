package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Integer quantity;
    private Double unitPrice;
    private LocalDateTime addedAt;
    private InventoryResponse inventory;
    
    // Variation information
    private Map<String, String> selectedVariations;
    private String selectedVariationsDisplay; // Formatted for UI display
    
    public double getSubtotal() {
        return unitPrice * quantity;
    }
}