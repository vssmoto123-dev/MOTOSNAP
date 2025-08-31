package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReceiptUploadRequest {
    
    @NotBlank(message = "Receipt image URL or path is required")
    private String receiptImagePath;
    
    @NotNull(message = "Receipt amount is required")
    private Double receiptAmount;
    
    private String notes;
}