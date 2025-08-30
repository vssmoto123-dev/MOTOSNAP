package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.Invoice;
import com.motosnap.workshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    
    // Find invoice by booking
    Optional<Invoice> findByBooking(Booking booking);
    
    // Find invoice by invoice number
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);
    boolean existsByInvoiceNumber(String invoiceNumber);
    
    // Find invoices by customer
    @Query("SELECT i FROM Invoice i WHERE i.booking.user = :customer ORDER BY i.generatedAt DESC")
    List<Invoice> findByCustomer(@Param("customer") User customer);
    
    // Find invoices by date range
    List<Invoice> findByGeneratedAtBetweenOrderByGeneratedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Revenue statistics
    @Query("SELECT SUM(i.totalAmount) FROM Invoice i WHERE i.generatedAt BETWEEN :start AND :end")
    BigDecimal getTotalRevenueBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(i.serviceAmount) FROM Invoice i WHERE i.generatedAt BETWEEN :start AND :end")
    BigDecimal getServiceRevenueBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT SUM(i.partsAmount) FROM Invoice i WHERE i.generatedAt BETWEEN :start AND :end")
    BigDecimal getPartsRevenueBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Monthly revenue
    @Query("SELECT MONTH(i.generatedAt) as month, YEAR(i.generatedAt) as year, SUM(i.totalAmount) as revenue " +
           "FROM Invoice i WHERE i.generatedAt >= :since GROUP BY YEAR(i.generatedAt), MONTH(i.generatedAt) " +
           "ORDER BY year DESC, month DESC")
    List<Object[]> getMonthlyRevenue(@Param("since") LocalDateTime since);
    
    // Recent invoices
    @Query("SELECT i FROM Invoice i WHERE i.generatedAt >= :since ORDER BY i.generatedAt DESC")
    List<Invoice> findRecentInvoices(@Param("since") LocalDateTime since);
    
    // Count invoices
    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.generatedAt BETWEEN :start AND :end")
    long countInvoicesBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
}