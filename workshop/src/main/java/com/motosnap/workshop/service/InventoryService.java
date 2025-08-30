package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.InventoryRequest;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.repository.InventoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {
    
    private final InventoryRepository inventoryRepository;
    
    public List<Inventory> getAllInventoryItems() {
        return inventoryRepository.findAll();
    }
    
    public Page<Inventory> getAllInventoryItems(Pageable pageable) {
        return inventoryRepository.findAll(pageable);
    }
    
    public Optional<Inventory> getInventoryItemById(Long id) {
        return inventoryRepository.findById(id);
    }
    
    public List<Inventory> searchInventoryItems(String searchTerm) {
        return inventoryRepository.findByPartNameContainingIgnoreCaseOrPartCodeContainingIgnoreCase(
            searchTerm, searchTerm
        );
    }
    
    public List<Inventory> getInventoryByCategory(String category) {
        return inventoryRepository.findByCategoryIgnoreCase(category);
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
        
        return inventoryRepository.save(inventory);
    }
    
    public void deleteInventoryItem(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new RuntimeException("Inventory item not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }
    
    public Inventory updateStock(Long id, Integer newQuantity) {
        Inventory inventory = inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        inventory.setQty(newQuantity);
        return inventoryRepository.save(inventory);
    }
    
    public boolean isLowStock(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Inventory item not found with id: " + id));
        
        return inventory.getQty() <= inventory.getMinStockLevel();
    }
}