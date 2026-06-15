package com.ecommerce.service;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.dto.OrderItemDTO;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Async
    public void sendOrderConfirmationEmail(String toEmail, String customerName,
                                           OrderDTO order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setFrom(fromEmail);
            helper.setSubject("🔥 Your Order is Confirmed! #" + order.getId());            helper.setText(buildEmailHtml(customerName, order), true);

            mailSender.send(message);
            log.info("✅ Email sent to: {}", toEmail);

        } catch (Exception e) {
            log.error("Email failed for {}: {}", toEmail, e.getMessage(), e);
        }
    }

    private String buildEmailHtml(String customerName, OrderDTO order) {
        StringBuilder items = new StringBuilder();
        if (order.getItems() != null) {
            for (OrderItemDTO item : order.getItems()) {
                items.append(String.format(
                        "<tr>" +
                                "<td style='padding:10px;border-bottom:1px solid #f0f0f0'>%s</td>" +
                                "<td style='padding:10px;border-bottom:1px solid #f0f0f0;text-align:center'>%d</td>" +
                                "<td style='padding:10px;border-bottom:1px solid #f0f0f0;text-align:right'>৳%.2f</td>" +
                                "</tr>",
                        item.getProductName(),
                        item.getQuantity(),
                        (double)(item.getPriceAtPurchase() * item.getQuantity())
                ));
            }
        }

        String shippingAddr = "N/A";
        if (order.getShippingAddress() != null) {
            var addr = order.getShippingAddress();
            shippingAddr = addr.getAddressLine() + ", " + addr.getCity()
                    + (addr.getDistrict()  != null ? ", " + addr.getDistrict()  : "")
                    + (addr.getPostalCode() != null ? " - " + addr.getPostalCode() : "");
        }

        String html = "<html><body style='margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif'>"
                + "<div style='max-width:600px;margin:30px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.1)'>"

                // Header
                + "<div style='background:linear-gradient(135deg,#06b6d4,#3b82f6);padding:30px;text-align:center'>"
                + "<h1 style='color:#fff;margin:0;font-size:24px'>ShopSpot</h1>"
                + "<p style='color:rgba(255,255,255,0.9);margin:8px 0 0'>Your order is confirmed!</p>"
                + "</div>"

                // Body
                + "<div style='padding:30px'>"
                + "<p style='color:#374151;font-size:16px'>Hi <strong>" + customerName + "</strong>,</p>"
                + "<p style='color:#6b7280'>Thank you for your order! We have received it and will start processing soon.</p>"

                // Order info
                + "<div style='background:#f9fafb;border-radius:8px;padding:16px;margin:20px 0'>"
                + "<table style='width:100%'>"
                + "<tr><td style='color:#6b7280;font-size:14px'>Order ID</td><td style='text-align:right;font-weight:bold;color:#111827'>#" + order.getId() + "</td></tr>"
                + "<tr><td style='color:#6b7280;font-size:14px;padding-top:8px'>Status</td><td style='text-align:right;padding-top:8px'><span style='background:#dcfce7;color:#166534;padding:2px 10px;border-radius:99px;font-size:13px'>" + order.getStatus() + "</span></td></tr>"
                + "<tr><td style='color:#6b7280;font-size:14px;padding-top:8px'>Shipping to</td><td style='text-align:right;color:#374151;font-size:14px;padding-top:8px'>" + shippingAddr + "</td></tr>"
                + "</table></div>"

                // Items table
                + "<h3 style='color:#111827;border-bottom:2px solid #e5e7eb;padding-bottom:10px'>Items Ordered</h3>"
                + "<table style='width:100%;border-collapse:collapse'>"
                + "<thead><tr style='background:#f3f4f6'>"
                + "<th style='padding:10px;text-align:left;color:#6b7280;font-size:13px'>Product</th>"
                + "<th style='padding:10px;text-align:center;color:#6b7280;font-size:13px'>Qty</th>"
                + "<th style='padding:10px;text-align:right;color:#6b7280;font-size:13px'>Price</th>"
                + "</tr></thead>"
                + "<tbody>" + items.toString() + "</tbody>"
                + "<tfoot><tr>"
                + "<td colspan='2' style='padding:12px 10px;font-weight:bold;color:#111827'>Total Paid</td>"
                + "<td style='padding:12px 10px;text-align:right;font-weight:bold;font-size:18px;color:#2563eb'>"
                + String.format("৳%.2f", order.getTotalAmount() != null ? order.getTotalAmount().doubleValue() : 0.0)
                + "</td></tr></tfoot></table>"

                // CTA
                + "<div style='text-align:center;margin:30px 0'>"
                + "<a href='" + frontendUrl + "/orders' style='background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block'>View Order Details</a>"
                + "</div></div>"

                // Footer
                + "<div style='background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #e5e7eb'>"
                + "<p style='color:#9ca3af;font-size:13px;margin:0'>Questions? Contact us at shopspot2026@gmail.com</p>"
                + "<p style='color:#d1d5db;font-size:12px;margin:8px 0 0'>2025 ShopSpot. All rights reserved.</p>"
                + "</div></div></body></html>";

        return html;
    }
}