package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true, length = 20)
    private String plateNo;
    
    @Column(nullable = false, length = 100)
    private String model;
    
    @Column(nullable = false, length = 50)
    private String brand;
    
    private Integer year;
    
    @Column(length = 50)
    private String color;
    
    @Column(length = 20)
    private String engineCapacity;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonBackReference
    private User user;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    @UpdateTimestamp
    private LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "vehicle", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Booking> bookings = new ArrayList<>();
    
    // Constructor for creating new vehicles
    public Vehicle(String plateNo, String model, String brand, Integer year, String color, String engineCapacity, User user) {
        this.plateNo = plateNo;
        this.model = model;
        this.brand = brand;
        this.year = year;
        this.color = color;
        this.engineCapacity = engineCapacity;
        this.user = user;
    }
}