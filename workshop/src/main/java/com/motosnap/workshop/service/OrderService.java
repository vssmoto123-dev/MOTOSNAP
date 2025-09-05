package com.motosnap.workshop.service;

import com.motosnap.workshop.dto.OrderResponse;
import com.motosnap.workshop.dto.OrderItemResponse;
import com.motosnap.workshop.dto.InventoryResponse;
import com.motosnap.workshop.entity.*;
import com.motosnap.workshop.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ReceiptRepository receiptRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private FileStorageService fileStorageService;

    public OrderResponse createOrderFromCart(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Cart cart = cartRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Cart not found"));

        if (cart.getCartItems() == null || cart.getCartItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        // Verify stock availability before creating order
        for (CartItem cartItem : cart.getCartItems()) {
            Inventory inventory = cartItem.getInventory();
            if (inventory.getQty() < cartItem.getQuantity()) {
                throw new RuntimeException("Insufficient stock for item: " + inventory.getPartName() + 
                    ". Available: " + inventory.getQty() + ", Required: " + cartItem.getQuantity());
            }
        }

        // Create order
        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);
        order = orderRepository.save(order);

        // Create order items and deduct inventory
        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem cartItem : cart.getCartItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setPart(cartItem.getInventory());
            orderItem.setQty(cartItem.getQuantity());
            orderItem.setPrice(BigDecimal.valueOf(cartItem.getUnitPrice()));
            orderItemRepository.save(orderItem);
            orderItems.add(orderItem);

            // Deduct from inventory
            Inventory inventory = cartItem.getInventory();
            inventory.setQty(inventory.getQty() - cartItem.getQuantity());
            inventoryRepository.save(inventory);
        }

        // Clear the cart items but keep the cart
        cartItemRepository.deleteAll(cart.getCartItems());
        cart.getCartItems().clear();
        cartRepository.save(cart);

        order.setOrderItems(orderItems);
        return convertToOrderResponse(order);
    }

    public List<OrderResponse> getUserOrders(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Order> orders = orderRepository.findByUserOrderByCreatedAtDesc(user);
        
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse getOrderById(String userEmail, Long orderId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to access this order");
        }

        return convertToOrderResponse(order);
    }

    public OrderResponse uploadReceipt(String userEmail, Long orderId, MultipartFile file, double receiptAmount, String notes) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized to upload receipt for this order");
        }

        if (order.getStatus() != OrderStatus.PENDING && order.getStatus() != OrderStatus.REJECTED) {
            throw new RuntimeException("Receipt can only be uploaded for pending or rejected orders");
        }

        String fileName = fileStorageService.storeFile(file);

        // Check if receipt already exists (for rejected orders)
        Receipt receipt = receiptRepository.findByOrder(order).orElse(null);
        
        if (receipt != null) {
            // Update existing receipt for rejected orders
            receipt.setFileUrl(fileName);
            receipt.setAmount(BigDecimal.valueOf(receiptAmount));
            receipt.setNotes(notes);
            receipt.setStatus(ReceiptStatus.PENDING);
            receipt.setApprovedBy(null);
            receipt.setApprovedAt(null);
        } else {
            // Create new receipt
            receipt = new Receipt();
            receipt.setOrder(order);
            receipt.setFileUrl(fileName);
            receipt.setAmount(BigDecimal.valueOf(receiptAmount));
            receipt.setNotes(notes);
            receipt.setStatus(ReceiptStatus.PENDING);
        }
        
        receiptRepository.save(receipt);

        // Update order status
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.PAYMENT_SUBMITTED);
        order = orderRepository.save(order);
        
        System.out.println("DEBUG: Order status changed from " + previousStatus + " to " + order.getStatus() + " for order " + order.getId());

        return convertToOrderResponse(order);
    }

    // Admin order management methods
    public List<OrderResponse> getAllOrders() {
        List<Order> orders = orderRepository.findAll()
                .stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt())) // Latest first
                .collect(Collectors.toList());
        
        return orders.stream()
                .map(this::convertToOrderResponse)
                .collect(Collectors.toList());
    }

    public OrderResponse approveOrder(String adminEmail, Long orderId) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (!admin.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Only administrators can approve orders");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PAYMENT_SUBMITTED) {
            throw new RuntimeException("Only orders with submitted payments can be approved");
        }

        // Check if order has receipt
        Receipt receipt = receiptRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("No receipt found for this order"));

        // Update order status
        order.setStatus(OrderStatus.APPROVED);
        order = orderRepository.save(order);

        // Update receipt status
        receipt.setStatus(ReceiptStatus.APPROVED);
        receipt.setApprovedBy(admin);
        receipt.setApprovedAt(java.time.LocalDateTime.now());
        receiptRepository.save(receipt);

        return convertToOrderResponse(order);
    }

    public OrderResponse rejectOrder(String adminEmail, Long orderId, String reason) {
        User admin = userRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new RuntimeException("Admin user not found"));

        if (!admin.getRole().name().equals("ADMIN")) {
            throw new RuntimeException("Only administrators can reject orders");
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (order.getStatus() != OrderStatus.PAYMENT_SUBMITTED) {
            throw new RuntimeException("Only orders with submitted payments can be rejected");
        }

        // Check if order has receipt
        Receipt receipt = receiptRepository.findByOrder(order)
                .orElseThrow(() -> new RuntimeException("No receipt found for this order"));

        // Update order status
        order.setStatus(OrderStatus.REJECTED);
        order = orderRepository.save(order);

        // Update receipt status
        receipt.setStatus(ReceiptStatus.REJECTED);
        receipt.setApprovedBy(admin);
        receipt.setApprovedAt(java.time.LocalDateTime.now());
        if (reason != null && !reason.trim().isEmpty()) {
            receipt.setAdminNotes(reason);
        }
        receiptRepository.save(receipt);

        return convertToOrderResponse(order);
    }

    public String getReceiptFileName(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Receipt receipt = receiptRepository.findByOrder(order)
                .orElse(null);

        return receipt != null ? receipt.getFileUrl() : null;
    }

    private OrderResponse convertToOrderResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setStatus(order.getStatus());
        
        // Convert order items to DTOs
        List<OrderItemResponse> orderItemResponses = order.getOrderItems() != null 
                ? order.getOrderItems().stream()
                    .map(this::convertToOrderItemResponse)
                    .collect(Collectors.toList())
                : new ArrayList<>();
        response.setOrderItems(orderItemResponses);
        
        // Calculate total amount from order items
        double totalAmount = orderItemResponses.stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQty())
                .sum();
        response.setTotalAmount(totalAmount);
        
        response.setCreatedAt(order.getCreatedAt());
        response.setUpdatedAt(order.getUpdatedAt());
        
        // Check if order has receipt
        boolean hasReceipt = receiptRepository.findByOrder(order).isPresent();
        response.setHasReceipt(hasReceipt);
        
        return response;
    }

    private OrderItemResponse convertToOrderItemResponse(OrderItem orderItem) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(orderItem.getId());
        response.setQty(orderItem.getQty());
        response.setPrice(orderItem.getPrice());
        response.setPart(convertToInventoryResponse(orderItem.getPart()));
        return response;
    }
    
    private InventoryResponse convertToInventoryResponse(Inventory inventory) {
        InventoryResponse response = new InventoryResponse();
        response.setId(inventory.getId());
        response.setPartName(inventory.getPartName());
        response.setPartCode(inventory.getPartCode());
        response.setDescription(inventory.getDescription());
        response.setQty(inventory.getQty());
        response.setUnitPrice(inventory.getUnitPrice());
        response.setCategory(inventory.getCategory());
        response.setBrand(inventory.getBrand());
        response.setActive(inventory.getActive());
        response.setImageUrl(inventory.getImageUrl());
        return response;
    }
}