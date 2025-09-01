package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.InventoryRequest;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    @GetMapping
    public ResponseEntity<List<Inventory>> getAllInventoryItems(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean lowStock) {
        
        try {
            List<Inventory> items;
            
            if (lowStock) {
                items = inventoryService.getLowStockItems();
            } else if (search != null && !search.trim().isEmpty()) {
                items = inventoryService.searchInventoryItems(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                items = inventoryService.getInventoryByCategory(category.trim());
            } else {
                items = inventoryService.getAllInventoryItems();
            }
            
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<Inventory>> getAllInventoryItemsPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "partName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Inventory> items = inventoryService.getAllInventoryItems(pageable);
            
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Inventory> getInventoryItemById(@PathVariable Long id) {
        try {
            return inventoryService.getInventoryItemById(id)
                .map(item -> ResponseEntity.ok(item))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createInventoryItem(@Valid @RequestBody InventoryRequest request) {
        try {
            Inventory createdItem = inventoryService.createInventoryItem(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdItem);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create inventory item"));
        }
    }
    
    @PostMapping(value = "/upload-image", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadInventoryImage(@RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = inventoryService.uploadImage(file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to upload image"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateInventoryItem(
            @PathVariable Long id, 
            @Valid @RequestBody InventoryRequest request) {
        try {
            Inventory updatedItem = inventoryService.updateInventoryItem(id, request);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update inventory item"));
        }
    }
    
    @PutMapping(value = "/{id}/image", consumes = "multipart/form-data")
    public ResponseEntity<?> updateInventoryImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {
        try {
            String imageUrl = inventoryService.updateInventoryImage(id, file);
            return ResponseEntity.ok(Map.of("imageUrl", imageUrl));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update inventory image"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteInventoryItem(@PathVariable Long id) {
        try {
            inventoryService.deleteInventoryItem(id);
            return ResponseEntity.ok(Map.of(
                "message", "Inventory item archived successfully",
                "action", "soft_delete",
                "note", "Item is archived but references in orders/carts remain intact"
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete inventory item"));
        }
    }
    
    @PostMapping("/{id}/soft-delete")
    public ResponseEntity<?> softDeleteInventoryItem(@PathVariable Long id) {
        try {
            inventoryService.softDeleteInventoryItem(id);
            return ResponseEntity.ok(Map.of(
                "message", "Inventory item archived successfully",
                "action", "soft_delete"
            ));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PostMapping("/{id}/restore")
    public ResponseEntity<?> restoreInventoryItem(@PathVariable Long id) {
        try {
            inventoryService.restoreInventoryItem(id);
            return ResponseEntity.ok(Map.of(
                "message", "Inventory item restored successfully",
                "action", "restore"
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/deleted")
    public ResponseEntity<List<Inventory>> getDeletedItems() {
        try {
            List<Inventory> deletedItems = inventoryService.getDeletedItems();
            return ResponseEntity.ok(deletedItems);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}/dependencies")
    public ResponseEntity<?> checkDependencies(@PathVariable Long id) {
        try {
            var dependencies = inventoryService.checkDependencies(id);
            return ResponseEntity.ok(Map.of(
                "hasDependencies", dependencies.hasDependencies(),
                "orderItems", dependencies.getOrderItems(),
                "cartItems", dependencies.getCartItems(),
                "requests", dependencies.getRequests(),
                "description", dependencies.getDependencyDescription(),
                "canDelete", !dependencies.hasDependencies()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @PutMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> request) {
        try {
            Integer newQuantity = request.get("quantity");
            if (newQuantity == null || newQuantity < 0) {
                return ResponseEntity.badRequest()
                    .body(Map.of("error", "Valid quantity is required"));
            }
            
            Inventory updatedItem = inventoryService.updateStock(id, newQuantity);
            return ResponseEntity.ok(updatedItem);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update stock"));
        }
    }
    
    @GetMapping("/{id}/low-stock-check")
    public ResponseEntity<Map<String, Boolean>> checkLowStock(@PathVariable Long id) {
        try {
            boolean isLowStock = inventoryService.isLowStock(id);
            return ResponseEntity.ok(Map.of("isLowStock", isLowStock));
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}