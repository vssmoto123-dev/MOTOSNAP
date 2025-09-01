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
@Table(name = "pricing_rules", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"service_id", "vehicle_category"}))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PricingRule {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 50)
    private String vehicleCategory; // e.g., "SMALL", "MEDIUM", "LARGE", "SPORTS"
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonBackReference
    private Service service;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    // Constructor for creating new pricing rules
    public PricingRule(String vehicleCategory, BigDecimal price, Service service) {
        this.vehicleCategory = vehicleCategory;
        this.price = price;
        this.service = service;
    }
}