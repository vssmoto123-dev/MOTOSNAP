package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.ServiceRequest;
import com.motosnap.workshop.entity.Service;
import com.motosnap.workshop.service.ServiceManagementService;
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

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class ServiceController {
    
    private final ServiceManagementService serviceManagementService;
    
    @GetMapping
    public ResponseEntity<List<Service>> getAllServices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String category) {
        
        try {
            List<Service> services;
            
            if (search != null && !search.trim().isEmpty()) {
                services = serviceManagementService.searchServices(search.trim());
            } else if (category != null && !category.trim().isEmpty()) {
                services = serviceManagementService.getServicesByCategory(category.trim());
            } else {
                services = serviceManagementService.getAllServices();
            }
            
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/paginated")
    public ResponseEntity<Page<Service>> getAllServicesPaginated(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        
        try {
            Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
            
            Pageable pageable = PageRequest.of(page, size, sort);
            Page<Service> services = serviceManagementService.getAllServices(pageable);
            
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Service> getServiceById(@PathVariable Long id) {
        try {
            return serviceManagementService.getServiceById(id)
                .map(service -> ResponseEntity.ok(service))
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        try {
            List<String> categories = serviceManagementService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/price-range")
    public ResponseEntity<List<Service>> getServicesByPriceRange(
            @RequestParam Double minPrice,
            @RequestParam Double maxPrice) {
        
        try {
            if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
                return ResponseEntity.badRequest().build();
            }
            
            List<Service> services = serviceManagementService.getServicesByPriceRange(minPrice, maxPrice);
            return ResponseEntity.ok(services);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<?> createService(@Valid @RequestBody ServiceRequest request) {
        try {
            Service createdService = serviceManagementService.createService(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdService);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to create service"));
        }
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<?> updateService(
            @PathVariable Long id, 
            @Valid @RequestBody ServiceRequest request) {
        try {
            Service updatedService = serviceManagementService.updateService(id, request);
            return ResponseEntity.ok(updatedService);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to update service"));
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteService(@PathVariable Long id) {
        try {
            serviceManagementService.deleteService(id);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException e) {
            if (e.getMessage().contains("not found")) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Failed to delete service"));
        }
    }
}