package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.BookingRequest;
import com.motosnap.workshop.dto.BookingResponse;
import com.motosnap.workshop.dto.BookingStatusUpdateRequest;
import com.motosnap.workshop.dto.InvoiceResponse;
import com.motosnap.workshop.entity.*;
import com.motosnap.workshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class BookingService {

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private InvoiceService invoiceService;

    public BookingResponse createBooking(String userEmail, BookingRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        com.motosnap.workshop.entity.Service service = serviceRepository.findById(request.getServiceId())
                .orElseThrow(() -> new RuntimeException("Service not found"));

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Verify vehicle belongs to user
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Vehicle does not belong to user");
        }

        // Check if service is active
        if (!service.getActive()) {
            throw new RuntimeException("Service is not available");
        }

        // Create new booking
        Booking booking = new Booking(
                request.getScheduledDateTime(),
                request.getNotes(),
                user,
                vehicle,
                service
        );

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public List<BookingResponse> getUserBookings(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Booking> bookings = bookingRepository.findByUserOrderByScheduledDateTimeDesc(user);
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        List<Booking> bookings = bookingRepository.findByStatusOrderByScheduledDateTimeAsc(status);
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getTodayBookings() {
        List<Booking> bookings = bookingRepository.findTodayBookings();
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getUpcomingBookings() {
        List<Booking> bookings = bookingRepository.findUpcomingBookings();
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse getBookingById(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return convertToBookingResponse(booking);
    }

    public BookingResponse updateBookingStatus(Long bookingId, BookingStatusUpdateRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        BookingStatus oldStatus = booking.getStatus();
        booking.setStatus(request.getStatus());
        
        // Set status notes if provided
        if (request.getStatusNotes() != null && !request.getStatusNotes().trim().isEmpty()) {
            booking.setStatusNotes(request.getStatusNotes());
        }

        // Handle status-specific logic
        switch (request.getStatus()) {
            case CONFIRMED:
                if (oldStatus == BookingStatus.PENDING) {
                    // Booking confirmed
                }
                break;
            case IN_PROGRESS:
                if (booking.getStartedAt() == null) {
                    booking.setStartedAt(LocalDateTime.now());
                }
                break;
            case COMPLETED:
                if (booking.getCompletedAt() == null) {
                    booking.setCompletedAt(LocalDateTime.now());
                }
                break;
            case CANCELLED:
                // Handle cancellation logic if needed
                break;
        }

        // Assign mechanic if provided
        if (request.getAssignedMechanicId() != null) {
            User mechanic = userRepository.findById(request.getAssignedMechanicId())
                    .orElseThrow(() -> new RuntimeException("Mechanic not found"));
            
            if (!mechanic.getRole().equals(Role.MECHANIC) && !mechanic.getRole().equals(Role.ADMIN)) {
                throw new RuntimeException("User is not a mechanic");
            }
            
            booking.setAssignedMechanic(mechanic);
        }

        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    public List<BookingResponse> getMechanicBookings(String mechanicEmail) {
        User mechanic = userRepository.findByEmail(mechanicEmail)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        List<Booking> bookings = bookingRepository.findByAssignedMechanicOrderByScheduledDateTimeAsc(mechanic);
        return bookings.stream()
                .map(this::convertToBookingResponse)
                .collect(Collectors.toList());
    }

    public BookingResponse assignMechanic(Long bookingId, Long mechanicId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        User mechanic = userRepository.findById(mechanicId)
                .orElseThrow(() -> new RuntimeException("Mechanic not found"));

        if (!mechanic.getRole().equals(Role.MECHANIC) && !mechanic.getRole().equals(Role.ADMIN)) {
            throw new RuntimeException("User is not a mechanic");
        }

        booking.setAssignedMechanic(mechanic);
        booking = bookingRepository.save(booking);
        return convertToBookingResponse(booking);
    }

    private BookingResponse convertToBookingResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        
        response.setId(booking.getId());
        response.setScheduledDateTime(booking.getScheduledDateTime());
        response.setStatus(booking.getStatus());
        response.setNotes(booking.getNotes());
        response.setStatusNotes(booking.getStatusNotes());
        response.setCreatedAt(booking.getCreatedAt());
        response.setUpdatedAt(booking.getUpdatedAt());
        response.setStartedAt(booking.getStartedAt());
        response.setCompletedAt(booking.getCompletedAt());

        // Service information
        com.motosnap.workshop.entity.Service service = booking.getService();
        response.setServiceId(service.getId());
        response.setServiceName(service.getName());
        response.setServiceCategory(service.getCategory());
        response.setServiceDescription(service.getDescription());
        response.setServiceBasePrice(service.getBasePrice().doubleValue());
        response.setServiceEstimatedDurationMinutes(service.getEstimatedDurationMinutes());

        // Vehicle information
        Vehicle vehicle = booking.getVehicle();
        response.setVehicleId(vehicle.getId());
        response.setVehiclePlateNo(vehicle.getPlateNo());
        response.setVehicleModel(vehicle.getModel());
        response.setVehicleBrand(vehicle.getBrand());
        response.setVehicleYear(vehicle.getYear());

        // Customer information
        User customer = booking.getUser();
        response.setCustomerId(customer.getId());
        response.setCustomerName(customer.getName());
        response.setCustomerEmail(customer.getEmail());

        // Mechanic information (if assigned)
        if (booking.getAssignedMechanic() != null) {
            User mechanic = booking.getAssignedMechanic();
            response.setAssignedMechanicId(mechanic.getId());
            response.setAssignedMechanicName(mechanic.getName());
        }

        // Invoice status - simple check using existing relationship
        response.setHasInvoice(booking.getInvoice() != null);

        return response;
    }

    // Helper method to access InvoiceService from controller
    public InvoiceService getInvoiceService() {
        return invoiceService;
    }
}