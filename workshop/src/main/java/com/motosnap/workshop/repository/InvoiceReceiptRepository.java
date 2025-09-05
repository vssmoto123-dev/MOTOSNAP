package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.InvoiceReceipt;
import com.motosnap.workshop.entity.InvoicePayment;
import com.motosnap.workshop.entity.ReceiptStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceReceiptRepository extends JpaRepository<InvoiceReceipt, Long> {
    
    // Find receipt by invoice payment
    Optional<InvoiceReceipt> findByInvoicePayment(InvoicePayment invoicePayment);
    
    // Find receipts by status
    List<InvoiceReceipt> findByStatusOrderByUploadedAtDesc(ReceiptStatus status);
    
    // Find pending receipts for admin review
    List<InvoiceReceipt> findByStatusInOrderByUploadedAtDesc(List<ReceiptStatus> statuses);
    
    // Find receipts by date range
    List<InvoiceReceipt> findByUploadedAtBetweenOrderByUploadedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Count receipts by status
    long countByStatus(ReceiptStatus status);
    
    // Find recent receipts
    @Query("SELECT ir FROM InvoiceReceipt ir WHERE ir.uploadedAt >= :since ORDER BY ir.uploadedAt DESC")
    List<InvoiceReceipt> findRecentReceipts(@Param("since") LocalDateTime since);
}