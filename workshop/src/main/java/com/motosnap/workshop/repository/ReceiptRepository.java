package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Order;
import com.motosnap.workshop.entity.Receipt;
import com.motosnap.workshop.entity.ReceiptStatus;
import com.motosnap.workshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ReceiptRepository extends JpaRepository<Receipt, Long> {
    
    // Find receipt by order
    Optional<Receipt> findByOrder(Order order);
    
    // Find receipts by status
    List<Receipt> findByStatusOrderByUploadedAtDesc(ReceiptStatus status);
    
    // Find pending receipts for admin approval
    @Query("SELECT r FROM Receipt r WHERE r.status = 'PENDING' ORDER BY r.uploadedAt ASC")
    List<Receipt> findPendingReceipts();
    
    // Find receipts approved by admin
    List<Receipt> findByApprovedByOrderByApprovedAtDesc(User approvedBy);
    
    // Find receipts by date range
    List<Receipt> findByUploadedAtBetweenOrderByUploadedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Statistics queries
    @Query("SELECT COUNT(r) FROM Receipt r WHERE r.status = :status")
    long countByStatus(@Param("status") ReceiptStatus status);
    
    @Query("SELECT COUNT(r) FROM Receipt r WHERE r.uploadedAt BETWEEN :start AND :end")
    long countReceiptsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Recent receipts (last 7 days)
    @Query("SELECT r FROM Receipt r WHERE r.uploadedAt >= :sevenDaysAgo ORDER BY r.uploadedAt DESC")
    List<Receipt> findRecentReceipts(@Param("sevenDaysAgo") LocalDateTime sevenDaysAgo);
}