package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.RequestCreateDTO;
import com.motosnap.workshop.dto.RequestResponseDTO;
import com.motosnap.workshop.entity.*;
import com.motosnap.workshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Map;

@Service
@Transactional
public class RequestService {
    
    @Autowired
    private RequestRepository requestRepository;
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private InventoryRepository inventoryRepository;
    
    /**
     * Create a new parts request by a mechanic for a specific booking
     */
    public RequestResponseDTO createRequest(Long bookingId, RequestCreateDTO dto, String mechanicUsername) {
        // Validate that mechanic can request parts for this booking
        validateMechanicCanRequestParts(bookingId, mechanicUsername);
        
        // Get entities
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        User mechanic = userRepository.findByEmail(mechanicUsername)
            .orElseThrow(() -> new RuntimeException("Mechanic not found"));
        
        Inventory part = inventoryRepository.findById(dto.getPartId())
            .orElseThrow(() -> new RuntimeException("Part not found"));
        
        // Validate variation selection if part has variations
        if (part.hasVariations()) {
            if (dto.getSelectedVariations() == null || dto.getSelectedVariations().isEmpty()) {
                throw new RuntimeException("Variation selection is required for this part");
            }
            
            // Validate selected variations against part's variation definitions
            if (!validateVariationSelection(part, dto.getSelectedVariations())) {
                throw new RuntimeException("Invalid variation selection");
            }
            
            // Check variation-specific stock availability
            String variationKey = Inventory.buildVariationKey(dto.getSelectedVariations());
            Integer availableStock = part.getAvailableStockForVariation(variationKey);
            if (availableStock < dto.getQuantity()) {
                throw new RuntimeException("Insufficient stock for selected variation. Available: " + availableStock + ", Requested: " + dto.getQuantity());
            }
        } else {
            // For non-varied parts, check regular stock
            if (part.getQty() < dto.getQuantity()) {
                throw new RuntimeException("Insufficient stock available. Available: " + part.getQty() + ", Requested: " + dto.getQuantity());
            }
        }
        
        // Check for duplicate requests (same part, same booking, pending)
        List<Request> existingRequests = requestRepository.findByBookingOrderByRequestedAtAsc(booking);
        boolean isDuplicate = existingRequests.stream()
            .anyMatch(r -> r.getPart().getId().equals(dto.getPartId()) 
                        && r.getStatus() == RequestStatus.PENDING);
        
        if (isDuplicate) {
            throw new RuntimeException("A pending request for this part already exists for this booking");
        }
        
        // Create new request
        Request request = new Request(dto.getQuantity(), mechanic, part, booking);
        
        // Set selected variations if provided
        if (dto.getSelectedVariations() != null && !dto.getSelectedVariations().isEmpty()) {
            request.setSelectedVariationsMap(dto.getSelectedVariations());
        }
        
        if (dto.getReason() != null && !dto.getReason().trim().isEmpty()) {
            // Note: Adding reason field would require entity modification
            // For now, we'll skip this or add it as a future enhancement
        }
        
        Request savedRequest = requestRepository.save(request);
        return convertToDTO(savedRequest);
    }
    
    /**
     * Get all requests for a specific booking
     */
    public List<RequestResponseDTO> getRequestsForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        List<Request> requests = requestRepository.findByBookingOrderByRequestedAtAsc(booking);
        return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Get all requests made by a specific mechanic
     */
    public List<RequestResponseDTO> getMechanicRequests(String mechanicUsername) {
        User mechanic = userRepository.findByEmail(mechanicUsername)
            .orElseThrow(() -> new RuntimeException("Mechanic not found"));
        
        List<Request> requests = requestRepository.findByMechanicOrderByRequestedAtDesc(mechanic);
        return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Validate that a mechanic can request parts for a specific booking
     */
    private void validateMechanicCanRequestParts(Long bookingId, String mechanicUsername) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        // Check if mechanic is assigned to this booking
        if (booking.getAssignedMechanic() == null) {
            throw new RuntimeException("No mechanic assigned to this booking");
        }
        
        if (!booking.getAssignedMechanic().getEmail().equals(mechanicUsername)) {
            throw new RuntimeException("You are not assigned to this booking");
        }
        
        // Check booking status - must be CONFIRMED or IN_PROGRESS
        if (booking.getStatus() != BookingStatus.CONFIRMED && booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new RuntimeException("Parts can only be requested for confirmed or in-progress bookings. Current status: " + booking.getStatus());
        }
    }
    
