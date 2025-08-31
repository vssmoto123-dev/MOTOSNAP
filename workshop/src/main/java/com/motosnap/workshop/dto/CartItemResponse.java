package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Integer quantity;
    private Double unitPrice;
    private LocalDateTime addedAt;
    private InventoryResponse inventory;
    
    public double getSubtotal() {
        return unitPrice * quantity;
    }
}