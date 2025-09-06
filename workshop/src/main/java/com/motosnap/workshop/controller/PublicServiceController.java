package com.motosnap.workshop.controller;

import com.motosnap.workshop.entity.Service;
import com.motosnap.workshop.dto.ServiceDTO;
import com.motosnap.workshop.service.ServiceManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/services")
@RequiredArgsConstructor
public class PublicServiceController {

    private final ServiceManagementService serviceManagementService;

    @GetMapping
    public ResponseEntity<List<ServiceDTO>> getAllServices(
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

            // Convert to DTO to prevent circular reference issues
            List<ServiceDTO> serviceDTOs = services.stream()
                    .map(ServiceDTO::new)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(serviceDTOs);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
