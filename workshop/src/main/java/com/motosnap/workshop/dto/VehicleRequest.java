package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {
    
    @NotBlank(message = "Plate number is required")
    private String plateNo;
    
    @NotBlank(message = "Model is required")
    private String model;
    
    @NotBlank(message = "Brand is required") 
    private String brand;
    
    @NotNull(message = "Year is required")
    private Integer year;
    
    private String color;
    private String engineCapacity;
}