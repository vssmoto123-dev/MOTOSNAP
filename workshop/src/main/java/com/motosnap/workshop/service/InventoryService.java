package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.InventoryRequest;
import com.motosnap.workshop.dto.VariationDefinition;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;
import org.springframework.beans.factory.annotation.Value;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;
    
    @Value("${app.upload.max-file-size:5242880}")
    private long maxFileSize; // 5MB default
    
    public List<Inventory> getAllInventoryItems() {
        return inventoryRepository.findAllNonDeleted();
    }
    
    public Page<Inventory> getAllInventoryItems(Pageable pageable) {
        return inventoryRepository.findAll(pageable);
    }
    
    public Optional<Inventory> getInventoryItemById(Long id) {
        return inventoryRepository.findByIdAndNotDeleted(id);
    }
    
    public List<Inventory> searchInventoryItems(String searchTerm) {
        return inventoryRepository.findByPartNameContainingIgnoreCaseOrPartCodeContainingIgnoreCaseAndNotDeleted(
            searchTerm, searchTerm
        );
    }
    
    public List<Inventory> getInventoryByCategory(String category) {
        return inventoryRepository.findByCategoryIgnoreCaseAndNotDeleted(category);
    }
    
    public List<Inventory> getLowStockItems() {
        return inventoryRepository.findLowStockItems();
    }
    
    public Inventory createInventoryItem(InventoryRequest request) {
        // Check if part code already exists
        if (inventoryRepository.existsByPartCode(request.getPartCode())) {
            throw new RuntimeException("Part code already exists: " + request.getPartCode());
        }
        
        Inventory inventory = new Inventory();
        inventory.setPartName(request.getPartName());
        inventory.setPartCode(request.getPartCode());
        inventory.setDescription(request.getDescription());
        inventory.setQty(request.getQty());
        inventory.setUnitPrice(BigDecimal.valueOf(request.getUnitPrice()));
        inventory.setMinStockLevel(request.getMinStockLevel());
        inventory.setCategory(request.getCategory());
        inventory.setBrand(request.getBrand());
        inventory.setImageUrl(request.getImageUrl());
        
        // Handle variations if provided
        if (request.getVariations() != null && !request.getVariations().isEmpty()) {
            Map<String, Object> variationData = convertVariationDefinitionsToMap(request.getVariations());
            inventory.setVariationDefinitions(variationData);
            
            // Initialize variation stock if stock allocations are provided
            if (request.getVariationStock() != null && !request.getVariationStock().isEmpty()) {
                Map<String, Object> stockData = new HashMap<>();
                stockData.put("trackByVariation", true);
                stockData.put("allocations", request.getVariationStock());
                
                // Calculate unallocated stock
                int totalAllocated = request.getVariationStock().values().stream()
                    .mapToInt(Integer::intValue).sum();
                int unallocated = Math.max(0, request.getQty() - totalAllocated);
                stockData.put("unallocated", unallocated);
                
                inventory.setVariationStockData(stockData);
            } else {
                // Default: all stock is unallocated for new varied products
                Map<String, Object> stockData = new HashMap<>();
                stockData.put("trackByVariation", true);
                stockData.put("allocations", new HashMap<String, Integer>());
                stockData.put("unallocated", request.getQty());
                inventory.setVariationStockData(stockData);
            }
        }
        
        return inventoryRepository.save(inventory);
    }
    
    public Inventory updateInventoryItem(Long id, InventoryRequest request) {
        Inventory inventory = inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        // Check if part code already exists for different item
        if (!inventory.getPartCode().equals(request.getPartCode()) && 
            inventoryRepository.existsByPartCode(request.getPartCode())) {
            throw new RuntimeException("Part code already exists: " + request.getPartCode());
        }
        
        inventory.setPartName(request.getPartName());
        inventory.setPartCode(request.getPartCode());
        inventory.setDescription(request.getDescription());
        inventory.setQty(request.getQty());
        inventory.setUnitPrice(BigDecimal.valueOf(request.getUnitPrice()));
        inventory.setMinStockLevel(request.getMinStockLevel());
        inventory.setCategory(request.getCategory());
        inventory.setBrand(request.getBrand());
        if (request.getImageUrl() != null) {
            inventory.setImageUrl(request.getImageUrl());
        }
        
        // Handle variations update
        if (request.getVariations() != null && !request.getVariations().isEmpty()) {
            Map<String, Object> variationData = convertVariationDefinitionsToMap(request.getVariations());
            inventory.setVariationDefinitions(variationData);
            
            // Update variation stock if provided
            if (request.getVariationStock() != null && !request.getVariationStock().isEmpty()) {
                Map<String, Object> existingStockData = inventory.getVariationStockData();
                
                Map<String, Object> stockData = new HashMap<>();
                stockData.put("trackByVariation", true);
                stockData.put("allocations", request.getVariationStock());
                
                // Calculate unallocated stock
                int totalAllocated = request.getVariationStock().values().stream()
                    .mapToInt(Integer::intValue).sum();
                int unallocated = Math.max(0, request.getQty() - totalAllocated);
                stockData.put("unallocated", unallocated);
                
                inventory.setVariationStockData(stockData);
            }
        } else {
            // Remove variations if not provided
            inventory.setVariationDefinitions(null);
            inventory.setVariationStockData(null);
        }
        
        return inventoryRepository.save(inventory);
    }
    
    public void deleteInventoryItem(Long id) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        // Perform soft delete (no dependency checks - safe to delete with references)
        inventory.markAsDeleted();
        inventoryRepository.save(inventory);
        
        // Optional: Clean up active cart items referencing this deleted inventory
        cleanupCartItemsForDeletedInventory(id);
    }
    
    private void cleanupCartItemsForDeletedInventory(Long inventoryId) {
        // Find all cart items that reference this inventory
        // Note: We use the full repository to access all items, including those with deleted inventory
        var cartItems = inventoryRepository.findById(inventoryId)
            .map(inventory -> inventory.getOrderItems()) // This would need a CartItem relationship
            .orElse(new ArrayList<>());
            
        // For now, we'll let cart items remain as they provide historical context
        // Future enhancement could remove them or mark them as "unavailable"
        System.out.println("DEBUG: Inventory item " + inventoryId + " soft deleted. Cart items remain for historical reference.");
    }
    
    public void softDeleteInventoryItem(Long id) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        inventory.markAsDeleted();
        inventoryRepository.save(inventory);
    }
    
    public void restoreInventoryItem(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        if (!inventory.getDeleted()) {
            throw new RuntimeException("Inventory item is not deleted");
        }
        
        inventory.restore();
        inventoryRepository.save(inventory);
    }
    
    public List<Inventory> getDeletedItems() {
        return inventoryRepository.findDeletedItems();
    }
    
    public DependencyInfo checkDependencies(Long inventoryId) {
        long orderItems = inventoryRepository.countOrderItemsForInventory(inventoryId);
        long cartItems = inventoryRepository.countCartItemsForInventory(inventoryId);
        long requests = inventoryRepository.countRequestsForInventory(inventoryId);
        
        return new DependencyInfo(orderItems, cartItems, requests);
    }
    
    // Inner class to represent dependency information
    public static class DependencyInfo {
        private final long orderItems;
        private final long cartItems;
        private final long requests;
        
        public DependencyInfo(long orderItems, long cartItems, long requests) {
            this.orderItems = orderItems;
            this.cartItems = cartItems;
            this.requests = requests;
        }
        
        public boolean hasDependencies() {
            return orderItems > 0 || cartItems > 0 || requests > 0;
        }
        
        public String getDependencyDescription() {
            StringBuilder desc = new StringBuilder();
            if (orderItems > 0) {
                desc.append(orderItems).append(" order(s)");
            }
            if (cartItems > 0) {
                if (desc.length() > 0) desc.append(", ");
                desc.append(cartItems).append(" cart item(s)");
            }
            if (requests > 0) {
                if (desc.length() > 0) desc.append(", ");
                desc.append(requests).append(" request(s)");
            }
            return desc.toString();
        }
        
        public long getOrderItems() { return orderItems; }
        public long getCartItems() { return cartItems; }
        public long getRequests() { return requests; }
    }
    
    public Inventory updateStock(Long id, Integer newQuantity) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        inventory.setQty(newQuantity);
        return inventoryRepository.save(inventory);
    }
    
    public boolean isLowStock(Long id) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        return inventory.getQty() <= inventory.getMinStockLevel();
    }
    
    public String uploadImage(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        // Check file size
        if (file.getSize() > maxFileSize) {
            throw new RuntimeException("File size exceeds maximum allowed size of " + (maxFileSize / 1024 / 1024) + "MB");
        }
        
        // Check file type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new RuntimeException("Only image files are allowed");
        }
        
        // Allowed image types
        if (!contentType.equals("image/jpeg") && 
            !contentType.equals("image/jpg") && 
            !contentType.equals("image/png") && 
            !contentType.equals("image/gif") && 
            !contentType.equals("image/webp")) {
            throw new RuntimeException("Unsupported image format. Allowed: JPEG, PNG, GIF, WebP");
        }
        
        try {
            // Create upload directory if it doesn't exist
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            
            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                fileExtension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + fileExtension;
            
            // Save file
            Path filePath = uploadPath.resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            
            // Return the relative URL path
            return "/uploads/" + filename;
            
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }
    
    public String updateInventoryImage(Long id, MultipartFile file) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        // Upload new image
        String imageUrl = uploadImage(file);
        
        // Delete old image if it exists
        if (inventory.getImageUrl() != null && !inventory.getImageUrl().isEmpty()) {
            deleteImageFile(inventory.getImageUrl());
        }
        
        // Update inventory with new image URL
        inventory.setImageUrl(imageUrl);
        inventoryRepository.save(inventory);
        
        return imageUrl;
    }
    
    private void deleteImageFile(String imageUrl) {
        try {
            if (imageUrl.startsWith("/uploads/")) {
                String filename = imageUrl.substring("/uploads/".length());
                Path filePath = Paths.get(uploadDir).resolve(filename);
                if (Files.exists(filePath)) {
                    Files.delete(filePath);
                }
            }
        } catch (IOException e) {
            // Log error but don't throw exception to not interrupt the main operation
            System.err.println("Failed to delete old image file: " + e.getMessage());
        }
    }
    
    // ===============================================================================
    // VARIATION-AWARE METHODS
    // ===============================================================================
    
    // Convert VariationDefinition list to Map for JSON storage
    private Map<String, Object> convertVariationDefinitionsToMap(List<VariationDefinition> variations) {
        Map<String, Object> result = new HashMap<>();
        result.put("hasVariations", true);
        
        List<Map<String, Object>> options = new ArrayList<>();
        for (VariationDefinition variation : variations) {
            Map<String, Object> option = new HashMap<>();
            option.put("id", variation.getId());
            option.put("name", variation.getName());
            option.put("type", variation.getType());
            option.put("values", variation.getValues());
            option.put("required", variation.isRequired());
            options.add(option);
        }
        
        result.put("options", options);
        return result;
    }
    
    // Allocate stock to specific variation
    public void allocateStockToVariation(Long inventoryId, String variationKey, Integer quantity) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            throw new RuntimeException("Cannot allocate stock to variations for non-varied product");
        }
        
        inventory.updateVariationStock(variationKey, quantity);
        inventoryRepository.save(inventory);
    }
    
    // Reallocate stock across variations
    public void reallocateStock(Long inventoryId, Map<String, Integer> newAllocations) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            throw new RuntimeException("Cannot reallocate stock for non-varied product");
        }
        
        // Calculate total allocated
        int totalAllocated = newAllocations.values().stream().mapToInt(Integer::intValue).sum();
        
        if (totalAllocated > inventory.getQty()) {
            throw new RuntimeException("Total allocated stock (" + totalAllocated + 
                ") cannot exceed total stock (" + inventory.getQty() + ")");
        }
        
        // Update variation stock data
        Map<String, Object> stockData = new HashMap<>();
        stockData.put("trackByVariation", true);
        stockData.put("allocations", newAllocations);
        stockData.put("unallocated", inventory.getQty() - totalAllocated);
        
        inventory.setVariationStockData(stockData);
        inventoryRepository.save(inventory);
    }
    
    // Get variation stock summary
    public Map<String, Integer> getVariationStockSummary(Long inventoryId) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            return Map.of("total", inventory.getQty());
        }
        
        Map<String, Object> stockData = inventory.getVariationStockData();
        Map<String, Integer> result = new HashMap<>();
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> allocations = (Map<String, Integer>) stockData.get("allocations");
        if (allocations != null) {
            result.putAll(allocations);
        }
        
        Integer unallocated = (Integer) stockData.get("unallocated");
        if (unallocated != null && unallocated > 0) {
            result.put("unallocated", unallocated);
        }
        
        result.put("total", inventory.getQty());
        return result;
    }
    
    // Validate variation selection against inventory
    public boolean validateVariationSelection(Long inventoryId, Map<String, String> selectedVariations) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            return selectedVariations == null || selectedVariations.isEmpty();
        }
        
        if (selectedVariations == null || selectedVariations.isEmpty()) {
            return false; // Varied products must have variations selected
        }
        
        Map<String, Object> variationDefs = inventory.getVariationDefinitions();
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> options = (List<Map<String, Object>>) variationDefs.get("options");
        
        if (options == null) {
            return false;
        }
        
        // Check each selected variation against definitions
        for (Map<String, Object> option : options) {
            String optionId = (String) option.get("id");
            Boolean required = (Boolean) option.get("required");
            @SuppressWarnings("unchecked")
            List<String> validValues = (List<String>) option.get("values");
            
            String selectedValue = selectedVariations.get(optionId);
            
            // Check required variations
            if (required != null && required && selectedValue == null) {
                return false;
            }
            
            // Check valid values
            if (selectedValue != null && validValues != null && !validValues.contains(selectedValue)) {
                return false;
            }
        }
        
        return true;
    }
    
    // Check stock availability for specific variation
    public boolean checkVariationStockAvailability(Long inventoryId, Map<String, String> selectedVariations, Integer quantity) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            return inventory.getQty() >= quantity;
        }
        
        String variationKey = Inventory.buildVariationKey(selectedVariations);
        Integer availableStock = inventory.getAvailableStockForVariation(variationKey);
        
        return availableStock >= quantity;
    }
    
    // Deduct stock for specific variation (used during order processing)
    public void deductVariationStock(Long inventoryId, Map<String, String> selectedVariations, Integer quantity) {
        Inventory inventory = inventoryRepository.findByIdAndNotDeleted(inventoryId)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + inventoryId));
        
        if (!inventory.hasVariations()) {
            inventory.deductStock(quantity);
        } else {
            String variationKey = Inventory.buildVariationKey(selectedVariations);
            inventory.deductVariationStock(variationKey, quantity);
        }
        
        inventoryRepository.save(inventory);
    }
}