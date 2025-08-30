package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.ServiceRequest;
import com.motosnap.workshop.entity.Service;
import com.motosnap.workshop.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional
public class ServiceManagementService {
    
    private final ServiceRepository serviceRepository;
    
    public List<Service> getAllServices() {
        return serviceRepository.findAll();
    }
    
    public Page<Service> getAllServices(Pageable pageable) {
        return serviceRepository.findAll(pageable);
    }
    
    public Optional<Service> getServiceById(Long id) {
        return serviceRepository.findById(id);
    }
    
    public List<Service> getServicesByCategory(String category) {
        return serviceRepository.findByCategoryIgnoreCase(category);
    }
    
    public List<Service> searchServices(String searchTerm) {
        return serviceRepository.findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(
            searchTerm, searchTerm
        );
    }
    
    public Service createService(ServiceRequest request) {
        // Check if service name already exists in the same category
        if (serviceRepository.existsByNameAndCategory(request.getName(), request.getCategory())) {
            throw new RuntimeException("Service already exists: " + request.getName() + " in category " + request.getCategory());
        }
        
        Service service = new Service();
        service.setName(request.getName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setBasePrice(BigDecimal.valueOf(request.getBasePrice()));
        service.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        
        return serviceRepository.save(service);
    }
    
    public Service updateService(Long id, ServiceRequest request) {
        Service service = serviceRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Service not found with id: " + id));
        
        // Check if service name already exists in the same category for different service
        if (!service.getName().equals(request.getName()) && 
            serviceRepository.existsByNameAndCategory(request.getName(), request.getCategory())) {
            throw new RuntimeException("Service already exists: " + request.getName() + " in category " + request.getCategory());
        }
        
        service.setName(request.getName());
        service.setCategory(request.getCategory());
        service.setDescription(request.getDescription());
        service.setBasePrice(BigDecimal.valueOf(request.getBasePrice()));
        service.setEstimatedDurationMinutes(request.getEstimatedDurationMinutes());
        
        return serviceRepository.save(service);
    }
    
    public void deleteService(Long id) {
        if (!serviceRepository.existsById(id)) {
            throw new RuntimeException("Service not found with id: " + id);
        }
        serviceRepository.deleteById(id);
    }
    
    public List<String> getAllCategories() {
        return serviceRepository.findDistinctCategories();
    }
    
    public List<Service> getServicesByPriceRange(Double minPrice, Double maxPrice) {
        return serviceRepository.findByBasePriceBetween(
            BigDecimal.valueOf(minPrice), 
            BigDecimal.valueOf(maxPrice)
        );
    }
}