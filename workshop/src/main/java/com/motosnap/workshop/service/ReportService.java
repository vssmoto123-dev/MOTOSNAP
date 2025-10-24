package com.motosnap.workshop.service;

import com.motosnap.workshop.repository.ReportRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@Transactional
public class ReportService {

    @Autowired
    private ReportRepository reportRepository;

    /**
     * Get sales report by period
     */
    public List<Object[]> getSalesReport(String period, int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        switch (period.toLowerCase()) {
            case "daily":
                return reportRepository.getDailyRevenue(since);
            case "weekly":
                return reportRepository.getWeeklyRevenue(since);
            case "monthly":
                return reportRepository.getMonthlyRevenue(since);
            default:
                throw new IllegalArgumentException("Invalid period. Use: daily, weekly, or monthly");
        }
    }

    /**
     * Get parts usage report
     */
    public List<Object[]> getPartsUsageReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return reportRepository.getMostUsedPartsByQuantity(since);
    }

    /**
     * Get mechanic performance report
     */
    public List<Object[]> getMechanicPerformanceReport(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        return reportRepository.getMechanicJobStats(since);
    }

    /**
     * Get comprehensive dashboard data
     */
    public Map<String, Object> getDashboardData(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);

        Map<String, Object> dashboardData = new HashMap<>();

        try {
            // Sales data (monthly by default)
            dashboardData.put("monthlySales", reportRepository.getMonthlyRevenue(since));

            // Most used parts
            dashboardData.put("mostUsedParts", reportRepository.getMostUsedPartsByQuantity(since));

            // Mechanic performance
            dashboardData.put("mechanicPerformance", reportRepository.getMechanicJobStats(since));

            // Summary statistics
            Map<String, Object> summary = new HashMap<>();
            summary.put("totalRevenue", reportRepository.getTotalRevenueSince(since));
            summary.put("totalOrders", reportRepository.getTotalOrdersSince(since));
            summary.put("totalBookings", reportRepository.getTotalBookingsSince(since));
            summary.put("period", "Last " + days + " days");
            dashboardData.put("summary", summary);

            // Additional breakdowns
            dashboardData.put("partsByRevenue", reportRepository.getMostUsedPartsByRevenue(since));
            dashboardData.put("partsByCategory", reportRepository.getPartsUsageByCategory(since));
            dashboardData.put("mechanicRevenue", reportRepository.getMechanicRevenueStats(since));
            dashboardData.put("mechanicPartsRequests", reportRepository.getMechanicPartsRequestStats(since));

        } catch (Exception e) {
            System.err.println("Error generating dashboard data: " + e.getMessage());
            throw new RuntimeException("Failed to generate dashboard data", e);
        }

        return dashboardData;
    }

    /**
     * Format sales data for frontend consumption
     */
    public List<Map<String, Object>> formatSalesData(List<Object[]> rawData, String period) {
        List<Map<String, Object>> formattedData = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> dataPoint = new HashMap<>();

            if (period.equals("daily")) {
                dataPoint.put("date", row[0]); // DATE
                dataPoint.put("revenue", row[1]); // SUM(total_amount)
                dataPoint.put("serviceRevenue", row[2]); // SUM(service_amount)
                dataPoint.put("partsRevenue", row[3]); // SUM(parts_amount)
                dataPoint.put("orderCount", row[4]); // COUNT(*)
            } else if (period.equals("weekly")) {
                dataPoint.put("week", row[0]); // YEARWEEK
                dataPoint.put("revenue", row[1]); // SUM(total_amount)
                dataPoint.put("serviceRevenue", row[2]); // SUM(service_amount)
                dataPoint.put("partsRevenue", row[3]); // SUM(parts_amount)
                dataPoint.put("orderCount", row[4]); // COUNT(*)
            } else if (period.equals("monthly")) {
                dataPoint.put("month", row[0]); // MONTH
                dataPoint.put("year", row[1]); // YEAR
                dataPoint.put("revenue", row[2]); // SUM(total_amount)
                dataPoint.put("serviceRevenue", row[3]); // SUM(service_amount)
                dataPoint.put("partsRevenue", row[4]); // SUM(parts_amount)
                dataPoint.put("orderCount", row[5]); // COUNT(*)
            }

            formattedData.add(dataPoint);
        }

        return formattedData;
    }

    /**
     * Format parts usage data for frontend consumption
     */
    public List<Map<String, Object>> formatPartsUsageData(List<Object[]> rawData) {
        List<Map<String, Object>> formattedData = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("partId", row[0]); // i.id
            dataPoint.put("partName", row[1]); // i.part_name
            dataPoint.put("partCode", row[2]); // i.part_code
            dataPoint.put("brand", row[3]); // i.brand
            dataPoint.put("category", row[4]); // i.category
            dataPoint.put("totalQuantity", row[5]); // SUM(oi.qty)
            dataPoint.put("totalRevenue", row[6]); // SUM(oi.qty * oi.price)

            formattedData.add(dataPoint);
        }

        return formattedData;
    }

    /**
     * Format mechanic performance data for frontend consumption
     */
    public List<Map<String, Object>> formatMechanicPerformanceData(List<Object[]> rawData) {
        List<Map<String, Object>> formattedData = new ArrayList<>();

        for (Object[] row : rawData) {
            Map<String, Object> dataPoint = new HashMap<>();
            dataPoint.put("mechanicId", row[0]); // u.id
            dataPoint.put("mechanicName", row[1]); // u.name
            dataPoint.put("mechanicEmail", row[2]); // u.email
            dataPoint.put("totalJobs", row[3]); // COUNT(b.id)
            dataPoint.put("completedJobs", row[4]); // SUM(CASE WHEN b.status = 'COMPLETED' THEN 1 ELSE 0 END)
            dataPoint.put("avgCompletionHours", row[5]); // AVG(TIMESTAMPDIFF(...))

            // Calculate completion rate
            Integer totalJobs = ((Number) row[3]).intValue();
            Integer completedJobs = ((Number) row[4]).intValue();
            double completionRate = totalJobs > 0 ? (double) completedJobs / totalJobs * 100 : 0;
            dataPoint.put("completionRate", Math.round(completionRate * 100.0) / 100.0);

            formattedData.add(dataPoint);
        }

        return formattedData;
    }
}