package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.BookingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingResponse {
    private Long id;
    private LocalDateTime scheduledDateTime;
    private BookingStatus status;
    private String notes;
    
    // Service information
    private Long serviceId;
    private String serviceName;
    private String serviceCategory;
    private String serviceDescription;
    private Double serviceBasePrice;
    private Integer serviceEstimatedDurationMinutes;
    
    // Vehicle information
    private Long vehicleId;
    private String vehiclePlateNo;
    private String vehicleModel;
    private String vehicleBrand;
    private Integer vehicleYear;
    
    // Customer information
    private Long customerId;
    private String customerName;
    private String customerEmail;
    
    // Mechanic information (if assigned)
    private Long assignedMechanicId;
    private String assignedMechanicName;
    
    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}