package com.motosnap.workshop.dto.reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * Data Transfer Object for Parts Usage Report data
 * Follows existing patterns from InvoiceResponse and BookingResponse
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartsUsageReportDTO {

    // Part identification
    private Long partId;
    private String partName;
    private String partCode;
    private String brand;
    private String category;

    // Usage metrics
    private Long totalQuantity;      // Total quantity used
    private BigDecimal totalRevenue; // Total revenue from this part

    /**
     * Constructor from Object[] result
     * Expected array: [partId, partName, partCode, brand, category, totalQuantity, totalRevenue]
     */
    public PartsUsageReportDTO(Object[] row) {
        if (row == null || row.length == 0) {
            return;
        }

        try {
            this.partId = row[0] != null ? ((Number) row[0]).longValue() : null;
            this.partName = row[1] != null ? row[1].toString() : null;
            this.partCode = row[2] != null ? row[2].toString() : null;
            this.brand = row[3] != null ? row[3].toString() : null;
            this.category = row[4] != null ? row[4].toString() : null;
            this.totalQuantity = row[5] != null ? ((Number) row[5]).longValue() : 0L;
            this.totalRevenue = row[6] != null ? new BigDecimal(row[6].toString()) : BigDecimal.ZERO;
        } catch (Exception e) {
            System.err.println("Error creating PartsUsageReportDTO from row: " + e.getMessage());
            // Set default values to prevent null pointer exceptions
            this.totalQuantity = 0L;
            this.totalRevenue = BigDecimal.ZERO;
        }
    }

    /**
     * Helper method to get formatted revenue
     */
    public String getFormattedRevenue() {
        return "RM " + (totalRevenue != null ? totalRevenue.toString() : "0.00");
    }

    /**
     * Helper method to get display name for charts
     */
    public String getDisplayName() {
        String name = partName != null && !partName.trim().isEmpty() ? partName : "Unknown Part";
        if (name.length() > 20) {
            name = name.substring(0, 20) + "...";
        }
        return name;
    }

    /**
     * Helper method to get full display information
     */
    public String getFullDisplayInfo() {
        StringBuilder sb = new StringBuilder();
        sb.append(partName != null ? partName : "Unknown Part");

        if (partCode != null && !partCode.trim().isEmpty()) {
            sb.append(" (").append(partCode).append(")");
        }

        if (brand != null && !brand.trim().isEmpty()) {
            sb.append(" - ").append(brand);
        }

        return sb.toString();
    }
}