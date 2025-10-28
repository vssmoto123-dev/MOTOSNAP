package com.motosnap.workshop.dto.reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Data Transfer Object for Mechanic Performance Report data
 * Follows existing patterns from InvoiceResponse and BookingResponse
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MechanicPerformanceDTO {

    // Mechanic identification
    private Long mechanicId;
    private String mechanicName;
    private String mechanicEmail;

    // Job metrics
    private Long totalJobs;             // Total jobs assigned
    private Long completedJobs;         // Jobs completed successfully
    private BigDecimal completionRate;  // Completion rate percentage
    private Double avgCompletionHours;  // Average time to complete jobs

    /**
     * Constructor from Object[] result
     * Expected array: [mechanicId, mechanicName, mechanicEmail, totalJobs, completedJobs, avgCompletionHours]
     */
    public MechanicPerformanceDTO(Object[] row) {
        if (row == null || row.length == 0) {
            return;
        }

        try {
            this.mechanicId = row[0] != null ? ((Number) row[0]).longValue() : null;
            this.mechanicName = row[1] != null ? row[1].toString() : null;
            this.mechanicEmail = row[2] != null ? row[2].toString() : null;
            this.totalJobs = row[3] != null ? ((Number) row[3]).longValue() : 0L;
            this.completedJobs = row[4] != null ? ((Number) row[4]).longValue() : 0L;

            // Calculate completion rate
            if (this.totalJobs != null && this.totalJobs > 0) {
                BigDecimal completed = BigDecimal.valueOf(this.completedJobs);
                BigDecimal total = BigDecimal.valueOf(this.totalJobs);
                this.completionRate = completed.divide(total, 2, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100));
            } else {
                this.completionRate = BigDecimal.ZERO;
            }

            // Average completion hours (may be null)
            if (row[5] != null) {
                this.avgCompletionHours = Double.parseDouble(row[5].toString());
            } else {
                this.avgCompletionHours = null;
            }
        } catch (Exception e) {
            System.err.println("Error creating MechanicPerformanceDTO from row: " + e.getMessage());
            // Set default values to prevent null pointer exceptions
            this.totalJobs = 0L;
            this.completedJobs = 0L;
            this.completionRate = BigDecimal.ZERO;
            this.avgCompletionHours = null;
        }
    }

    /**
     * Helper method to get formatted completion rate
     */
    public String getFormattedCompletionRate() {
        if (completionRate != null) {
            return completionRate.toString() + "%";
        }
        return "0%";
    }

    /**
     * Helper method to get formatted average completion time
     */
    public String getFormattedAvgCompletionHours() {
        if (avgCompletionHours != null && avgCompletionHours > 0) {
            return String.format("%.1f hrs", avgCompletionHours);
        }
        return "N/A";
    }

    /**
     * Helper method to get performance status color
     */
    public String getPerformanceStatus() {
        if (completionRate != null) {
            if (completionRate.compareTo(BigDecimal.valueOf(90)) >= 0) {
                return "excellent";
            } else if (completionRate.compareTo(BigDecimal.valueOf(70)) >= 0) {
                return "good";
            } else {
                return "needs-improvement";
            }
        }
        return "unknown";
    }

    /**
     * Helper method to get display name for charts
     */
    public String getDisplayName() {
        String name = mechanicName != null && !mechanicName.trim().isEmpty() ? mechanicName : "Unknown Mechanic";
        if (name.length() > 15) {
            name = name.substring(0, 15) + "...";
        }
        return name;
    }
}