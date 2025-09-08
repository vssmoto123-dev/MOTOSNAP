package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestCreateDTO {
    
    @NotNull(message = "Part ID is required")
    private Long partId;
    
    @NotNull(message = "Quantity is required")
    @Positive(message = "Quantity must be positive")
    private Integer quantity;
    
    private String reason; // Optional - why this part is needed
    
    private Map<String, String> selectedVariations; // Optional - selected product variations
}