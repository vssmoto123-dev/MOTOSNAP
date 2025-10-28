package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.BookingStatus;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.entity.OrderItem;
import com.motosnap.workshop.entity.OrderStatus;
import com.motosnap.workshop.entity.Request;
import com.motosnap.workshop.entity.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReportRepository extends JpaRepository<Booking, Long> {

    // ===============================================================================
    // SALES REPORT QUERIES
    // ===============================================================================

    // Daily revenue with NULL handling
    @Query(value = "SELECT DATE(generated_at) as \"date\", " +
                   "COALESCE(SUM(total_amount), 0) as revenue, " +
                   "COALESCE(SUM(service_amount), 0) as service_revenue, " +
                   "COALESCE(SUM(parts_amount), 0) as parts_revenue, " +
                   "COUNT(*) as order_count " +
                   "FROM invoices WHERE generated_at >= :since " +
                   "GROUP BY DATE(generated_at) ORDER BY \"date\" DESC", nativeQuery = true)
    List<Object[]> getDailyRevenue(@Param("since") LocalDateTime since);

    // Weekly revenue with NULL handling (H2 compatible)
    @Query(value = "SELECT EXTRACT(WEEK FROM generated_at) as \"week\", EXTRACT(YEAR FROM generated_at) as \"year\", " +
                   "COALESCE(SUM(total_amount), 0) as revenue, " +
                   "COALESCE(SUM(service_amount), 0) as service_revenue, " +
                   "COALESCE(SUM(parts_amount), 0) as parts_revenue, " +
                   "COUNT(*) as order_count " +
                   "FROM invoices WHERE generated_at >= :since " +
                   "GROUP BY EXTRACT(YEAR FROM generated_at), EXTRACT(WEEK FROM generated_at) " +
                   "ORDER BY \"year\" DESC, \"week\" DESC", nativeQuery = true)
    List<Object[]> getWeeklyRevenue(@Param("since") LocalDateTime since);

    // Monthly revenue with NULL handling (H2 compatible)
    @Query(value = "SELECT EXTRACT(MONTH FROM generated_at) as \"month\", EXTRACT(YEAR FROM generated_at) as \"year\", " +
                   "COALESCE(SUM(total_amount), 0) as revenue, " +
                   "COALESCE(SUM(service_amount), 0) as service_revenue, " +
                   "COALESCE(SUM(parts_amount), 0) as parts_revenue, " +
                   "COUNT(*) as order_count " +
                   "FROM invoices WHERE generated_at >= :since " +
                   "GROUP BY EXTRACT(YEAR FROM generated_at), EXTRACT(MONTH FROM generated_at) " +
                   "ORDER BY \"year\" DESC, \"month\" DESC", nativeQuery = true)
    List<Object[]> getMonthlyRevenue(@Param("since") LocalDateTime since);

    // ===============================================================================
    // PARTS USAGE QUERIES
    // ===============================================================================

    // Most used parts by quantity with NULL handling
    @Query(value = "SELECT i.id, i.part_name, i.part_code, i.brand, i.category, " +
                   "COALESCE(SUM(oi.qty), 0) as total_quantity, " +
                   "COALESCE(SUM(oi.qty * oi.price), 0) as total_revenue " +
                   "FROM order_items oi " +
                   "JOIN inventory i ON oi.part_id = i.id " +
                   "JOIN orders o ON oi.order_id = o.id " +
                   "WHERE o.created_at >= :since AND o.status = 'APPROVED' " +
                   "GROUP BY i.id, i.part_name, i.part_code, i.brand, i.category " +
                   "ORDER BY total_quantity DESC LIMIT 20", nativeQuery = true)
    List<Object[]> getMostUsedPartsByQuantity(@Param("since") LocalDateTime since);

    // Most used parts by revenue with NULL handling
    @Query(value = "SELECT i.id, i.part_name, i.part_code, i.brand, i.category, " +
                   "COALESCE(SUM(oi.qty), 0) as total_quantity, " +
                   "COALESCE(SUM(oi.qty * oi.price), 0) as total_revenue " +
                   "FROM order_items oi " +
                   "JOIN inventory i ON oi.part_id = i.id " +
                   "JOIN orders o ON oi.order_id = o.id " +
                   "WHERE o.created_at >= :since AND o.status = 'APPROVED' " +
                   "GROUP BY i.id, i.part_name, i.part_code, i.brand, i.category " +
                   "ORDER BY total_revenue DESC LIMIT 20", nativeQuery = true)
    List<Object[]> getMostUsedPartsByRevenue(@Param("since") LocalDateTime since);

    // Parts usage by category
    @Query(value = "SELECT i.category, SUM(oi.qty) as total_quantity, " +
                   "SUM(oi.qty * oi.price) as total_revenue, COUNT(DISTINCT i.id) as unique_parts " +
                   "FROM order_items oi " +
                   "JOIN inventory i ON oi.part_id = i.id " +
                   "JOIN orders o ON oi.order_id = o.id " +
                   "WHERE o.created_at >= :since AND o.status = 'APPROVED' AND i.category IS NOT NULL " +
                   "GROUP BY i.category " +
                   "ORDER BY total_revenue DESC", nativeQuery = true)
    List<Object[]> getPartsUsageByCategory(@Param("since") LocalDateTime since);

    // ===============================================================================
    // MECHANIC PERFORMANCE QUERIES
    // ===============================================================================

    // Mechanic job completion stats - database-agnostic version
    @Query("SELECT b FROM Booking b " +
           "WHERE b.scheduledDateTime >= :since " +
           "AND b.status = 'COMPLETED' " +
           "AND b.completedAt IS NOT NULL " +
           "AND b.assignedMechanic IS NOT NULL")
    List<Booking> getCompletedBookingsForTimeCalc(@Param("since") LocalDateTime since);

    // Mechanic revenue generation
    @Query(value = "SELECT u.id, u.name, u.email, " +
                   "COUNT(b.id) as completed_jobs, " +
                   "SUM(i.total_amount) as total_revenue, " +
                   "AVG(i.total_amount) as avg_revenue_per_job " +
                   "FROM bookings b " +
                   "JOIN users u ON b.assigned_mechanic_id = u.id " +
                   "LEFT JOIN invoices i ON b.id = i.booking_id " +
                   "WHERE b.scheduled_date_time >= :since AND b.status = 'COMPLETED' " +
                   "GROUP BY u.id, u.name, u.email " +
                   "ORDER BY total_revenue DESC", nativeQuery = true)
    List<Object[]> getMechanicRevenueStats(@Param("since") LocalDateTime since);

    // Mechanic parts request stats
    @Query(value = "SELECT u.id, u.name, u.email, " +
                   "COUNT(r.id) as total_requests, " +
                   "SUM(CASE WHEN r.status = 'APPROVED' THEN 1 ELSE 0 END) as approved_requests, " +
                   "SUM(r.qty) as total_parts_requested, " +
                   "SUM(CASE WHEN r.status = 'APPROVED' THEN r.qty ELSE 0 END) as total_parts_approved " +
                   "FROM requests r " +
                   "JOIN users u ON r.mechanic_id = u.id " +
                   "WHERE r.requested_at >= :since " +
                   "GROUP BY u.id, u.name, u.email " +
                   "ORDER BY approved_requests DESC", nativeQuery = true)
    List<Object[]> getMechanicPartsRequestStats(@Param("since") LocalDateTime since);

    // ===============================================================================
    // GENERAL STATISTICS QUERIES
    // ===============================================================================

    // Total revenue for period
    @Query(value = "SELECT SUM(total_amount) FROM invoices WHERE generated_at >= :since", nativeQuery = true)
    BigDecimal getTotalRevenueSince(@Param("since") LocalDateTime since);

    // Total orders for period
    @Query(value = "SELECT COUNT(*) FROM orders WHERE created_at >= :since", nativeQuery = true)
    Long getTotalOrdersSince(@Param("since") LocalDateTime since);

    // Total bookings for period
    @Query(value = "SELECT COUNT(*) FROM bookings WHERE scheduled_date_time >= :since", nativeQuery = true)
    Long getTotalBookingsSince(@Param("since") LocalDateTime since);
}