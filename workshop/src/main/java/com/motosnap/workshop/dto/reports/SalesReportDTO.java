package com.motosnap.workshop.dto.reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for Sales Report data
 * Follows existing patterns from InvoiceResponse and BookingResponse
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SalesReportDTO {

    // Period identification (only one will be populated based on report type)
    private LocalDate date;        // For daily reports
    private Integer week;          // For weekly reports (YEARWEEK format)
    private Integer month;         // For monthly reports (1-12)
    private Integer year;          // For monthly reports

    // Financial metrics
    private BigDecimal revenue;           // Total revenue
    private BigDecimal serviceRevenue;    // Service-only revenue
    private BigDecimal partsRevenue;      // Parts-only revenue

    // Order metrics
    private Long orderCount;              // Number of orders

    /**
     * Constructor for daily reports from Object[] result
     * Expected array: [date, revenue, serviceRevenue, partsRevenue, orderCount]
     */
    public SalesReportDTO(Object[] row, String period) {
        if (row == null || row.length == 0) {
            return;
        }

        try {
            switch (period.toLowerCase()) {
                case "daily":
                    // Daily: [date, revenue, serviceRevenue, partsRevenue, orderCount]
                    this.date = row[0] != null ? LocalDate.parse(row[0].toString()) : null;
                    this.revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
                    this.serviceRevenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                    this.partsRevenue = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
                    this.orderCount = row[4] != null ? ((Number) row[4]).longValue() : 0L;
                    break;

                case "weekly":
                    // Weekly: [week, revenue, serviceRevenue, partsRevenue, orderCount]
                    this.week = row[0] != null ? Integer.parseInt(row[0].toString()) : null;
                    this.revenue = row[1] != null ? new BigDecimal(row[1].toString()) : BigDecimal.ZERO;
                    this.serviceRevenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                    this.partsRevenue = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
                    this.orderCount = row[4] != null ? ((Number) row[4]).longValue() : 0L;
                    break;

                case "monthly":
                    // Monthly: [month, year, revenue, serviceRevenue, partsRevenue, orderCount]
                    this.month = row[0] != null ? Integer.parseInt(row[0].toString()) : null;
                    this.year = row[1] != null ? Integer.parseInt(row[1].toString()) : null;
                    this.revenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                    this.serviceRevenue = row[3] != null ? new BigDecimal(row[3].toString()) : BigDecimal.ZERO;
                    this.partsRevenue = row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO;
                    this.orderCount = row[5] != null ? ((Number) row[5]).longValue() : 0L;
                    break;

                default:
                    throw new IllegalArgumentException("Unsupported period: " + period);
            }
        } catch (Exception e) {
            System.err.println("Error creating SalesReportDTO from row: " + e.getMessage());
            // Set default values to prevent null pointer exceptions
            this.revenue = BigDecimal.ZERO;
            this.serviceRevenue = BigDecimal.ZERO;
            this.partsRevenue = BigDecimal.ZERO;
            this.orderCount = 0L;
        }
    }

    /**
     * Helper method to get formatted period label for display
     */
    public String getPeriodLabel() {
        if (date != null) {
            return date.toString();
        } else if (week != null && year != null) {
            return "Week " + week + " (" + year + ")";
        } else if (month != null && year != null) {
            return java.time.Month.of(month).toString().substring(0, 3) + " " + year;
        }
        return "Unknown Period";
    }

    /**
     * Helper method to get formatted currency values
     */
    public String getFormattedRevenue() {
        return "RM " + (revenue != null ? revenue.toString() : "0.00");
    }

    public String getFormattedServiceRevenue() {
        return "RM " + (serviceRevenue != null ? serviceRevenue.toString() : "0.00");
    }

    public String getFormattedPartsRevenue() {
        return "RM " + (partsRevenue != null ? partsRevenue.toString() : "0.00");
    }
}