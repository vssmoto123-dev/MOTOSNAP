package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemResponse {
    private Long id;
    private int qty;
    private BigDecimal price;
    private InventoryResponse part;
    
    // Variation information
    private Map<String, String> selectedVariations;
    private String selectedVariationsDisplay; // Formatted for UI display
}