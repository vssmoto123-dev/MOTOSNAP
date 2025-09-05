package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Invoice;
import com.motosnap.workshop.entity.InvoicePayment;
import com.motosnap.workshop.entity.InvoicePaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoicePaymentRepository extends JpaRepository<InvoicePayment, Long> {
    
    // Find payment by invoice
    Optional<InvoicePayment> findByInvoice(Invoice invoice);
    
    // Find payments by status
    List<InvoicePayment> findByStatusOrderByCreatedAtDesc(InvoicePaymentStatus status);
    
    // Find pending payments (for admin approval)
    List<InvoicePayment> findByStatusInOrderByCreatedAtDesc(List<InvoicePaymentStatus> statuses);
    
    // Find payments by date range
    List<InvoicePayment> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Find payments for a specific customer
    @Query("SELECT ip FROM InvoicePayment ip WHERE ip.invoice.booking.user.id = :customerId ORDER BY ip.createdAt DESC")
    List<InvoicePayment> findByCustomerId(@Param("customerId") Long customerId);
    
    // Count payments by status
    long countByStatus(InvoicePaymentStatus status);
    
    // Find recent payments
    @Query("SELECT ip FROM InvoicePayment ip WHERE ip.createdAt >= :since ORDER BY ip.createdAt DESC")
    List<InvoicePayment> findRecentPayments(@Param("since") LocalDateTime since);
}