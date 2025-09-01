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
@Table(name = "receipts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Receipt {
    
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
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference("order-receipt")
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "approved_by")
    private User approvedBy; // User with ADMIN role
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime uploadedAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime approvedAt;
    
    // Constructor for creating new receipts
    public Receipt(String fileUrl, Order order) {
        this.fileUrl = fileUrl;
        this.order = order;
        this.status = ReceiptStatus.PENDING;
    }

}