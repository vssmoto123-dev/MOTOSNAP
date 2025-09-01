package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.UserProfileResponse;
import com.motosnap.workshop.dto.VehicleRequest;
import com.motosnap.workshop.entity.Vehicle;
import com.motosnap.workshop.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me")
@PreAuthorize("isAuthenticated()")
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    @GetMapping
    public ResponseEntity<UserProfileResponse> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        
        return customerService.getUserProfile(email)
                .map(profile -> ResponseEntity.ok(profile))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<Vehicle>> getVehicles(Authentication authentication) {
        String email = authentication.getName();
        List<Vehicle> vehicles = customerService.getVehiclesByEmail(email);
        return ResponseEntity.ok(vehicles);
    }

    @PostMapping("/vehicles")
    public ResponseEntity<Vehicle> addVehicle(
            @Valid @RequestBody VehicleRequest vehicleRequest,
            Authentication authentication) {
        
        try {
            String email = authentication.getName();
            Vehicle vehicle = customerService.addVehicle(email, vehicleRequest);
            return ResponseEntity.ok(vehicle);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}