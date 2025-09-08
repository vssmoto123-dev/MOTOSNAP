package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.RequestStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequestResponseDTO {
    
    private Long id;
    private Integer quantity;
    private RequestStatus status;
    private String reason;
    private LocalDateTime requestedAt;
    
    // Part information
    private Long partId;
    private String partName;
    private String partCategory;
    private Double partPrice;
    private Integer availableStock;
    
    // Mechanic information
    private Long mechanicId;
    private String mechanicName;
    
    // Booking information
    private Long bookingId;
    private String serviceName;
    private String customerName;
    private String vehiclePlateNo;
    
    // Variation information
    private Map<String, String> selectedVariations;
    private String selectedVariationsDisplay; // Formatted for UI display
}