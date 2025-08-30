package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Order;
import com.motosnap.workshop.entity.OrderStatus;
import com.motosnap.workshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    
    // Find orders by user
    List<Order> findByUserOrderByCreatedAtDesc(User user);
    List<Order> findByUserAndStatusOrderByCreatedAtDesc(User user, OrderStatus status);
    
    // Find orders by status
    List<Order> findByStatusOrderByCreatedAtDesc(OrderStatus status);
    
    // Find pending orders for admin approval
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' ORDER BY o.createdAt ASC")
    List<Order> findPendingOrders();
    
    // Find orders requiring approval (with receipts)
    @Query("SELECT o FROM Order o WHERE o.status = 'PENDING' AND o.receipt IS NOT NULL ORDER BY o.createdAt ASC")
    List<Order> findOrdersWithReceipts();
    
    // Find orders by date range
    List<Order> findByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Statistics queries
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);
    
    @Query("SELECT COUNT(o) FROM Order o WHERE o.createdAt BETWEEN :start AND :end")
    long countOrdersBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Find recent orders (last 30 days)
    @Query("SELECT o FROM Order o WHERE o.createdAt >= :thirtyDaysAgo ORDER BY o.createdAt DESC")
    List<Order> findRecentOrders(@Param("thirtyDaysAgo") LocalDateTime thirtyDaysAgo);
}