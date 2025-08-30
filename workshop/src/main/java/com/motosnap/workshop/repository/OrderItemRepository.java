package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.entity.Order;
import com.motosnap.workshop.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    
    // Find order items by order
    List<OrderItem> findByOrder(Order order);
    
    // Find order items by part
    List<OrderItem> findByPart(Inventory part);
    
    // Most ordered parts statistics
    @Query("SELECT oi.part, SUM(oi.qty) as totalQty FROM OrderItem oi GROUP BY oi.part ORDER BY totalQty DESC")
    List<Object[]> findMostOrderedParts();
    
    @Query("SELECT oi.part, COUNT(oi) as orderCount FROM OrderItem oi GROUP BY oi.part ORDER BY orderCount DESC")
    List<Object[]> findMostFrequentlyOrderedParts();
    
    // Revenue by part
    @Query("SELECT oi.part, SUM(oi.price * oi.qty) as totalRevenue FROM OrderItem oi " +
           "JOIN oi.order o WHERE o.status = 'COMPLETED' GROUP BY oi.part ORDER BY totalRevenue DESC")
    List<Object[]> findRevenueByPart();
}