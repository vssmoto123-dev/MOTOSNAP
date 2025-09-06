package com.motosnap.workshop.service;

import com.motosnap.workshop.entity.*;
import com.motosnap.workshop.repository.*;
import com.motosnap.workshop.dto.InvoicePaymentResponseDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class InvoicePaymentService {

    @Autowired
    private InvoicePaymentRepository invoicePaymentRepository;

    @Autowired
    private InvoiceReceiptRepository invoiceReceiptRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    @Lazy
    private FileStorageService fileStorageService;

    public InvoicePayment initiatePayment(Long invoiceId, User user) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify invoice belongs to the user
        if (!invoice.getBooking().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Invoice does not belong to user");
        }

        Optional<InvoicePayment> existingPayment = invoicePaymentRepository.findByInvoice(invoice);
        if (existingPayment.isPresent()) {
            return existingPayment.get();
        }

        // Create new invoice payment
        InvoicePayment invoicePayment = new InvoicePayment(invoice);
        return invoicePaymentRepository.save(invoicePayment);
    }

    public void uploadReceipt(Long invoiceId, MultipartFile file, BigDecimal amount, String notes, User user) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Verify invoice belongs to the user
        if (!invoice.getBooking().getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied: Invoice does not belong to user");
        }

        InvoicePayment invoicePayment = invoicePaymentRepository.findByInvoice(invoice)
                .orElseThrow(() -> new RuntimeException("Invoice payment not found. Please initiate payment first."));

        // Allow re-upload if payment was rejected
        if (invoicePayment.getReceipt() != null && invoicePayment.getStatus() != InvoicePaymentStatus.REJECTED) {
            throw new RuntimeException("Receipt has already been uploaded for this invoice");
        }

        try {
            // Store the file
            String fileUrl = fileStorageService.storeFile(file);

            InvoiceReceipt receipt;
            if (invoicePayment.getReceipt() != null) {
                // Update existing receipt
                receipt = invoicePayment.getReceipt();
                receipt.setFileUrl(fileUrl);
                receipt.setAmount(amount);
                receipt.setNotes(notes);
                receipt.setStatus(ReceiptStatus.PENDING);
                receipt.setAdminNotes(null);
                receipt.setApprovedBy(null);
                receipt.setApprovedAt(null);
            } else {
                // Create new receipt record
                receipt = new InvoiceReceipt(fileUrl, amount, notes, invoicePayment);
            }
            invoiceReceiptRepository.save(receipt);

            // Update payment status
            invoicePayment.setStatus(InvoicePaymentStatus.PAYMENT_SUBMITTED);
            invoicePayment.setReceipt(receipt);
            invoicePaymentRepository.save(invoicePayment);

            System.out.println("DEBUG: Receipt uploaded successfully for invoice payment ID: " + invoicePayment.getId());

        } catch (Exception e) {
            System.err.println("ERROR: Failed to upload receipt - " + e.getMessage());
            throw new RuntimeException("Failed to upload receipt: " + e.getMessage());
        }
    }

    /**
     * Approve invoice payment (Admin only)
     */
    public void approvePayment(Long paymentId, User admin) {
        InvoicePayment invoicePayment = invoicePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Invoice payment not found"));

        if (invoicePayment.getReceipt() == null) {
            throw new RuntimeException("No receipt found for this payment");
        }

        // Update payment status
        invoicePayment.setStatus(InvoicePaymentStatus.APPROVED);
        invoicePaymentRepository.save(invoicePayment);

        // Update receipt status
        InvoiceReceipt receipt = invoicePayment.getReceipt();
        receipt.setStatus(ReceiptStatus.APPROVED);
        receipt.setApprovedBy(admin);
        receipt.setApprovedAt(LocalDateTime.now());
        invoiceReceiptRepository.save(receipt);

        System.out.println("DEBUG: Invoice payment approved by admin: " + admin.getEmail() + " for payment ID: " + paymentId);
    }

    /**
     * Reject invoice payment (Admin only)
     */
    public void rejectPayment(Long paymentId, String reason, User admin) {
        InvoicePayment invoicePayment = invoicePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Invoice payment not found"));

        if (invoicePayment.getReceipt() == null) {
            throw new RuntimeException("No receipt found for this payment");
        }

        // Update payment status
        invoicePayment.setStatus(InvoicePaymentStatus.REJECTED);
        invoicePaymentRepository.save(invoicePayment);

        // Update receipt status
        InvoiceReceipt receipt = invoicePayment.getReceipt();
        receipt.setStatus(ReceiptStatus.REJECTED);
        receipt.setApprovedBy(admin);
        receipt.setAdminNotes(reason);
        receipt.setApprovedAt(LocalDateTime.now());
        invoiceReceiptRepository.save(receipt);

        System.out.println("DEBUG: Invoice payment rejected by admin: " + admin.getEmail() + " for payment ID: " + paymentId + ", reason: " + reason);
    }

    /**
     * Get pending payments for admin approval
     */
    public List<InvoicePayment> getPendingPayments() {
        return invoicePaymentRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(InvoicePaymentStatus.PAYMENT_SUBMITTED)
        );
    }

    /**
     * Get pending payments as DTOs for admin approval
     */
    public List<InvoicePaymentResponseDTO> getPendingPaymentsAsDTO() {
        List<InvoicePayment> payments = invoicePaymentRepository.findByStatusInOrderByCreatedAtDesc(
                List.of(InvoicePaymentStatus.PAYMENT_SUBMITTED)
        );
        return payments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get payment by invoice ID
     */
    public Optional<InvoicePayment> getPaymentByInvoiceId(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        return invoicePaymentRepository.findByInvoice(invoice);
    }

    /**
     * Get payment by payment ID
     */
    public InvoicePayment getPaymentById(Long paymentId) {
        return invoicePaymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Invoice payment not found"));
    }

    /**
     * Get payments for a customer
     */
    public List<InvoicePayment> getPaymentsForCustomer(Long customerId) {
        return invoicePaymentRepository.findByCustomerId(customerId);
    }

    /**
     * Get recent payments
     */
    public List<InvoicePayment> getRecentPayments(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return invoicePaymentRepository.findRecentPayments(since);
    }

    /**
     * Get recent payments as DTOs
     */
    public List<InvoicePaymentResponseDTO> getRecentPaymentsAsDTO(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<InvoicePayment> payments = invoicePaymentRepository.findRecentPayments(since);
        return payments.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Check if invoice has payment initiated
     */
    public boolean hasPaymentInitiated(Long invoiceId) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        
        return invoicePaymentRepository.findByInvoice(invoice).isPresent();
    }

    /**
     * Get payment status for an invoice
     */
    public InvoicePaymentStatus getPaymentStatus(Long invoiceId) {
        Optional<InvoicePayment> payment = getPaymentByInvoiceId(invoiceId);
        return payment.map(InvoicePayment::getStatus).orElse(null);
    }

    /**
     * Convert InvoicePayment entity to DTO
     */
    private InvoicePaymentResponseDTO convertToDTO(InvoicePayment payment) {
        InvoicePaymentResponseDTO dto = new InvoicePaymentResponseDTO();
        
        // Payment basic info
        dto.setId(payment.getId());
        dto.setStatus(payment.getStatus());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        
        // Invoice info
        Invoice invoice = payment.getInvoice();
        InvoicePaymentResponseDTO.InvoiceInfoDTO invoiceDTO = new InvoicePaymentResponseDTO.InvoiceInfoDTO();
        invoiceDTO.setId(invoice.getId());
        invoiceDTO.setInvoiceNumber(invoice.getInvoiceNumber());
        invoiceDTO.setServiceAmount(invoice.getServiceAmount());
        invoiceDTO.setPartsAmount(invoice.getPartsAmount());
        invoiceDTO.setTotalAmount(invoice.getTotalAmount());
        invoiceDTO.setGeneratedAt(invoice.getGeneratedAt());
        
        // Booking info
        Booking booking = invoice.getBooking();
        InvoicePaymentResponseDTO.BookingInfoDTO bookingDTO = new InvoicePaymentResponseDTO.BookingInfoDTO();
        bookingDTO.setId(booking.getId());
        bookingDTO.setCustomerName(booking.getUser().getName());
        bookingDTO.setServiceName(booking.getService().getName());
        bookingDTO.setVehiclePlateNo(booking.getVehicle().getPlateNo());
        bookingDTO.setVehicleBrand(booking.getVehicle().getBrand());
        bookingDTO.setVehicleModel(booking.getVehicle().getModel());
        bookingDTO.setScheduledDateTime(booking.getScheduledDateTime());
        bookingDTO.setAssignedMechanicName(
            booking.getAssignedMechanic() != null ? booking.getAssignedMechanic().getName() : null
        );
        
        invoiceDTO.setBooking(bookingDTO);
        dto.setInvoice(invoiceDTO);
        
        // Receipt info (if exists)
        if (payment.getReceipt() != null) {
            InvoiceReceipt receipt = payment.getReceipt();
            InvoicePaymentResponseDTO.ReceiptInfoDTO receiptDTO = new InvoicePaymentResponseDTO.ReceiptInfoDTO();
            receiptDTO.setId(receipt.getId());
            receiptDTO.setAmount(receipt.getAmount());
            receiptDTO.setFileUrl(receipt.getFileUrl());
            receiptDTO.setNotes(receipt.getNotes());
            receiptDTO.setAdminNotes(receipt.getAdminNotes());
            receiptDTO.setStatus(receipt.getStatus().toString());
            receiptDTO.setUploadedAt(receipt.getUploadedAt());
            dto.setReceipt(receiptDTO);
        }
        
        return dto;
    }
}