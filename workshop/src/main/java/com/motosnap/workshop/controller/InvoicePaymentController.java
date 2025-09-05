package com.motosnap.workshop.controller;

import com.motosnap.workshop.entity.InvoicePayment;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.dto.InvoicePaymentResponseDTO;
import com.motosnap.workshop.service.InvoicePaymentService;
import com.motosnap.workshop.repository.UserRepository;
import com.motosnap.workshop.config.FileUploadProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/invoices")
@PreAuthorize("isAuthenticated()")
public class InvoicePaymentController {

    @Autowired
    private InvoicePaymentService invoicePaymentService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FileUploadProperties fileUploadProperties;

    /**
     * Initiate payment for an invoice (Customer)
     * POST /api/invoices/{invoiceId}/payment
     */
    @PostMapping("/{invoiceId}/payment")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> initiateInvoicePayment(
            @PathVariable Long invoiceId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Initiating payment for invoice ID: " + invoiceId + " by user: " + authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            InvoicePayment invoicePayment = invoicePaymentService.initiatePayment(invoiceId, user);
            
            System.out.println("DEBUG: Payment initiated successfully, payment ID: " + invoicePayment.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(invoicePayment);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to initiate payment - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error initiating payment - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Upload receipt for invoice payment (Customer)
     * POST /api/invoices/{invoiceId}/payment/receipt
     */
    @PostMapping("/{invoiceId}/payment/receipt")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> uploadInvoiceReceipt(
            @PathVariable Long invoiceId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiptAmount") BigDecimal receiptAmount,
            @RequestParam("notes") String notes,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Uploading receipt for invoice ID: " + invoiceId + " by user: " + authentication.getName());
            
            User user = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            invoicePaymentService.uploadReceipt(invoiceId, file, receiptAmount, notes, user);
            
            System.out.println("DEBUG: Receipt uploaded successfully for invoice ID: " + invoiceId);
            return ResponseEntity.ok(Map.of("message", "Receipt uploaded successfully"));
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to upload receipt - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error uploading receipt - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get payment status for an invoice (Customer)
     * GET /api/invoices/{invoiceId}/payment/status
     */
    @GetMapping("/{invoiceId}/payment/status")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<?> getInvoicePaymentStatus(
            @PathVariable Long invoiceId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting payment status for invoice ID: " + invoiceId + " by user: " + authentication.getName());
            
            Optional<InvoicePayment> paymentOpt = invoicePaymentService.getPaymentByInvoiceId(invoiceId);
            
            if (paymentOpt.isPresent()) {
                return ResponseEntity.ok(paymentOpt.get());
            } else {
                return ResponseEntity.ok(Map.of("status", "NO_PAYMENT_INITIATED"));
            }
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get payment status - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting payment status - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get pending invoice payments for admin approval (Admin)
     * GET /api/invoices/payments/pending
     */
    @GetMapping("/payments/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getPendingInvoicePayments(Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting pending invoice payments by admin: " + authentication.getName());
            
            List<InvoicePaymentResponseDTO> pendingPayments = invoicePaymentService.getPendingPaymentsAsDTO();
            
            System.out.println("DEBUG: Found " + pendingPayments.size() + " pending invoice payments");
            return ResponseEntity.ok(pendingPayments);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting pending payments - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Approve invoice payment (Admin)
     * PUT /api/invoices/payments/{paymentId}/approve
     */
    @PutMapping("/payments/{paymentId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveInvoicePayment(
            @PathVariable Long paymentId,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Approving invoice payment ID: " + paymentId + " by admin: " + authentication.getName());
            
            User admin = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            invoicePaymentService.approvePayment(paymentId, admin);
            
            System.out.println("DEBUG: Invoice payment approved successfully");
            return ResponseEntity.ok(Map.of("message", "Payment approved successfully"));
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to approve payment - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error approving payment - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Reject invoice payment (Admin)
     * PUT /api/invoices/payments/{paymentId}/reject
     */
    @PutMapping("/payments/{paymentId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectInvoicePayment(
            @PathVariable Long paymentId,
            @RequestParam(required = false) String reason,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Rejecting invoice payment ID: " + paymentId + " by admin: " + authentication.getName());
            
            User admin = userRepository.findByEmail(authentication.getName())
                    .orElseThrow(() -> new RuntimeException("User not found"));
            invoicePaymentService.rejectPayment(paymentId, reason, admin);
            
            System.out.println("DEBUG: Invoice payment rejected successfully");
            return ResponseEntity.ok(Map.of("message", "Payment rejected successfully"));
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to reject payment - " + e.getMessage());
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error rejecting payment - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    /**
     * Get invoice receipt file (Admin)
     * GET /api/invoices/payments/{paymentId}/receipt
     */
    @GetMapping("/payments/{paymentId}/receipt")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> getInvoiceReceiptFile(@PathVariable Long paymentId) {
        try {
            System.out.println("DEBUG: Getting receipt file for payment ID: " + paymentId);
            
            InvoicePayment payment = invoicePaymentService.getPaymentById(paymentId);
            
            if (payment.getReceipt() == null || payment.getReceipt().getFileUrl() == null) {
                return ResponseEntity.notFound().build();
            }

            String filename = payment.getReceipt().getFileUrl();
            Path filePath = Paths.get(fileUploadProperties.getUploadDir()).resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get receipt file - " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all invoice payments (Admin)
     * GET /api/invoices/payments
     */
    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllInvoicePayments(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting all invoice payments for last " + days + " days by admin: " + authentication.getName());
            
            List<InvoicePaymentResponseDTO> payments = invoicePaymentService.getRecentPaymentsAsDTO(days);
            
            return ResponseEntity.ok(payments);
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting all payments - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }
}