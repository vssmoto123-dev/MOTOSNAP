package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.Inventory;
import com.motosnap.workshop.entity.Request;
import com.motosnap.workshop.entity.RequestStatus;
import com.motosnap.workshop.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    
    // Find requests by mechanic
    List<Request> findByMechanicOrderByRequestedAtDesc(User mechanic);
    List<Request> findByMechanicAndStatusOrderByRequestedAtDesc(User mechanic, RequestStatus status);
    
    // Find requests by booking
    List<Request> findByBookingOrderByRequestedAtAsc(Booking booking);
    
    // Find requests by part
    List<Request> findByPartOrderByRequestedAtDesc(Inventory part);
    
    // Find requests by status
    List<Request> findByStatusOrderByRequestedAtDesc(RequestStatus status);
    
    // Find recent requests
    @Query("SELECT r FROM Request r WHERE r.requestedAt >= :since ORDER BY r.requestedAt DESC")
    List<Request> findRecentRequests(@Param("since") LocalDateTime since);
    
    // Parts usage statistics
    @Query("SELECT r.part, SUM(r.qty) as totalUsed FROM Request r WHERE r.status = :status GROUP BY r.part ORDER BY totalUsed DESC")
    List<Object[]> findMostUsedParts(@Param("status") RequestStatus status);
    
    @Query("SELECT r.mechanic, COUNT(r) as requestCount FROM Request r GROUP BY r.mechanic ORDER BY requestCount DESC")
    List<Object[]> findMechanicRequestCounts();
    
    // Find requests by date range
    List<Request> findByRequestedAtBetweenOrderByRequestedAtDesc(LocalDateTime start, LocalDateTime end);
    
    // Today's requests
    @Query(value = "SELECT * FROM requests WHERE DATE(requested_at) = CURRENT_DATE ORDER BY requested_at DESC", nativeQuery = true)
    List<Request> findTodayRequests();
}