package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Inventory {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 100)
    private String partName;
    
    @Column(length = 50)
    private String partCode;
    
    @Column(length = 255)
    private String description;
    
    @Column(nullable = false)
    private Integer qty = 0;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(nullable = false)
    private Integer minStockLevel = 5; // Low stock threshold
    
    @Column(length = 50)
    private String category;
    
    @Column(length = 50)
    private String brand;
    
    @Column(nullable = false)
    private Boolean active = true;
    
    @Column(nullable = false)
    private Boolean deleted = false;
    
    @Column(length = 500)
    private String imageUrl;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "part", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<OrderItem> orderItems = new ArrayList<>();
    
    @OneToMany(mappedBy = "part", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Request> requests = new ArrayList<>();
    
    // Constructor for creating new parts
    public Inventory(String partName, String partCode, String description, Integer qty, 
                    BigDecimal unitPrice, Integer minStockLevel, String category, String brand) {
        this.partName = partName;
        this.partCode = partCode;
        this.description = description;
        this.qty = qty;
        this.unitPrice = unitPrice;
        this.minStockLevel = minStockLevel;
        this.category = category;
        this.brand = brand;
        this.active = true;
        this.deleted = false;
        this.imageUrl = null;
    }
    
    // Helper method to check if stock is low
    public boolean isLowStock() {
        return this.qty <= this.minStockLevel;
    }
    
    // Helper method to deduct stock
    public void deductStock(Integer quantity) {
        if (this.qty >= quantity) {
            this.qty -= quantity;
        } else {
            throw new IllegalArgumentException("Insufficient stock. Available: " + this.qty + ", Requested: " + quantity);
        }
    }
    
    // Helper method to add stock
    public void addStock(Integer quantity) {
        this.qty += quantity;
    }
    
    // Helper method for soft delete
    public void markAsDeleted() {
        this.deleted = true;
        this.active = false;
    }
    
    // Helper method to restore from soft delete
    public void restore() {
        this.deleted = false;
        this.active = true;
    }
}