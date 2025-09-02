package com.motosnap.workshop.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ServiceDTO {
    private Long id;
    private String name;
    private String category;
    private String description;
    private BigDecimal basePrice;
    private Integer estimatedDurationMinutes;
    private Boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Constructor for converting from Service entity
    public ServiceDTO(com.motosnap.workshop.entity.Service service) {
        this.id = service.getId();
        this.name = service.getName();
        this.category = service.getCategory();
        this.description = service.getDescription();
        this.basePrice = service.getBasePrice();
        this.estimatedDurationMinutes = service.getEstimatedDurationMinutes();
        this.active = service.getActive();
        this.createdAt = service.getCreatedAt();
        this.updatedAt = service.getUpdatedAt();
    }
}