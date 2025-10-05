package com.motosnap.workshop.service;

import com.motosnap.workshop.entity.Booking;
import com.motosnap.workshop.entity.Order;
import com.motosnap.workshop.entity.Invoice;
import com.motosnap.workshop.entity.InvoicePayment;
import com.motosnap.workshop.entity.User;
import com.motosnap.workshop.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    @Autowired
    private UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    // Booking Notifications
    public void sendBookingConfirmation(Booking booking, User customer) {
        String subject = "Booking Confirmation - MOTOSNAP";
        String content = buildBookingConfirmationEmail(booking, customer);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    public void sendBookingStatusUpdate(Booking booking, User customer, String oldStatus, String newStatus) {
        String subject = "Booking Status Update - MOTOSNAP";
        String content = buildBookingStatusUpdateEmail(booking, customer, oldStatus, newStatus);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    public void sendMechanicAssignment(Booking booking, User mechanic) {
        String subject = "New Task Assignment - MOTOSNAP";
        String content = buildMechanicAssignmentEmail(booking, mechanic);
        sendHtmlEmail(mechanic.getEmail(), subject, content);
    }

    public void sendNewBookingAlert(Booking booking, List<User> admins) {
        String subject = "New Booking Request - MOTOSNAP";
        String content = buildNewBookingAlertEmail(booking);

        for (User admin : admins) {
            sendHtmlEmail(admin.getEmail(), subject, content);
        }
    }

    // Order Notifications
    public void sendOrderConfirmation(Order order, User customer) {
        String subject = "Order Confirmation - MOTOSNAP";
        String content = buildOrderConfirmationEmail(order, customer);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    public void sendOrderStatusUpdate(Order order, User customer, String status) {
        String subject = "Order Status Update - MOTOSNAP";
        String content = buildOrderStatusUpdateEmail(order, customer, status);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    public void sendNewOrderAlert(Order order, List<User> admins) {
        String subject = "New Order with Payment - MOTOSNAP";
        String content = buildNewOrderAlertEmail(order);

        for (User admin : admins) {
            sendHtmlEmail(admin.getEmail(), subject, content);
        }
    }

    // Invoice Notifications
    public void sendInvoiceGeneration(Invoice invoice, User customer) {
        String subject = "Invoice Generated - MOTOSNAP";
        String content = buildInvoiceGenerationEmail(invoice, customer);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    // Payment Notifications
    public void sendPaymentConfirmation(InvoicePayment payment, User customer) {
        String subject = "Payment Confirmation - MOTOSNAP";
        String content = buildPaymentConfirmationEmail(payment, customer);
        sendHtmlEmail(customer.getEmail(), subject, content);
    }

    public void sendPaymentReceiptAlert(InvoicePayment payment, List<User> admins) {
        String subject = "Payment Receipt Uploaded - MOTOSNAP";
        String content = buildPaymentReceiptAlertEmail(payment);

        for (User admin : admins) {
            sendHtmlEmail(admin.getEmail(), subject, content);
        }
    }

    // Generic email sending methods
    private void sendHtmlEmail(String to, String subject, String content) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("vssmoto123@gmail.com");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(content, true); // true = HTML

            javaMailSender.send(message);
            System.out.println("Email sent successfully to: " + to);

        } catch (MessagingException e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void sendSimpleEmail(String to, String subject, String content) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("vssmoto123@gmail.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(content);

            javaMailSender.send(message);
            System.out.println("Email sent successfully to: " + to);

        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Email Template Builders
    private String buildBookingConfirmationEmail(Booking booking, User customer) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #27ae60;">Booking Confirmed!</h3>
                        <p>Dear %s,</p>
                        <p>Your booking has been confirmed. Here are the details:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Booking ID:</strong> %d</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Vehicle:</strong> %s %s (%d)</p>
                            <p><strong>Scheduled Date:</strong> %s</p>
                            <p><strong>Status:</strong> %s</p>
                        </div>

                        <p>Please arrive 15 minutes before your scheduled time.</p>
                        <p>For any questions, please contact us.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), booking.getId(), booking.getService().getName(),
            booking.getVehicle().getBrand(), booking.getVehicle().getModel(), booking.getVehicle().getYear(),
            booking.getScheduledDateTime().format(DATE_FORMATTER), booking.getStatus());
    }

    private String buildBookingStatusUpdateEmail(Booking booking, User customer, String oldStatus, String newStatus) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3498db;">Booking Status Update</h3>
                        <p>Dear %s,</p>
                        <p>Your booking status has been updated:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Booking ID:</strong> %d</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Old Status:</strong> %s</p>
                            <p><strong>New Status:</strong> %s</p>
                            <p><strong>Updated:</strong> %s</p>
                        </div>

                        <p>Thank you for choosing MOTOSNAP.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), booking.getId(), booking.getService().getName(),
            oldStatus, newStatus, booking.getUpdatedAt().format(DATE_FORMATTER));
    }

    private String buildMechanicAssignmentEmail(Booking booking, User mechanic) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #e67e22;">New Task Assignment</h3>
                        <p>Dear %s,</p>
                        <p>You have been assigned a new booking:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Booking ID:</strong> %d</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Customer:</strong> %s</p>
                            <p><strong>Vehicle:</strong> %s %s (%d)</p>
                            <p><strong>Scheduled Date:</strong> %s</p>
                        </div>

                        <p>Please check your dashboard for more details.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, mechanic.getName(), booking.getId(), booking.getService().getName(),
            booking.getUser().getName(), booking.getVehicle().getBrand(), booking.getVehicle().getModel(),
            booking.getVehicle().getYear(), booking.getScheduledDateTime().format(DATE_FORMATTER));
    }

    private String buildNewBookingAlertEmail(Booking booking) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #856404;">New Booking Request</h3>
                        <p>A new booking has been created:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Booking ID:</strong> %d</p>
                            <p><strong>Customer:</strong> %s</p>
                            <p><strong>Service:</strong> %s</p>
                            <p><strong>Vehicle:</strong> %s %s (%d)</p>
                            <p><strong>Scheduled Date:</strong> %s</p>
                            <p><strong>Status:</strong> %s</p>
                        </div>

                        <p>Please review and assign a mechanic.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, booking.getId(), booking.getUser().getName(), booking.getService().getName(),
            booking.getVehicle().getBrand(), booking.getVehicle().getModel(), booking.getVehicle().getYear(),
            booking.getScheduledDateTime().format(DATE_FORMATTER), booking.getStatus());
    }

    private String buildOrderConfirmationEmail(Order order, User customer) {
        // Calculate total amount from order items
        double totalAmount = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQty())
                .sum();

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #27ae60;">Order Confirmation</h3>
                        <p>Dear %s,</p>
                        <p>Your order has been received:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Order ID:</strong> %d</p>
                            <p><strong>Total Amount:</strong> $%.2f</p>
                            <p><strong>Status:</strong> %s</p>
                            <p><strong>Order Date:</strong> %s</p>
                        </div>

                        <p>We will process your order soon.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), order.getId(), totalAmount,
            order.getStatus(), order.getCreatedAt().format(DATE_FORMATTER));
    }

    private String buildOrderStatusUpdateEmail(Order order, User customer, String status) {
        // Calculate total amount from order items
        double totalAmount = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQty())
                .sum();

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3498db;">Order Status Update</h3>
                        <p>Dear %s,</p>
                        <p>Your order status has been updated to: <strong>%s</strong></p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Order ID:</strong> %d</p>
                            <p><strong>Total Amount:</strong> $%.2f</p>
                            <p><strong>Updated:</strong> %s</p>
                        </div>

                        <p>Thank you for your order.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), status, order.getId(), totalAmount,
            order.getUpdatedAt().format(DATE_FORMATTER));
    }

    private String buildNewOrderAlertEmail(Order order) {
        // Calculate total amount from order items
        double totalAmount = order.getOrderItems().stream()
                .mapToDouble(item -> item.getPrice().doubleValue() * item.getQty())
                .sum();

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #856404;">New Order with Payment</h3>
                        <p>A new order has been created with payment receipt:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Order ID:</strong> %d</p>
                            <p><strong>Customer:</strong> %s</p>
                            <p><strong>Total Amount:</strong> $%.2f</p>
                            <p><strong>Status:</strong> %s</p>
                            <p><strong>Payment Receipt:</strong> %s</p>
                        </div>

                        <p>Please review and approve the order.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, order.getId(), order.getUser().getName(), totalAmount,
            order.getStatus(), order.getReceipt() != null ? "Uploaded" : "Not uploaded");
    }

    private String buildInvoiceGenerationEmail(Invoice invoice, User customer) {
        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #3498db;">Invoice Generated</h3>
                        <p>Dear %s,</p>
                        <p>An invoice has been generated for your completed service:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Invoice ID:</strong> %d</p>
                            <p><strong>Invoice Number:</strong> %s</p>
                            <p><strong>Service Amount:</strong> $%.2f</p>
                            <p><strong>Parts Amount:</strong> $%.2f</p>
                            <p><strong>Total Amount:</strong> $%.2f</p>
                            <p><strong>Generated:</strong> %s</p>
                        </div>

                        <p>Please make payment to complete your transaction.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), invoice.getId(), invoice.getInvoiceNumber(),
            invoice.getServiceAmount(), invoice.getPartsAmount(), invoice.getTotalAmount(),
            invoice.getGeneratedAt().format(DATE_FORMATTER));
    }

    private String buildPaymentConfirmationEmail(InvoicePayment payment, User customer) {
        // Get amount from invoice total
        double amount = payment.getInvoice().getTotalAmount().doubleValue();

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #155724;">Payment Confirmed</h3>
                        <p>Dear %s,</p>
                        <p>Your payment has been confirmed:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Payment ID:</strong> %d</p>
                            <p><strong>Amount:</strong> $%.2f</p>
                            <p><strong>Status:</strong> %s</p>
                            <p><strong>Payment Date:</strong> %s</p>
                        </div>

                        <p>Thank you for your payment. Your transaction is complete.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, customer.getName(), payment.getId(), amount,
            payment.getStatus(), payment.getCreatedAt().format(DATE_FORMATTER));
    }

    private String buildPaymentReceiptAlertEmail(InvoicePayment payment) {
        // Get customer and amount from related entities
        User customer = payment.getInvoice().getBooking().getUser();
        double amount = payment.getInvoice().getTotalAmount().doubleValue();

        return String.format("""
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #856404;">Payment Receipt Uploaded</h3>
                        <p>A customer has uploaded a payment receipt:</p>

                        <div style="background-color: white; padding: 15px; border-radius: 5px; margin: 10px 0;">
                            <p><strong>Payment ID:</strong> %d</p>
                            <p><strong>Customer:</strong> %s</p>
                            <p><strong>Amount:</strong> $%.2f</p>
                            <p><strong>Status:</strong> %s</p>
                            <p><strong>Receipt:</strong> %s</p>
                        </div>

                        <p>Please review and approve the payment.</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, payment.getId(), customer.getName(), amount,
            payment.getStatus(), payment.getReceipt() != null ? "Uploaded" : "Not uploaded");
    }

    public void sendTestEmail(String toEmail) {
        String subject = "Test Email - MOTOSNAP Email Service";
        String content = """
            <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #2c3e50; text-align: center;">MOTOSNAP</h2>
                    <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #155724;">Email Service Test</h3>
                        <p>This is a test email to verify that the MOTOSNAP email service is working correctly.</p>
                        <p>If you received this email, the email notification system is properly configured.</p>
                        <p><strong>Test Time:</strong> %s</p>

                        <hr style="margin: 20px 0;">
                        <p style="text-align: center; color: #7f8c8d; font-size: 12px;">
                            MOTOSNAP - Local Motorcycle Parts & Service<br>
                            This is an automated notification. Please do not reply to this email.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """.formatted(java.time.LocalDateTime.now().format(DATE_FORMATTER));

        sendHtmlEmail(toEmail, subject, content);
    }
}