    /**
     * Check if a mechanic can request parts (for frontend validation)
     */
    public boolean canMechanicRequestParts(Long bookingId, String mechanicUsername) {
        try {
            validateMechanicCanRequestParts(bookingId, mechanicUsername);
            return true;
        } catch (RuntimeException e) {
            return false;
        }
    }
    
    /**
     * Convert Request entity to DTO with all necessary information
     */
    private RequestResponseDTO convertToDTO(Request request) {
        RequestResponseDTO dto = new RequestResponseDTO();
        
        // Basic request info
        dto.setId(request.getId());
        dto.setQuantity(request.getQty());
        dto.setStatus(request.getStatus());
        dto.setRequestedAt(request.getRequestedAt());
        
        // Part information
        dto.setPartId(request.getPart().getId());
        dto.setPartName(request.getPart().getPartName());
        dto.setPartCategory(request.getPart().getCategory());
        dto.setPartPrice(request.getPart().getUnitPrice().doubleValue());
        dto.setAvailableStock(request.getPart().getQty());
        
        // Mechanic information
        dto.setMechanicId(request.getMechanic().getId());
        dto.setMechanicName(request.getMechanic().getName());
        
        // Booking information
        dto.setBookingId(request.getBooking().getId());
        dto.setServiceName(request.getBooking().getService().getName());
        dto.setCustomerName(request.getBooking().getUser().getName());
        dto.setVehiclePlateNo(request.getBooking().getVehicle().getPlateNo());
        
        // Variation information
        if (request.hasVariationSelection()) {
            dto.setSelectedVariations(request.getSelectedVariationsMap());
            dto.setSelectedVariationsDisplay(request.getVariationDisplayString());
        }
        
        return dto;
    }
    
    // Admin methods for future use (Phase 3)
    
    /**
     * Get all pending requests (for admin interface)
     */
    public List<RequestResponseDTO> getPendingRequests() {
        List<Request> requests = requestRepository.findByStatusOrderByRequestedAtDesc(RequestStatus.PENDING);
        return requests.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    /**
     * Approve a parts request (admin only)
     */
    public RequestResponseDTO approveRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be approved");
        }
        
        // Check if inventory is still available
        if (request.getPart().getQty() < request.getQty()) {
            throw new RuntimeException("Insufficient stock available for approval");
        }
        
        // Deduct from inventory
        request.getPart().deductStock(request.getQty());
        inventoryRepository.save(request.getPart());
        
        // Update request status
        request.setStatus(RequestStatus.APPROVED);
        Request savedRequest = requestRepository.save(request);
        
        return convertToDTO(savedRequest);
    }
    
    /**
     * Reject a parts request (admin only)
     */
    public RequestResponseDTO rejectRequest(Long requestId) {
        Request request = requestRepository.findById(requestId)
            .orElseThrow(() -> new RuntimeException("Request not found"));
        
        if (request.getStatus() != RequestStatus.PENDING) {
            throw new RuntimeException("Only pending requests can be rejected");
        }
        
        request.setStatus(RequestStatus.REJECTED);
        Request savedRequest = requestRepository.save(request);
        
        return convertToDTO(savedRequest);
    }
    
    // ===============================================================================
    // VARIATION VALIDATION METHODS
    // ===============================================================================
    
    /**
     * Validate selected variations against part's variation definitions
     */
    private boolean validateVariationSelection(Inventory part, Map<String, String> selectedVariations) {
        if (!part.hasVariations()) {
            return selectedVariations == null || selectedVariations.isEmpty();
        }
        
        if (selectedVariations == null || selectedVariations.isEmpty()) {
            return false; // Varied parts must have variations selected
        }
        
        Map<String, Object> variationDefs = part.getVariationDefinitions();
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
}