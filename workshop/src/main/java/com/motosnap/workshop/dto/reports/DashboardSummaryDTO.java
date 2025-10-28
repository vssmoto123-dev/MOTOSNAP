package com.motosnap.workshop.dto.reports;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;

/**
 * Dashboard summary statistics DTO
 * Follows existing patterns from InvoiceResponse and BookingResponse
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryDTO {

    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Long totalBookings;
    private String period;

    /**
     * Helper method to get formatted total revenue
     */
    public String getFormattedTotalRevenue() {
        if (totalRevenue != null) {
            return "RM " + totalRevenue.toString();
        }
        return "RM 0.00";
    }

    /**
     * Helper method to get formatted total orders
     */
    public String getFormattedTotalOrders() {
        return totalOrders != null ? totalOrders.toString() : "0";
    }

    /**
     * Helper method to get formatted total bookings
     */
    public String getFormattedTotalBookings() {
        return totalBookings != null ? totalBookings.toString() : "0";
    }
}