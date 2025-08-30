package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItem {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer qty;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // Price at time of order
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Inventory part;
    
    // Constructor for creating new order items
    public OrderItem(Integer qty, BigDecimal price, Order order, Inventory part) {
        this.qty = qty;
        this.price = price;
        this.order = order;
        this.part = part;
    }
    
    // Helper method to calculate total price
    public BigDecimal getTotalPrice() {
        return price.multiply(BigDecimal.valueOf(qty));
    }
}