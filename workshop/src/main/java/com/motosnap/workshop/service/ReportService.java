package com.motosnap.workshop.service;

import com.motosnap.workshop.repository.ReportRepository;
import com.motosnap.workshop.dto.reports.SalesReportDTO;
import com.motosnap.workshop.dto.reports.PartsUsageReportDTO;
import com.motosnap.workshop.dto.reports.MechanicPerformanceDTO;
import com.motosnap.workshop.dto.reports.DashboardDataDTO;
import com.motosnap.workshop.dto.reports.DashboardSummaryDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
     * Get mechanic performance report - returns typed DTOs
     */
    public List<MechanicPerformanceDTO> getMechanicPerformanceReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rawData = reportRepository.getMechanicJobStats(since);

        // Convert Object[] to typed DTOs following existing pattern
        return rawData.stream()
                .map(MechanicPerformanceDTO::new)
                .collect(Collectors.toList());
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

            // Mechanic performance - convert to DTOs
            List<Object[]> mechanicPerformanceRaw = reportRepository.getMechanicJobStats(since);
            MechanicPerformanceDTO[] mechanicPerformance = mechanicPerformanceRaw.stream()
                    .map(MechanicPerformanceDTO::new)
                    .toArray(MechanicPerformanceDTO[]::new);

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
}