package com.motosnap.workshop.service;

import com.motosnap.workshop.repository.ReportRepository;
import com.motosnap.workshop.dto.reports.SalesReportDTO;
import com.motosnap.workshop.dto.reports.PartsUsageReportDTO;
import com.motosnap.workshop.dto.reports.MechanicPerformanceDTO;
import com.motosnap.workshop.dto.reports.DashboardDataDTO;
import com.motosnap.workshop.dto.reports.DashboardSummaryDTO;
import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.stream.Collectors;
import java.util.*;

@Service
@Transactional
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    /**
     * Get sales report by period - returns typed DTOs
     */
    public List<SalesReportDTO> getSalesReport(String period, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData;

        switch (period.toLowerCase()) {
            case "daily":
                rawData = reportRepository.getDailyRevenue(since);
                break;
            case "weekly":
                rawData = reportRepository.getWeeklyRevenue(since);
                break;
            case "monthly":
                rawData = reportRepository.getMonthlyRevenue(since);
                break;
            default:
                throw new IllegalArgumentException("Invalid period. Use: daily, weekly, or monthly");
        }

        // Convert Object[] to typed DTOs following existing pattern
        return rawData.stream()
                .map(row -> new SalesReportDTO(row, period))
                .collect(Collectors.toList());
    }

    /**
     * Get parts usage report - returns typed DTOs
     */
    public List<PartsUsageReportDTO> getPartsUsageReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = reportRepository.getMostUsedPartsByQuantity(since);

        // Convert Object[] to typed DTOs following existing pattern
        return rawData.stream()
                .map(PartsUsageReportDTO::new)
                .collect(Collectors.toList());
    }

    /**
     * Get mechanic performance report - returns typed DTOs (database-agnostic)
     */
    public List<MechanicPerformanceDTO> getMechanicPerformanceReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Booking> completedBookings = reportRepository.getCompletedBookingsForTimeCalc(since);

        // Calculate performance statistics in Java (database-agnostic)
        return calculateMechanicPerformanceInJava(completedBookings);
    }

    /**
     * Get comprehensive dashboard data - returns typed DTOs
     */
    public DashboardDataDTO getDashboardData(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        try {
            // Sales data (monthly by default) - convert to DTOs
            List<Object[]> monthlySalesRaw = reportRepository.getMonthlyRevenue(since);
            SalesReportDTO[] monthlySales = monthlySalesRaw.stream()
                    .map(row -> new SalesReportDTO(row, "monthly"))
                    .toArray(SalesReportDTO[]::new);

            // Most used parts - convert to DTOs
            List<Object[]> mostUsedPartsRaw = reportRepository.getMostUsedPartsByQuantity(since);
            PartsUsageReportDTO[] mostUsedParts = mostUsedPartsRaw.stream()
                    .map(PartsUsageReportDTO::new)
                    .toArray(PartsUsageReportDTO[]::new);

            // Mechanic performance - database-agnostic calculation
            List<MechanicPerformanceDTO> mechanicPerformanceList = calculateMechanicPerformanceInJava(
                reportRepository.getCompletedBookingsForTimeCalc(since)
            );
            MechanicPerformanceDTO[] mechanicPerformance = mechanicPerformanceList.toArray(
                new MechanicPerformanceDTO[0]
            );

            // Additional breakdowns - convert to DTOs
            List<Object[]> partsByRevenueRaw = reportRepository.getMostUsedPartsByRevenue(since);
            PartsUsageReportDTO[] partsByRevenue = partsByRevenueRaw.stream()
                    .map(PartsUsageReportDTO::new)
                    .toArray(PartsUsageReportDTO[]::new);

            List<Object[]> partsByCategoryRaw = reportRepository.getPartsUsageByCategory(since);
            DashboardDataDTO.PartsCategorySummaryDTO[] partsByCategory = partsByCategoryRaw.stream()
                    .map(DashboardDataDTO.PartsCategorySummaryDTO::new)
                    .toArray(DashboardDataDTO.PartsCategorySummaryDTO[]::new);

            List<Object[]> mechanicRevenueRaw = reportRepository.getMechanicRevenueStats(since);
            DashboardDataDTO.MechanicRevenueSummaryDTO[] mechanicRevenue = mechanicRevenueRaw.stream()
                    .map(DashboardDataDTO.MechanicRevenueSummaryDTO::new)
                    .toArray(DashboardDataDTO.MechanicRevenueSummaryDTO[]::new);

            List<Object[]> mechanicPartsRequestsRaw = reportRepository.getMechanicPartsRequestStats(since);
            DashboardDataDTO.MechanicPartsRequestSummaryDTO[] mechanicPartsRequests = mechanicPartsRequestsRaw.stream()
                    .map(DashboardDataDTO.MechanicPartsRequestSummaryDTO::new)
                    .toArray(DashboardDataDTO.MechanicPartsRequestSummaryDTO[]::new);

            // Summary statistics - create proper DTO
            DashboardSummaryDTO summary = new DashboardSummaryDTO();
            summary.setTotalRevenue(reportRepository.getTotalRevenueSince(since));
            summary.setTotalOrders(reportRepository.getTotalOrdersSince(since));
            summary.setTotalBookings(reportRepository.getTotalBookingsSince(since));
            summary.setPeriod("Last " + days + " days");

            // Create comprehensive dashboard DTO
            return new DashboardDataDTO(
                    monthlySales,
                    mostUsedParts,
                    mechanicPerformance,
                    partsByRevenue,
                    partsByCategory,
                    mechanicRevenue,
                    mechanicPartsRequests,
                    summary
            );

        } catch (Exception e) {
            System.err.println("Error generating dashboard data: " + e.getMessage());
            throw new RuntimeException("Failed to generate dashboard data", e);
        }
    }

    // NOTE: Legacy formatting methods removed since we now use proper DTOs with built-in conversion
    // The DTOs (SalesReportDTO, PartsUsageReportDTO, MechanicPerformanceDTO) handle their own conversion

    /**
     * Calculate mechanic performance statistics in Java (database-agnostic)
     */
    private List<MechanicPerformanceDTO> calculateMechanicPerformanceInJava(List<Booking> completedBookings) {
        // Group bookings by mechanic
        Map<Long, List<Booking>> bookingsByMechanic = completedBookings.stream()
                .collect(Collectors.groupingBy(b -> b.getAssignedMechanic().getId()));

        List<MechanicPerformanceDTO> results = new ArrayList<>();

        for (Map.Entry<Long, List<Booking>> entry : bookingsByMechanic.entrySet()) {
            Long mechanicId = entry.getKey();
            List<Booking> mechanicBookings = entry.getValue();

            if (!mechanicBookings.isEmpty()) {
                User mechanic = mechanicBookings.get(0).getAssignedMechanic();

                // Calculate statistics in Java (database-agnostic)
                long totalJobs = mechanicBookings.size();
                long completedJobs = mechanicBookings.size(); // All are completed
                double avgCompletionHours = calculateAverageCompletionHours(mechanicBookings);
                double completionRate = (double) completedJobs / totalJobs * 100;

                MechanicPerformanceDTO dto = new MechanicPerformanceDTO();
                dto.setMechanicId(mechanicId);
                dto.setMechanicName(mechanic.getName());
                dto.setMechanicEmail(mechanic.getEmail());
                dto.setTotalJobs(totalJobs);
                dto.setCompletedJobs(completedJobs);
                dto.setCompletionRate(BigDecimal.valueOf(completionRate));
                dto.setAvgCompletionHours(avgCompletionHours);

                results.add(dto);
            }
        }

        return results;
    }

    /**
     * Calculate average completion hours from a list of bookings (database-agnostic)
     */
    private double calculateAverageCompletionHours(List<Booking> bookings) {
        System.out.println("DEBUG: calculateAverageCompletionHours called with " + bookings.size() + " bookings");

        return bookings.stream()
                .filter(b -> b.getCompletedAt() != null)
                .mapToDouble(b -> {
                    // Debug logging for each booking
                    System.out.println("DEBUG: Processing booking ID: " + b.getId());
                    System.out.println("  Scheduled: " + b.getScheduledDateTime());
                    System.out.println("  Started: " + b.getStartedAt());
                    System.out.println("  Completed: " + b.getCompletedAt());
                    System.out.println("  Mechanic: " + (b.getAssignedMechanic() != null ? b.getAssignedMechanic().getName() : "Unknown"));

                    Duration duration;
                    if (b.getStartedAt() != null) {
                        // Prefer actual work duration (started -> completed)
                        duration = Duration.between(b.getStartedAt(), b.getCompletedAt());
                        System.out.println("  Using: started -> completed");
                    } else {
                        // Fallback to scheduled time if startedAt is null
                        duration = Duration.between(b.getScheduledDateTime(), b.getCompletedAt());
                        System.out.println("  Using: scheduled -> completed (fallback, startedAt is null)");
                    }

                    double hours = duration.toMinutes() / 60.0;
                    System.out.println("  Duration: " + hours + " hours");

                    if (hours < 0) {
                        System.out.println("  WARNING: Negative duration detected!");
                    }

                    return hours;
                })
                .average()
                .orElse(0.0);
    }

    /**
     * Validate booking timestamps to identify data quality issues
     */
    public Map<String, Object> validateBookingTimestamps(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Booking> completedBookings = reportRepository.getCompletedBookingsForTimeCalc(since);

        Map<String, Object> report = new HashMap<>();
        report.put("totalCompletedBookings", completedBookings.size());

        // Find bookings with negative durations
        List<Map<String, Object>> problematicBookings = new ArrayList<>();
        int negativeDurationCount = 0;
        int nullStartedAtCount = 0;
        int nullCompletedAtCount = 0;

        for (Booking booking : completedBookings) {
            Map<String, Object> bookingInfo = new HashMap<>();
            bookingInfo.put("id", booking.getId());
            bookingInfo.put("mechanicName", booking.getAssignedMechanic() != null ? booking.getAssignedMechanic().getName() : "Unknown");
            bookingInfo.put("scheduledDateTime", booking.getScheduledDateTime());
            bookingInfo.put("startedAt", booking.getStartedAt());
            bookingInfo.put("completedAt", booking.getCompletedAt());
            bookingInfo.put("status", booking.getStatus());

            // Calculate durations
            if (booking.getCompletedAt() != null && booking.getScheduledDateTime() != null) {
                Duration scheduledToCompleted = Duration.between(booking.getScheduledDateTime(), booking.getCompletedAt());
                double hours1 = scheduledToCompleted.toMinutes() / 60.0;
                bookingInfo.put("scheduledToCompletedHours", hours1);

                if (hours1 < 0) {
                    negativeDurationCount++;
                    bookingInfo.put("hasNegativeDuration", true);
                    problematicBookings.add(bookingInfo);
                }
            }

            if (booking.getStartedAt() != null && booking.getCompletedAt() != null) {
                Duration startedToCompleted = Duration.between(booking.getStartedAt(), booking.getCompletedAt());
                double hours2 = startedToCompleted.toMinutes() / 60.0;
                bookingInfo.put("startedToCompletedHours", hours2);
            } else {
                if (booking.getStartedAt() == null) {
                    nullStartedAtCount++;
                    bookingInfo.put("hasNullStartedAt", true);
                }
            }

            if (booking.getCompletedAt() == null) {
                nullCompletedAtCount++;
                bookingInfo.put("hasNullCompletedAt", true);
            }
        }

        report.put("negativeDurationCount", negativeDurationCount);
        report.put("nullStartedAtCount", nullStartedAtCount);
        report.put("nullCompletedAtCount", nullCompletedAtCount);
        report.put("problematicBookings", problematicBookings);

        // Summary statistics
        Map<String, Object> summary = new HashMap<>();
        summary.put("percentageNegativeDurations", completedBookings.size() > 0 ?
            (double) negativeDurationCount / completedBookings.size() * 100 : 0);
        summary.put("percentageNullStartedAt", completedBookings.size() > 0 ?
            (double) nullStartedAtCount / completedBookings.size() * 100 : 0);
        report.put("summary", summary);

        return report;
    }
}