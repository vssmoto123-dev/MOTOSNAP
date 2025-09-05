package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceReceipt {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 500)
    private String fileUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReceiptStatus status = ReceiptStatus.PENDING;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal amount;
    
    @Column(length = 1000)
    private String notes;
    
    @Column(length = 255)
    private String adminNotes;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_payment_id", nullable = false)
    @JsonBackReference("invoicePayment-receipt")
    private InvoicePayment invoicePayment;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime approvedAt;
    
    // Constructor for creating new invoice receipts
    public InvoiceReceipt(String fileUrl, BigDecimal amount, String notes, InvoicePayment invoicePayment) {
        this.fileUrl = fileUrl;
        this.amount = amount;
        this.notes = notes;
        this.invoicePayment = invoicePayment;
        this.status = ReceiptStatus.PENDING;
    }
}