package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.RequestCreateDTO;
import com.motosnap.workshop.dto.RequestResponseDTO;
import com.motosnap.workshop.service.RequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api")
public class RequestController {
    
    @Autowired
    private RequestService requestService;
    
    /**
     * Create a new parts request for a specific booking
     * Only mechanics assigned to the booking can create requests
     */
    @PostMapping("/bookings/{bookingId}/requests")
    @PreAuthorize("hasRole('MECHANIC') or hasRole('ADMIN')")
    public ResponseEntity<?> createPartsRequest(
            @PathVariable Long bookingId,
            @Valid @RequestBody RequestCreateDTO requestDTO,
            Authentication authentication) {
        
        try {
            String mechanicUsername = authentication.getName();
            RequestResponseDTO response = requestService.createRequest(bookingId, requestDTO, mechanicUsername);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get all parts requests for a specific booking
     * Accessible by mechanics assigned to the booking and admins
     */
    @GetMapping("/bookings/{bookingId}/requests")
    @PreAuthorize("hasRole('MECHANIC') or hasRole('ADMIN')")
    public ResponseEntity<?> getRequestsForBooking(@PathVariable Long bookingId, Authentication authentication) {
        
        try {
            // For mechanics, validate they are assigned to this booking
            if (authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_MECHANIC"))) {
                String mechanicUsername = authentication.getName();
                if (!requestService.canMechanicRequestParts(bookingId, mechanicUsername)) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new ErrorResponse("You are not authorized to view requests for this booking"));
                }
            }
            
            List<RequestResponseDTO> requests = requestService.getRequestsForBooking(bookingId);
            return ResponseEntity.ok(requests);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Get all requests made by the current mechanic
     * Only accessible by mechanics
     */
    @GetMapping("/mechanics/me/requests")
    @PreAuthorize("hasRole('MECHANIC')")
    public ResponseEntity<?> getMechanicRequests(Authentication authentication) {
        
        try {
            String mechanicUsername = authentication.getName();
            List<RequestResponseDTO> requests = requestService.getMechanicRequests(mechanicUsername);
            return ResponseEntity.ok(requests);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Check if a mechanic can request parts for a specific booking
     * Useful for frontend validation
     */
    @GetMapping("/bookings/{bookingId}/can-request-parts")
    @PreAuthorize("hasRole('MECHANIC') or hasRole('ADMIN')")
    public ResponseEntity<?> canRequestParts(@PathVariable Long bookingId, Authentication authentication) {
        
        try {
            String mechanicUsername = authentication.getName();
            boolean canRequest = requestService.canMechanicRequestParts(bookingId, mechanicUsername);
            return ResponseEntity.ok(new CanRequestResponse(canRequest));
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Admin endpoints for future use (Phase 3)
    
    /**
     * Get all pending parts requests (admin only)
     */
    @GetMapping("/admin/requests/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingRequests() {
        
        try {
            List<RequestResponseDTO> requests = requestService.getPendingRequests();
            return ResponseEntity.ok(requests);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Approve a parts request (admin only)
     */
    @PutMapping("/admin/requests/{requestId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveRequest(@PathVariable Long requestId) {
        
        try {
            RequestResponseDTO response = requestService.approveRequest(requestId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    /**
     * Reject a parts request (admin only)
     */
    @PutMapping("/admin/requests/{requestId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectRequest(@PathVariable Long requestId) {
        
        try {
            RequestResponseDTO response = requestService.rejectRequest(requestId);
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new ErrorResponse(e.getMessage()));
        }
    }
    
    // Helper classes for responses
    
    public static class ErrorResponse {
        private String error;
        
        public ErrorResponse(String error) {
            this.error = error;
        }
        
        public String getError() {
            return error;
        }
        
        public void setError(String error) {
            this.error = error;
        }
    }
    
    public static class CanRequestResponse {
        private boolean canRequest;
        
        public CanRequestResponse(boolean canRequest) {
            this.canRequest = canRequest;
        }
        
        public boolean isCanRequest() {
            return canRequest;
        }
        
        public void setCanRequest(boolean canRequest) {
            this.canRequest = canRequest;
        }
    }
}