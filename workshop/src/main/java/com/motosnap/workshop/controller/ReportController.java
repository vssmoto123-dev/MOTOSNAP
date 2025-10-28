package com.motosnap.workshop.controller;

import com.motosnap.workshop.service.ReportService;
import com.motosnap.workshop.dto.reports.SalesReportDTO;
import com.motosnap.workshop.dto.reports.PartsUsageReportDTO;
import com.motosnap.workshop.dto.reports.MechanicPerformanceDTO;
import com.motosnap.workshop.dto.reports.DashboardDataDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@PreAuthorize("hasRole('ADMIN')")
public class ReportController {

    @Autowired
    private ReportService reportService;

    /**
     * Get sales report by period (daily, weekly, monthly) - returns typed DTOs
     * GET /api/reports/sales?period=daily&days=30
     */
    @GetMapping("/sales")
    public ResponseEntity<?> getSalesReport(
            @RequestParam(defaultValue = "monthly") String period,
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting " + period + " sales report for last " + days + " days by admin: " + authentication.getName());

            List<SalesReportDTO> salesData = reportService.getSalesReport(period, days);

            return ResponseEntity.ok(salesData);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get sales report - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve sales report: " + e.getMessage()));
        }
    }

    /**
     * Get most used parts report - returns typed DTOs
     * GET /api/reports/parts-usage?days=30
     */
    @GetMapping("/parts-usage")
    public ResponseEntity<?> getPartsUsageReport(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting parts usage report for last " + days + " days by admin: " + authentication.getName());

            List<PartsUsageReportDTO> partsData = reportService.getPartsUsageReport(days);

            return ResponseEntity.ok(partsData);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get parts usage report - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve parts usage report: " + e.getMessage()));
        }
    }

    /**
     * Get mechanic performance report - returns typed DTOs
     * GET /api/reports/mechanic-performance?days=30
     */
    @GetMapping("/mechanic-performance")
    public ResponseEntity<?> getMechanicPerformanceReport(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting mechanic performance report for last " + days + " days by admin: " + authentication.getName());

            List<MechanicPerformanceDTO> performanceData = reportService.getMechanicPerformanceReport(days);

            return ResponseEntity.ok(performanceData);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get mechanic performance report - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve mechanic performance report: " + e.getMessage()));
        }
    }

    /**
     * Get comprehensive dashboard data (all reports in one call) - returns typed DTOs
     * GET /api/reports/dashboard?days=30
     */
    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData(
            @RequestParam(defaultValue = "30") int days,
            Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting dashboard data for last " + days + " days by admin: " + authentication.getName());

            DashboardDataDTO dashboardData = reportService.getDashboardData(days);

            return ResponseEntity.ok(dashboardData);
        } catch (Exception e) {
            System.err.println("ERROR: Failed to get dashboard data - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to retrieve dashboard data: " + e.getMessage()));
        }
    }
}