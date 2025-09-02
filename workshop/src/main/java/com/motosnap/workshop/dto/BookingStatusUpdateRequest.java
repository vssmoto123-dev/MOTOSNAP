package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.BookingStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotNull;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookingStatusUpdateRequest {
    
    @NotNull(message = "Status is required")
    private BookingStatus status;
    
    private Long assignedMechanicId; // Optional - for assigning mechanic
    private String statusNotes; // Optional - notes about status change
}