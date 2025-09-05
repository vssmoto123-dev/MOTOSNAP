package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private String partName;
    private String partCode;
    private String description;
    private Integer qty;
    private BigDecimal unitPrice;
    private String category;
    private String brand;
    private Boolean active;
    private String imageUrl;
}