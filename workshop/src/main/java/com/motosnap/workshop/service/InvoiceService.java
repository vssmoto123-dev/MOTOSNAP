package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.InvoiceResponse;
import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.Invoice;
import com.motosnap.workshop.entity.Request;
import com.motosnap.workshop.entity.RequestStatus;
import com.motosnap.workshop.repository.BookingRepository;
import com.motosnap.workshop.repository.InvoiceRepository;
import com.motosnap.workshop.repository.RequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class InvoiceService {

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private RequestRepository requestRepository;

    /**
     * Generate invoice for a completed booking
     */
    public InvoiceResponse generateInvoiceForBooking(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Check if booking is completed
        if (!booking.getStatus().equals(com.motosnap.workshop.entity.BookingStatus.COMPLETED)) {
            throw new RuntimeException("Can only generate invoice for completed bookings");
        }

        // Check if invoice already exists
        Optional<Invoice> existingInvoice = invoiceRepository.findByBooking(booking);
        if (existingInvoice.isPresent()) {
            return new InvoiceResponse(existingInvoice.get());
        }

        // Calculate parts amount from approved/used parts requests
        BigDecimal partsAmount = calculatePartsAmount(bookingId);

        // Generate unique invoice number
        String invoiceNumber = generateInvoiceNumber();

        // Create and save invoice
        Invoice invoice = new Invoice(
                invoiceNumber,
                booking.getService().getBasePrice(),
                partsAmount,
                booking
        );

        Invoice savedInvoice = invoiceRepository.save(invoice);
        return new InvoiceResponse(savedInvoice);
    }

    /**
     * Calculate total parts amount for a booking based on approved parts requests
     */
    private BigDecimal calculatePartsAmount(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        List<Request> allRequests = requestRepository.findByBookingOrderByRequestedAtAsc(booking);
        List<Request> approvedRequests = allRequests.stream()
                .filter(request -> request.getStatus() == RequestStatus.APPROVED)
                .toList();

        return approvedRequests.stream()
                .map(request -> request.getPart().getUnitPrice().multiply(BigDecimal.valueOf(request.getQty())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Generate unique invoice number in format: INV-YYYY-XXXXXX
     */
    private String generateInvoiceNumber() {
        String yearMonth = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy"));
        
        // Find the highest invoice number for this year
        String prefix = "INV-" + yearMonth + "-";
        List<Invoice> yearlyInvoices = invoiceRepository.findAll().stream()
                .filter(inv -> inv.getInvoiceNumber().startsWith(prefix))
                .toList();

        int nextNumber = yearlyInvoices.size() + 1;
        
        // Ensure uniqueness by checking if number exists
        String candidate;
        do {
            candidate = prefix + String.format("%06d", nextNumber);
            nextNumber++;
        } while (invoiceRepository.existsByInvoiceNumber(candidate));

        return candidate;
    }

    /**
     * Get invoice by ID
     */
    public Invoice getInvoiceById(Long invoiceId) {
        return invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    /**
     * Get invoice by booking ID
     */
    public Optional<Invoice> getInvoiceByBookingId(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        
        return invoiceRepository.findByBooking(booking);
    }

    /**
     * Get invoice response by booking ID
     */
    public InvoiceResponse getInvoiceResponseByBookingId(Long bookingId) {
        Optional<Invoice> invoiceOpt = getInvoiceByBookingId(bookingId);
        if (invoiceOpt.isEmpty()) {
            throw new RuntimeException("Invoice not found for booking ID: " + bookingId);
        }
        
        return convertToInvoiceResponse(invoiceOpt.get());
    }

    /**
     * Get all invoices for a customer
     */
    public List<Invoice> getInvoicesForCustomer(Long customerId) {
        return invoiceRepository.findByCustomer(
                bookingRepository.findById(customerId)
                        .orElseThrow(() -> new RuntimeException("Customer not found"))
                        .getUser()
        );
    }

    /**
     * Update invoice PDF URL after generation
     */
    public Invoice updateInvoicePdfUrl(Long invoiceId, String pdfUrl) {
        Invoice invoice = getInvoiceById(invoiceId);
        invoice.setPdfUrl(pdfUrl);
        return invoiceRepository.save(invoice);
    }

    /**
     * Get recent invoices
     */
    public List<Invoice> getRecentInvoices(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return invoiceRepository.findRecentInvoices(since);
    }

    /**
     * Get monthly revenue statistics
     */
    public List<Object[]> getMonthlyRevenue(int monthsBack) {
        LocalDateTime since = LocalDateTime.now().minusMonths(monthsBack);
        return invoiceRepository.getMonthlyRevenue(since);
    }

    /**
     * Convert Invoice entity to InvoiceResponse DTO
     */
    private InvoiceResponse convertToInvoiceResponse(Invoice invoice) {
        return new InvoiceResponse(invoice);
    }
}