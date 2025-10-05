package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.ErrorResponse;
import com.motosnap.workshop.dto.UserProfileResponse;
import com.motosnap.workshop.dto.VehicleRequest;
import com.motosnap.workshop.entity.Vehicle;
import com.motosnap.workshop.service.CustomerService;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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

        String email = authentication.getName();
        Vehicle vehicle = customerService.addVehicle(email, vehicleRequest);
        return ResponseEntity.ok(vehicle);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getField() + ": " + error.getDefaultMessage())
                .collect(Collectors.joining(", "));

        ErrorResponse errorResponse = ErrorResponse.badRequest("Validation failed: " + errors);
        return ResponseEntity.badRequest().body(errorResponse);
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeExceptions(RuntimeException ex) {
        ErrorResponse errorResponse;

        if (ex.getMessage().contains("already exists")) {
            errorResponse = ErrorResponse.conflict(ex.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(errorResponse);
        } else if (ex.getMessage().contains("not found")) {
            errorResponse = ErrorResponse.badRequest(ex.getMessage());
            return ResponseEntity.badRequest().body(errorResponse);
        } else {
            errorResponse = ErrorResponse.internalServerError("An unexpected error occurred: " + ex.getMessage());
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}