package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "services")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Service {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String name;
    
    @Column(nullable = false, length = 50)
    private String category;
    
    @Column(length = 255)
    private String description;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal basePrice;
    
    @Column(nullable = false)
    private Integer estimatedDurationMinutes = 60; // Default 1 hour
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference
    private List<PricingRule> pricingRules = new ArrayList<>();
    
    @OneToMany(mappedBy = "service", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
    
    // Constructor for creating new services
    public Service(String name, String category, String description, BigDecimal basePrice, Integer estimatedDurationMinutes) {
        this.name = name;
        this.category = category;
        this.description = description;
        this.basePrice = basePrice;
        this.estimatedDurationMinutes = estimatedDurationMinutes;
        this.active = true;
    }
}