package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 50)
    private String invoiceNumber;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal serviceAmount;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal partsAmount = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;
    
    @Column(length = 500)
    private String pdfUrl;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime generatedAt;
    
    // Constructor for creating new invoices
    public Invoice(String invoiceNumber, BigDecimal serviceAmount, BigDecimal partsAmount, Booking booking) {
        this.invoiceNumber = invoiceNumber;
        this.serviceAmount = serviceAmount;
        this.partsAmount = partsAmount != null ? partsAmount : BigDecimal.ZERO;
        this.totalAmount = this.serviceAmount.add(this.partsAmount);
        this.booking = booking;
    }
    
    // Helper method to recalculate total
    public void recalculateTotal() {
        this.totalAmount = this.serviceAmount.add(this.partsAmount);
    }
}