package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.InvoicePaymentStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoicePaymentResponseDTO {
    
    private Long id;
    private InvoicePaymentStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Invoice information
    private InvoiceInfoDTO invoice;
    
    // Receipt information (if exists)
    private ReceiptInfoDTO receipt;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InvoiceInfoDTO {
        private Long id;
        private String invoiceNumber;
        private BigDecimal serviceAmount;
        private BigDecimal partsAmount;
        private BigDecimal totalAmount;
        private LocalDateTime generatedAt;
        
        // Booking information
        private BookingInfoDTO booking;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingInfoDTO {
        private Long id;
        private String customerName;
        private String serviceName;
        private String vehiclePlateNo;
        private String vehicleBrand;
        private String vehicleModel;
        private LocalDateTime scheduledDateTime;
        private String assignedMechanicName;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReceiptInfoDTO {
        private Long id;
        private BigDecimal amount;
        private String fileUrl;
        private String notes;
        private String adminNotes;
        private String status;
        private LocalDateTime uploadedAt;
    }
}