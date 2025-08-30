package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Request {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer qty;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.APPROVED; // Auto-approved per requirements
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false)
    private User mechanic; // User with MECHANIC role
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Inventory part;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime requestedAt;
    
    // Constructor for creating new requests
    public Request(Integer qty, User mechanic, Inventory part, Booking booking) {
        this.qty = qty;
        this.mechanic = mechanic;
        this.part = part;
        this.booking = booking;
        this.status = RequestStatus.APPROVED; // Auto-approved as per requirements
    }
}