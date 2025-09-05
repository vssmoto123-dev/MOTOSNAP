package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.BookingRequest;
import com.motosnap.workshop.dto.BookingResponse;
import com.motosnap.workshop.dto.BookingStatusUpdateRequest;
import com.motosnap.workshop.entity.BookingStatus;
import com.motosnap.workshop.service.BookingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private com.motosnap.workshop.service.InvoicePaymentService invoicePaymentService;

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> createBooking(
            @Valid @RequestBody BookingRequest request,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Creating booking for user: " + authentication.getName());
            String email = authentication.getName();
            BookingResponse booking = bookingService.createBooking(email, request);
            System.out.println("DEBUG: Booking created successfully, ID: " + booking.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(booking);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to create booking - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error creating booking - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN')")
    public ResponseEntity<?> getUserBookings(Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting bookings for user: " + authentication.getName());
            String email = authentication.getName();
            List<BookingResponse> bookings = bookingService.getUserBookings(email);
            System.out.println("DEBUG: Found " + bookings.size() + " bookings for user");
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get user bookings - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting user bookings - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC')")
    public ResponseEntity<?> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false, defaultValue = "all") String filter,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting all bookings, filter: " + filter + ", status: " + status);
            List<BookingResponse> bookings;
            
            if (status != null) {
                BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase());
                bookings = bookingService.getBookingsByStatus(bookingStatus);
            } else {
                switch (filter.toLowerCase()) {
                    case "today":
                        bookings = bookingService.getTodayBookings();
                        break;
                    case "upcoming":
                        bookings = bookingService.getUpcomingBookings();
                        break;
                    case "mechanic":
                        // Get bookings assigned to current mechanic
                        bookings = bookingService.getMechanicBookings(authentication.getName());
                        break;
                    default:
                        bookings = bookingService.getAllBookings();
                }
            }
            
            System.out.println("DEBUG: Found " + bookings.size() + " bookings");
            return ResponseEntity.ok(bookings);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get bookings - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting bookings - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC') or hasRole('CUSTOMER')")
    public ResponseEntity<?> getBookingById(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting booking by ID: " + bookingId);
            BookingResponse booking = bookingService.getBookingById(bookingId);
            
            // Check if customer can only view their own bookings
            if (authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_CUSTOMER"))) {
                // For customers, verify they own this booking
                if (!booking.getCustomerEmail().equals(authentication.getName())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied"));
                }
            }
            
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get booking - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting booking - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/status")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC')")
    public ResponseEntity<?> updateBookingStatus(
            @PathVariable Long bookingId,
            @Valid @RequestBody BookingStatusUpdateRequest request,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Updating booking " + bookingId + " status to: " + request.getStatus());
            BookingResponse booking = bookingService.updateBookingStatus(bookingId, request);
            System.out.println("DEBUG: Booking status updated successfully");
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to update booking status - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error updating booking status - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/{bookingId}/assign")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> assignMechanic(
            @PathVariable Long bookingId,
            @RequestBody Map<String, Long> request,
            Authentication authentication) {
        try {
            Long mechanicId = request.get("mechanicId");
            if (mechanicId == null) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Mechanic ID is required"));
            }
            
            System.out.println("DEBUG: Assigning mechanic " + mechanicId + " to booking " + bookingId);
            BookingResponse booking = bookingService.assignMechanic(bookingId, mechanicId);
            System.out.println("DEBUG: Mechanic assigned successfully");
            return ResponseEntity.ok(booking);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to assign mechanic - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error assigning mechanic - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{bookingId}/with-invoice")
    @PreAuthorize("hasRole('CUSTOMER') or hasRole('ADMIN') or hasRole('MECHANIC')")
    public ResponseEntity<?> getBookingWithInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting booking with invoice for ID: " + bookingId);
            
            // Get basic booking information
            BookingResponse booking = bookingService.getBookingById(bookingId);
            
            // Check if customer can only view their own bookings
            if (authentication.getAuthorities().stream()
                    .anyMatch(auth -> auth.getAuthority().equals("ROLE_CUSTOMER"))) {
                if (!booking.getCustomerEmail().equals(authentication.getName())) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Access denied"));
                }
            }
            
            // Create extended response with invoice information
            Map<String, Object> response = new HashMap<>();
            response.put("id", booking.getId());
            response.put("scheduledDateTime", booking.getScheduledDateTime());
            response.put("status", booking.getStatus());
            response.put("notes", booking.getNotes() != null ? booking.getNotes() : "");
            response.put("statusNotes", booking.getStatusNotes() != null ? booking.getStatusNotes() : "");
            response.put("serviceId", booking.getServiceId());
            response.put("serviceName", booking.getServiceName());
            response.put("serviceCategory", booking.getServiceCategory());
            response.put("serviceDescription", booking.getServiceDescription() != null ? booking.getServiceDescription() : "");
            response.put("serviceBasePrice", booking.getServiceBasePrice());
            response.put("serviceEstimatedDurationMinutes", booking.getServiceEstimatedDurationMinutes());
            response.put("vehicleId", booking.getVehicleId());
            response.put("vehiclePlateNo", booking.getVehiclePlateNo());
            response.put("vehicleModel", booking.getVehicleModel());
            response.put("vehicleBrand", booking.getVehicleBrand());
            response.put("vehicleYear", booking.getVehicleYear());
            response.put("customerId", booking.getCustomerId());
            response.put("customerName", booking.getCustomerName());
            response.put("customerEmail", booking.getCustomerEmail());
            response.put("assignedMechanicId", booking.getAssignedMechanicId());
            response.put("assignedMechanicName", booking.getAssignedMechanicName() != null ? booking.getAssignedMechanicName() : "");
            response.put("createdAt", booking.getCreatedAt());
            response.put("updatedAt", booking.getUpdatedAt());
            response.put("startedAt", booking.getStartedAt());
            response.put("completedAt", booking.getCompletedAt());
            response.put("invoice", getInvoiceForBooking(bookingId));
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get booking with invoice - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting booking with invoice - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
    
    private Object getInvoiceForBooking(Long bookingId) {
        try {
            // Try to get invoice for this booking
            var invoiceOpt = bookingService.getInvoiceService().getInvoiceByBookingId(bookingId);
            if (invoiceOpt.isPresent()) {
                var invoice = invoiceOpt.get();
                Map<String, Object> invoiceMap = new HashMap<>();
                invoiceMap.put("id", invoice.getId());
                invoiceMap.put("invoiceNumber", invoice.getInvoiceNumber());
                invoiceMap.put("serviceAmount", invoice.getServiceAmount());
                invoiceMap.put("partsAmount", invoice.getPartsAmount());
                invoiceMap.put("totalAmount", invoice.getTotalAmount());
                invoiceMap.put("generatedAt", invoice.getGeneratedAt());
                invoiceMap.put("invoicePayment", getInvoicePaymentInfo(invoice.getId()));
                return invoiceMap;
            }
            return null;
        } catch (Exception e) {
            System.out.println("DEBUG: No invoice found for booking ID: " + bookingId + ", error: " + e.getMessage());
            return null;
        }
    }
    
    private Object getInvoicePaymentInfo(Long invoiceId) {
        try {
            // This would require access to InvoicePaymentService - for now return null
            // TODO: Add proper invoice payment status lookup
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}