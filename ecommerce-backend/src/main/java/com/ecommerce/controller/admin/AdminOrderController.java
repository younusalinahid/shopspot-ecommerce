package com.ecommerce.controller.admin;

import com.ecommerce.dto.OrderDTO;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderDTO> updateStatus(
            @PathVariable Long orderId,
            @RequestParam(name = "status") OrderStatus status) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrderById(
            @PathVariable(name = "orderId") Long orderId) {
        return ResponseEntity.ok(orderService.getAdminOrderById(orderId));
    }

    @GetMapping("/filter")
    public ResponseEntity<List<OrderDTO>> filterByPaymentMethod(
            @RequestParam(name = "paymentMethod") PaymentMethod paymentMethod) {
        return ResponseEntity.ok(orderService.getOrdersByPaymentMethod(paymentMethod));
    }

    @PutMapping("/{orderId}/mark-cod-collected")
    public ResponseEntity<OrderDTO> markCODCollected(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.markCODCollected(orderId));
    }
}