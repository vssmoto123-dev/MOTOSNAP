package com.motosnap.workshop.dto.reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * Comprehensive dashboard data DTO
 * Follows existing patterns from InvoiceResponse and BookingResponse
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDataDTO {

    // Sales data (monthly by default)
    private SalesReportDTO[] monthlySales;

    // Parts usage data
    private PartsUsageReportDTO[] mostUsedParts;

    // Mechanic performance data
    private MechanicPerformanceDTO[] mechanicPerformance;

    // Additional breakdowns (not implemented in frontend yet)
    private PartsUsageReportDTO[] partsByRevenue;
    private PartsCategorySummaryDTO[] partsByCategory;
    private MechanicRevenueSummaryDTO[] mechanicRevenue;
    private MechanicPartsRequestSummaryDTO[] mechanicPartsRequests;

    // Summary statistics
    private DashboardSummaryDTO summary;

    /**
     * Nested DTO for parts category summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PartsCategorySummaryDTO {
        private String category;
        private Long totalQuantity;
        private BigDecimal totalRevenue;
        private Long uniqueParts;

        public PartsCategorySummaryDTO(Object[] row) {
            if (row == null || row.length == 0) return;

            try {
                this.category = row[0] != null ? row[0].toString() : null;
                this.totalQuantity = row[1] != null ? ((Number) row[1]).longValue() : 0L;
                this.totalRevenue = row[2] != null ? new BigDecimal(row[2].toString()) : BigDecimal.ZERO;
                this.uniqueParts = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            } catch (Exception e) {
                System.err.println("Error creating PartsCategorySummaryDTO from row: " + e.getMessage());
                this.totalQuantity = 0L;
                this.totalRevenue = BigDecimal.ZERO;
                this.uniqueParts = 0L;
            }
        }
    }

    /**
     * Nested DTO for mechanic revenue summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MechanicRevenueSummaryDTO {
        private Long mechanicId;
        private String mechanicName;
        private String mechanicEmail;
        private Long completedJobs;
        private BigDecimal totalRevenue;
        private BigDecimal avgRevenuePerJob;

        public MechanicRevenueSummaryDTO(Object[] row) {
            if (row == null || row.length == 0) return;

            try {
                this.mechanicId = row[0] != null ? ((Number) row[0]).longValue() : null;
                this.mechanicName = row[1] != null ? row[1].toString() : null;
                this.mechanicEmail = row[2] != null ? row[2].toString() : null;
                this.completedJobs = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                this.totalRevenue = row[4] != null ? new BigDecimal(row[4].toString()) : BigDecimal.ZERO;
                this.avgRevenuePerJob = row[5] != null ? new BigDecimal(row[5].toString()) : BigDecimal.ZERO;
            } catch (Exception e) {
                System.err.println("Error creating MechanicRevenueSummaryDTO from row: " + e.getMessage());
                this.completedJobs = 0L;
                this.totalRevenue = BigDecimal.ZERO;
                this.avgRevenuePerJob = BigDecimal.ZERO;
            }
        }
    }

    /**
     * Nested DTO for mechanic parts request summary
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MechanicPartsRequestSummaryDTO {
        private Long mechanicId;
        private String mechanicName;
        private String mechanicEmail;
        private Long totalRequests;
        private Long approvedRequests;
        private Long totalPartsRequested;
        private Long totalPartsApproved;

        public MechanicPartsRequestSummaryDTO(Object[] row) {
            if (row == null || row.length == 0) return;

            try {
                this.mechanicId = row[0] != null ? ((Number) row[0]).longValue() : null;
                this.mechanicName = row[1] != null ? row[1].toString() : null;
                this.mechanicEmail = row[2] != null ? row[2].toString() : null;
                this.totalRequests = row[3] != null ? ((Number) row[3]).longValue() : 0L;
                this.approvedRequests = row[4] != null ? ((Number) row[4]).longValue() : 0L;
                this.totalPartsRequested = row[5] != null ? ((Number) row[5]).longValue() : 0L;
                this.totalPartsApproved = row[6] != null ? ((Number) row[6]).longValue() : 0L;
            } catch (Exception e) {
                System.err.println("Error creating MechanicPartsRequestSummaryDTO from row: " + e.getMessage());
                this.totalRequests = 0L;
                this.approvedRequests = 0L;
                this.totalPartsRequested = 0L;
                this.totalPartsApproved = 0L;
            }
        }
    }
}