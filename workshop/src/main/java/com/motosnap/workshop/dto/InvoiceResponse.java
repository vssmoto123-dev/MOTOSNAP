package com.motosnap.workshop.dto;

import com.motosnap.workshop.entity.Invoice;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private Long id;
    private String invoiceNumber;
    private BigDecimal serviceAmount;
    private BigDecimal partsAmount;
    private BigDecimal totalAmount;
    private String pdfUrl;
    private LocalDateTime generatedAt;
    
    // Booking details
    private BookingInfo booking;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookingInfo {
        private Long id;
        private String serviceName;
        private String customerName;
        private String customerEmail;
        private String vehiclePlateNo;
        private String vehicleBrand;
        private String vehicleModel;
        private String assignedMechanicName;
        private LocalDateTime scheduledDateTime;
        private LocalDateTime completedAt;
        private String notes;
        private String statusNotes;
    }
    
    // Constructor to create from Invoice entity
    public InvoiceResponse(Invoice invoice) {
        this.id = invoice.getId();
        this.invoiceNumber = invoice.getInvoiceNumber();
        this.serviceAmount = invoice.getServiceAmount();
        this.partsAmount = invoice.getPartsAmount();
        this.totalAmount = invoice.getTotalAmount();
        this.pdfUrl = invoice.getPdfUrl();
        this.generatedAt = invoice.getGeneratedAt();
        
        // Map booking details
        if (invoice.getBooking() != null) {
            var booking = invoice.getBooking();
            this.booking = new BookingInfo(
                booking.getId(),
                booking.getService().getName(),
                booking.getUser().getName(),
                booking.getUser().getEmail(),
                booking.getVehicle().getPlateNo(),
                booking.getVehicle().getBrand(),
                booking.getVehicle().getModel(),
                booking.getAssignedMechanic() != null ? booking.getAssignedMechanic().getName() : null,
                booking.getScheduledDateTime(),
                booking.getCompletedAt(),
                booking.getNotes(),
                booking.getStatusNotes()
            );
        }
    }
}