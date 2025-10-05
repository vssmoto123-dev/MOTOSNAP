package com.motosnap.workshop.controller;

import com.motosnap.workshop.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/email")
@PreAuthorize("isAuthenticated()")
public class EmailTestController {

    @Autowired
    private EmailService emailService;

    /**
     * Test email endpoint - sends a test email to the authenticated user
     * POST /api/email/test
     */
    @PostMapping("/test")
    public ResponseEntity<?> sendTestEmail(Authentication authentication) {
        try {
            String userEmail = authentication.getName();
            System.out.println("DEBUG: Sending test email to: " + userEmail);

            emailService.sendTestEmail(userEmail);

            return ResponseEntity.ok(Map.of(
                "message", "Test email sent successfully to " + userEmail,
                "status", "success"
            ));
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send test email - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of(
                        "error", "Failed to send test email",
                        "details", e.getMessage(),
                        "status", "error"
                    ));
        }
    }

    /**
     * Test email to specific address - admin only
     * POST /api/email/test-to
     */
    @PostMapping("/test-to")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> sendTestEmailToAddress(
            @RequestBody Map<String, String> request,
            Authentication authentication) {
        try {
            String toEmail = request.get("email");
            if (toEmail == null || toEmail.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email address is required"));
            }

            System.out.println("DEBUG: Sending test email to: " + toEmail + " by admin: " + authentication.getName());

            emailService.sendTestEmail(toEmail);

            return ResponseEntity.ok(Map.of(
                "message", "Test email sent successfully to " + toEmail,
                "status", "success"
            ));
        } catch (Exception e) {
            System.err.println("ERROR: Failed to send test email - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .body(Map.of(
                        "error", "Failed to send test email",
                        "details", e.getMessage(),
                        "status", "error"
                    ));
        }
    }
}