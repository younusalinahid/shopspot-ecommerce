package com.ecommerce.controller;

import com.ecommerce.dto.*;
import com.ecommerce.model.User;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/user/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> createOrder(
            @AuthenticationPrincipal User user,
            @RequestBody CheckoutRequestDTO request) {
        return ResponseEntity.ok(orderService.createOrder(user.getId(), request));
    }

    @PostMapping("/confirm-payment")
    public ResponseEntity<OrderDTO> confirmPayment(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentConfirmDTO request) {
        return ResponseEntity.ok(orderService.confirmPayment(user.getId(), request));
    }

    @GetMapping
    public ResponseEntity<List<OrderDTO>> getUserOrders(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getUserOrders(user.getId()));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(user.getId(), orderId));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderDTO> cancelOrder(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.cancelOrder(user.getId(), orderId));
    }
}