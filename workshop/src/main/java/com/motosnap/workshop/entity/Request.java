package com.motosnap.workshop.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.HashMap;

@Entity
@Table(name = "requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Request {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer qty;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RequestStatus status = RequestStatus.PENDING; // Waiting for admin approval
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", nullable = false)
    private User mechanic; // User with MECHANIC role
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false)
    private Inventory part;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    @JsonBackReference("booking-requests")
    private Booking booking;
    
    @Column(columnDefinition = "JSON")
    private String selectedVariations;
    
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime requestedAt;
    
    // Constructor for creating new requests
    public Request(Integer qty, User mechanic, Inventory part, Booking booking) {
        this.qty = qty;
        this.mechanic = mechanic;
        this.part = part;
        this.booking = booking;
        this.status = RequestStatus.PENDING; // Waiting for admin approval
        this.selectedVariations = null;
    }
    
    // ===============================================================================
    // VARIATION MANAGEMENT METHODS
    // ===============================================================================
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // Get selected variations as Map
    @SuppressWarnings("unchecked")
    public Map<String, String> getSelectedVariationsMap() {
        if (this.selectedVariations == null || this.selectedVariations.trim().isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            return objectMapper.readValue(this.selectedVariations, new TypeReference<Map<String, String>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    // Set selected variations from Map
    public void setSelectedVariationsMap(Map<String, String> selectedVariationsMap) {
        if (selectedVariationsMap == null || selectedVariationsMap.isEmpty()) {
            this.selectedVariations = null;
            return;
        }
        
        try {
            this.selectedVariations = objectMapper.writeValueAsString(selectedVariationsMap);
        } catch (Exception e) {
            this.selectedVariations = null;
        }
    }
    
    // Check if this request has variation selection
    public boolean hasVariationSelection() {
        return this.selectedVariations != null && !this.selectedVariations.trim().isEmpty();
    }
    
    // Get formatted variation display string for UI
    public String getVariationDisplayString() {
        if (!hasVariationSelection()) {
            return "";
        }
        
        Map<String, String> variations = getSelectedVariationsMap();
        if (variations.isEmpty()) {
            return "";
        }
        
        return variations.entrySet().stream()
            .map(entry -> entry.getKey() + ": " + entry.getValue())
            .reduce((a, b) -> a + ", " + b)
            .orElse("");
    }
}