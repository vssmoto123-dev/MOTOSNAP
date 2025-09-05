package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Booking {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private LocalDateTime scheduledDateTime;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;
    
    @Column(length = 500)
    private String notes;
    
    @Column(length = 500)
    private String statusNotes;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference("user-bookings")
    private User user; // Customer
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    @JsonBackReference
    private Vehicle vehicle;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    @JsonBackReference("service-bookings")
    private Service service;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_mechanic_id")
    @JsonBackReference("mechanic-bookings")
    private User assignedMechanic; // User with MECHANIC role
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
    
    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("booking-requests")
    private List<Request> requests = new ArrayList<>();
    
    @OneToOne(mappedBy = "booking", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("booking-invoice")
    private Invoice invoice;
    
    
    // Constructor for creating new bookings
    public Booking(LocalDateTime scheduledDateTime, String notes, User user, Vehicle vehicle, Service service) {
        this.scheduledDateTime = scheduledDateTime;
        this.notes = notes;
        this.user = user;
        this.vehicle = vehicle;
        this.service = service;
        this.status = BookingStatus.PENDING;
    }
}