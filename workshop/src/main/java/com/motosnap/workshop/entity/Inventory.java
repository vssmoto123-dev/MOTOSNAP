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
import java.util.Map;
import java.util.HashMap;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    
    @Column(columnDefinition = "JSON")
    private String variations;
    
    @Column(columnDefinition = "JSON")
    private String variationStock;
    
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
        this.variations = null;
        this.variationStock = null;
    }
    
    // Helper method to check if stock is low (variation-aware)
    public boolean isLowStock() {
        if (!hasVariations()) {
            return this.qty <= this.minStockLevel;
        }
        
        Map<String, Object> stockData = getVariationStockData();
        if (stockData.isEmpty()) {
            return this.qty <= this.minStockLevel;
        }
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> allocations = (Map<String, Integer>) stockData.get("allocations");
        if (allocations == null || allocations.isEmpty()) {
            return this.qty <= this.minStockLevel;
        }
        
        // Check if any variation is below its proportional threshold
        int totalVariations = allocations.size();
        int perVariationThreshold = Math.max(1, this.minStockLevel / totalVariations);
        
        for (Integer allocation : allocations.values()) {
            if (allocation != null && allocation <= perVariationThreshold) {
                return true;
            }
        }
        
        // Also check unallocated stock
        Integer unallocated = (Integer) stockData.get("unallocated");
        if (unallocated != null && unallocated <= perVariationThreshold) {
            return true;
        }
        
        return false;
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
    
    // ===============================================================================
    // VARIATION MANAGEMENT METHODS
    // ===============================================================================
    
    private static final ObjectMapper objectMapper = new ObjectMapper();
    
    // Check if this product has variations defined
    public boolean hasVariations() {
        return this.variations != null && !this.variations.trim().isEmpty();
    }
    
    // Get variation definitions as Map
    @SuppressWarnings("unchecked")
    public Map<String, Object> getVariationDefinitions() {
        if (!hasVariations()) {
            return new HashMap<>();
        }
        
        try {
            return objectMapper.readValue(this.variations, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    // Set variation definitions from Map
    public void setVariationDefinitions(Map<String, Object> variationDefinitions) {
        if (variationDefinitions == null || variationDefinitions.isEmpty()) {
            this.variations = null;
            return;
        }
        
        try {
            this.variations = objectMapper.writeValueAsString(variationDefinitions);
        } catch (Exception e) {
            this.variations = null;
        }
    }
    
    // Get variation stock data as Map
    @SuppressWarnings("unchecked")
    public Map<String, Object> getVariationStockData() {
        if (this.variationStock == null || this.variationStock.trim().isEmpty()) {
            return new HashMap<>();
        }
        
        try {
            return objectMapper.readValue(this.variationStock, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            return new HashMap<>();
        }
    }
    
    // Set variation stock data from Map
    public void setVariationStockData(Map<String, Object> variationStockData) {
        if (variationStockData == null || variationStockData.isEmpty()) {
            this.variationStock = null;
            return;
        }
        
        try {
            this.variationStock = objectMapper.writeValueAsString(variationStockData);
        } catch (Exception e) {
            this.variationStock = null;
        }
    }
    
    // Get available stock for a specific variation
    public Integer getAvailableStockForVariation(String variationKey) {
        if (!hasVariations() || variationKey == null) {
            return this.qty; // Return total stock for non-varied products
        }
        
        Map<String, Object> stockData = getVariationStockData();
        if (stockData.isEmpty()) {
            return this.qty; // If no variation stock data, return total
        }
        
        // Get allocations map
        @SuppressWarnings("unchecked")
        Map<String, Integer> allocations = (Map<String, Integer>) stockData.get("allocations");
        if (allocations == null) {
            allocations = new HashMap<>();
        }
        
        // Get unallocated stock
        Integer unallocated = (Integer) stockData.get("unallocated");
        if (unallocated == null) {
            unallocated = 0;
        }
        
        // Direct allocation for this variation
        Integer directStock = allocations.get(variationKey);
        if (directStock == null) {
            directStock = 0;
        }
        
        // Return direct + unallocated (flexible stock)
        return directStock + unallocated;
    }
    
    // Update stock for a specific variation
    public void updateVariationStock(String variationKey, Integer quantity) {
        if (!hasVariations() || variationKey == null) {
            return; // Can't update variation stock for non-varied products
        }
        
        Map<String, Object> stockData = getVariationStockData();
        
        // Initialize stock data if empty
        if (stockData.isEmpty()) {
            stockData.put("trackByVariation", true);
            stockData.put("allocations", new HashMap<String, Integer>());
            stockData.put("unallocated", this.qty);
        }
        
        // Get allocations map
        @SuppressWarnings("unchecked")
        Map<String, Integer> allocations = (Map<String, Integer>) stockData.get("allocations");
        if (allocations == null) {
            allocations = new HashMap<>();
            stockData.put("allocations", allocations);
        }
        
        // Update the allocation
        allocations.put(variationKey, quantity);
        
        // Save back to JSON
        setVariationStockData(stockData);
    }
    
    // Deduct stock from a specific variation
    public void deductVariationStock(String variationKey, Integer quantity) {
        if (!hasVariations()) {
            // For non-varied products, use existing deductStock method
            deductStock(quantity);
            return;
        }
        
        Integer availableForVariation = getAvailableStockForVariation(variationKey);
        if (availableForVariation < quantity) {
            throw new IllegalArgumentException(
                "Insufficient stock for variation '" + variationKey + "'. Available: " + 
                availableForVariation + ", Requested: " + quantity
            );
        }
        
        Map<String, Object> stockData = getVariationStockData();
        @SuppressWarnings("unchecked")
        Map<String, Integer> allocations = (Map<String, Integer>) stockData.get("allocations");
        
        Integer currentAllocation = allocations.get(variationKey);
        if (currentAllocation != null && currentAllocation >= quantity) {
            // Deduct from direct allocation
            allocations.put(variationKey, currentAllocation - quantity);
        } else {
            // Deduct from unallocated pool
            Integer unallocated = (Integer) stockData.get("unallocated");
            if (unallocated != null && unallocated > 0) {
                int toDeductFromUnallocated = quantity - (currentAllocation != null ? currentAllocation : 0);
                stockData.put("unallocated", unallocated - toDeductFromUnallocated);
                
                if (currentAllocation != null) {
                    allocations.put(variationKey, 0);
                }
            }
        }
        
        // Also deduct from main qty
        this.qty -= quantity;
        
        // Save variation stock data
        setVariationStockData(stockData);
    }
    
    // Build variation key from selected variations map
    public static String buildVariationKey(Map<String, String> selectedVariations) {
        if (selectedVariations == null || selectedVariations.isEmpty()) {
            return "";
        }
        
        // Sort by key to ensure consistent ordering
        return selectedVariations.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .map(entry -> entry.getKey() + ":" + entry.getValue())
            .reduce((a, b) -> a + "," + b)
            .orElse("");
    }
    
    // Parse variation key back to map
    public static Map<String, String> parseVariationKey(String variationKey) {
        Map<String, String> result = new HashMap<>();
        
        if (variationKey == null || variationKey.trim().isEmpty()) {
            return result;
        }
        
        String[] pairs = variationKey.split(",");
        for (String pair : pairs) {
            String[] keyValue = pair.split(":", 2);
            if (keyValue.length == 2) {
                result.put(keyValue[0], keyValue[1]);
            }
        }
        
        return result;
    }
    
}