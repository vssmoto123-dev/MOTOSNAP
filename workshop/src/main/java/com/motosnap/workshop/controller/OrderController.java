package com.motosnap.workshop.controller;

import com.motosnap.workshop.dto.OrderResponse;
import com.motosnap.workshop.service.OrderService;
import com.motosnap.workshop.config.FileUploadProperties;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;

import jakarta.validation.Valid;
import java.util.Map;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/orders")
@PreAuthorize("isAuthenticated()")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private FileUploadProperties fileUploadProperties;

    @GetMapping
    public ResponseEntity<?> getUserOrders(Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting orders for user: " + authentication.getName());
            String email = authentication.getName();
            var orders = orderService.getUserOrders(email);
            System.out.println("DEBUG: Found " + orders.size() + " orders for user");
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get orders - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting orders - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOrder(Authentication authentication) {
        try {
            System.out.println("DEBUG: Creating order for user: " + authentication.getName());
            String email = authentication.getName();
            OrderResponse order = orderService.createOrderFromCart(email);
            System.out.println("DEBUG: Order created successfully, ID: " + order.getId() + ", Items: " + order.getOrderItems().size());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to create order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error creating order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            System.out.println("DEBUG: Getting order by ID: " + orderId + " for user: " + authentication.getName());
            String email = authentication.getName();
            OrderResponse order = orderService.getOrderById(email, orderId);
            System.out.println("DEBUG: Order retrieved successfully, ID: " + order.getId());
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/{orderId}/receipt")
    public ResponseEntity<?> uploadReceipt(
            @PathVariable Long orderId,
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiptAmount") double receiptAmount,
            @RequestParam("notes") String notes,
            Authentication authentication) {
        
        try {
            System.out.println("DEBUG: Receipt upload request - OrderID: " + orderId);
            System.out.println("DEBUG: File name: " + (file != null ? file.getOriginalFilename() : "null"));
            System.out.println("DEBUG: File size: " + (file != null ? file.getSize() : "null"));
            System.out.println("DEBUG: Receipt amount: " + receiptAmount);
            System.out.println("DEBUG: Notes: " + notes);
            System.out.println("DEBUG: User email: " + authentication.getName());
            
            String email = authentication.getName();
            OrderResponse order = orderService.uploadReceipt(email, orderId, file, receiptAmount, notes);
            System.out.println("DEBUG: Receipt uploaded successfully");
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to upload receipt - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error uploading receipt - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    // Admin endpoints for order management
    @GetMapping("/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getAllOrders(Authentication authentication) {
        try {
            System.out.println("DEBUG: Admin getting all orders - user: " + authentication.getName());
            var orders = orderService.getAllOrders();
            System.out.println("DEBUG: Found " + orders.size() + " total orders");
            return ResponseEntity.ok(orders);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to get all orders - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error getting all orders - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/admin/orders/{orderId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveOrder(@PathVariable Long orderId, Authentication authentication) {
        try {
            System.out.println("DEBUG: Admin approving order " + orderId + " - user: " + authentication.getName());
            String email = authentication.getName();
            OrderResponse order = orderService.approveOrder(email, orderId);
            System.out.println("DEBUG: Order approved successfully");
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to approve order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error approving order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @PutMapping("/admin/orders/{orderId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectOrder(@PathVariable Long orderId, 
                                        @RequestParam(required = false) String reason,
                                        Authentication authentication) {
        try {
            System.out.println("DEBUG: Admin rejecting order " + orderId + " - user: " + authentication.getName());
            String email = authentication.getName();
            OrderResponse order = orderService.rejectOrder(email, orderId, reason);
            System.out.println("DEBUG: Order rejected successfully");
            return ResponseEntity.ok(order);
        } catch (RuntimeException e) {
            System.err.println("ERROR: Failed to reject order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage(), "details", e.getClass().getSimpleName()));
        } catch (Exception e) {
            System.err.println("ERROR: Unexpected error rejecting order - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/admin/orders/{orderId}/receipt")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Resource> getReceiptFile(@PathVariable Long orderId, Authentication authentication) {
        try {
            System.out.println("DEBUG: Admin requesting receipt for order " + orderId + " - user: " + authentication.getName());

            // Get the receipt file name
            String receiptFileName = orderService.getReceiptFileName(orderId);
            if (receiptFileName == null) {
                System.out.println("DEBUG: No receipt found for order " + orderId);
                return ResponseEntity.notFound().build();
            }

            // Construct the correct file path
            Path filePath = Paths.get(fileUploadProperties.getUploadDir()).resolve(receiptFileName).normalize();
            System.out.println("DEBUG: Looking for receipt file at: " + filePath);

            Resource resource = new UrlResource(filePath.toUri());

            if (resource.exists() && resource.isReadable()) {
                System.out.println("DEBUG: Receipt file found and readable");
                // Determine content type based on file extension
                String contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
                String fileNameLower = receiptFileName.toLowerCase();
                if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")) {
                    contentType = MediaType.IMAGE_JPEG_VALUE;
                } else if (fileNameLower.endsWith(".png")) {
                    contentType = MediaType.IMAGE_PNG_VALUE;
                } else if (fileNameLower.endsWith(".pdf")) {
                    contentType = MediaType.APPLICATION_PDF_VALUE;
                }

                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .header("Content-Disposition", "attachment; filename=\"" + receiptFileName + "\"")
                        .body(resource);
            } else {
                System.out.println("DEBUG: Receipt file not found or not readable at: " + filePath);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to serve receipt file - " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}