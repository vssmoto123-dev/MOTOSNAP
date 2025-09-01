package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.InventoryRequest;
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
}