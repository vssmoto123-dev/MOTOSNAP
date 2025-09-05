package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

@Entity
@Table(name = "invoice_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class InvoicePayment {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvoicePaymentStatus status = InvoicePaymentStatus.PENDING;
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id", nullable = false)
    private Invoice invoice;
    
    @OneToOne(mappedBy = "invoicePayment", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("invoicePayment-receipt")
    private InvoiceReceipt receipt;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Constructor for creating new invoice payments
    public InvoicePayment(Invoice invoice) {
        this.invoice = invoice;
        this.status = InvoicePaymentStatus.PENDING;
    }
}