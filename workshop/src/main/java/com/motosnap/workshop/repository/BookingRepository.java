package com.motosnap.workshop.repository;

import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.BookingStatus;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    
    // Find bookings by user (customer's bookings)
    List<Booking> findByUserOrderByScheduledDateTimeDesc(User user);
    List<Booking> findByUserAndStatusOrderByScheduledDateTimeDesc(User user, BookingStatus status);
    
    // Find bookings by mechanic
    List<Booking> findByAssignedMechanicOrderByScheduledDateTimeAsc(User mechanic);
    List<Booking> findByAssignedMechanicAndStatusOrderByScheduledDateTimeAsc(User mechanic, BookingStatus status);
    
    // Find bookings by status
    List<Booking> findByStatusOrderByScheduledDateTimeAsc(BookingStatus status);
    
    // Find bookings by date range
    List<Booking> findByScheduledDateTimeBetweenOrderByScheduledDateTimeAsc(LocalDateTime start, LocalDateTime end);
    
    // Find today's bookings
    @Query(value = "SELECT * FROM bookings WHERE DATE(scheduled_date_time) = CURRENT_DATE ORDER BY scheduled_date_time ASC", nativeQuery = true)
    List<Booking> findTodayBookings();
    
    // Find upcoming bookings
    @Query("SELECT b FROM Booking b WHERE b.scheduledDateTime > CURRENT_TIMESTAMP AND b.status IN ('PENDING', 'CONFIRMED') ORDER BY b.scheduledDateTime ASC")
    List<Booking> findUpcomingBookings();
    
    // Find overdue bookings
    @Query("SELECT b FROM Booking b WHERE b.scheduledDateTime < CURRENT_TIMESTAMP AND b.status = 'CONFIRMED' ORDER BY b.scheduledDateTime ASC")
    List<Booking> findOverdueBookings();
    
    // Find bookings by vehicle
    List<Booking> findByVehicleOrderByScheduledDateTimeDesc(Vehicle vehicle);
    
    // Mechanic workload queries
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.assignedMechanic.id = :mechanicId AND b.status IN ('CONFIRMED', 'IN_PROGRESS')")
    long countActivebookingsByMechanic(@Param("mechanicId") Long mechanicId);
    
    @Query(value = "SELECT * FROM bookings WHERE assigned_mechanic_id = :mechanicId AND DATE(scheduled_date_time) = CURRENT_DATE", nativeQuery = true)
    List<Booking> findTodayBookingsByMechanic(@Param("mechanicId") Long mechanicId);
    
    // Statistics queries
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.status = :status")
    long countByStatus(@Param("status") BookingStatus status);
    
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.scheduledDateTime BETWEEN :start AND :end")
    long countBookingsBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    // Find unassigned bookings
    @Query("SELECT b FROM Booking b WHERE b.assignedMechanic IS NULL AND b.status = 'CONFIRMED' ORDER BY b.scheduledDateTime ASC")
    List<Booking> findUnassignedBookings();
}