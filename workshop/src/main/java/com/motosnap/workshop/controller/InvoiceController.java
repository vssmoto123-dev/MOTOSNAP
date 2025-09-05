package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.InvoiceResponse;
import com.motosnap.workshop.entity.Invoice;
import com.motosnap.workshop.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    @Autowired
    private InvoiceService invoiceService;

    /**
     * Generate invoice for a completed booking
     * POST /api/invoices/generate/{bookingId}
     */
    @PostMapping("/generate/{bookingId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC')")
    public ResponseEntity<?> generateInvoice(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Generating invoice for booking ID: " + bookingId + " by user: " + authentication.getName());
            
            InvoiceResponse invoice = invoiceService.generateInvoiceForBooking(bookingId);
            
            System.out.println("DEBUG: Invoice generated successfully, ID: " + invoice.getId() + ", Number: " + invoice.getInvoiceNumber());
            return ResponseEntity.status(HttpStatus.CREATED).body(invoice);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to generate invoice - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error generating invoice - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get invoice by ID
     * GET /api/invoices/{invoiceId}
     */
    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC') or hasRole('CUSTOMER')")
    public ResponseEntity<?> getInvoice(
            @PathVariable Long invoiceId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting invoice ID: " + invoiceId + " by user: " + authentication.getName());
            
            Invoice invoice = invoiceService.getInvoiceById(invoiceId);
            
            // TODO: Add authorization check to ensure customer can only access their own invoices
            
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get invoice - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting invoice - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get invoice for a specific booking
     * GET /api/invoices/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC') or hasRole('CUSTOMER')")
    public ResponseEntity<?> getInvoiceByBooking(
            @PathVariable Long bookingId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting invoice for booking ID: " + bookingId + " by user: " + authentication.getName());
            
            Optional<Invoice> invoiceOpt = invoiceService.getInvoiceByBookingId(bookingId);
            
            if (invoiceOpt.isPresent()) {
                return ResponseEntity.ok(invoiceOpt.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get invoice by booking - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting invoice by booking - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get all invoices (Admin only)
     * GET /api/invoices
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllInvoices(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting all invoices for last " + days + " days by admin: " + authentication.getName());
            
            List<Invoice> invoices = invoiceService.getRecentInvoices(days);
            
            return ResponseEntity.ok(invoices);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting all invoices - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Update invoice PDF URL
     * PUT /api/invoices/{invoiceId}/pdf-url
     */
    @PutMapping("/{invoiceId}/pdf-url")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MECHANIC')")
    public ResponseEntity<?> updateInvoicePdfUrl(
            @PathVariable Long invoiceId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Updating PDF URL for invoice ID: " + invoiceId + " by user: " + authentication.getName());
            
            String pdfUrl = request.get("pdfUrl");
            if (pdfUrl == null || pdfUrl.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "PDF URL is required"));
            }
            
            Invoice invoice = invoiceService.updateInvoicePdfUrl(invoiceId, pdfUrl);
            
            return ResponseEntity.ok(invoice);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to update invoice PDF URL - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error updating invoice PDF URL - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get monthly revenue statistics (Admin only)
     * GET /api/invoices/revenue/monthly
     */
    @GetMapping("/revenue/monthly")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getMonthlyRevenue(
            @RequestParam(defaultValue = "12") int months,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting monthly revenue for last " + months + " months by admin: " + authentication.getName());
            
            List<Object[]> revenue = invoiceService.getMonthlyRevenue(months);
            
            return ResponseEntity.ok(revenue);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting monthly revenue - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}