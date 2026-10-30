package com.ecommerce.controller;

import com.ecommerce.dto.GuestCheckoutRequestDTO;
import com.ecommerce.dto.OrderDTO;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Checkout endpoints for visitors who are not logged in.
 * Each guest order gets a random token that the browser keeps to confirm or view the order.
 */
@RestController
@RequestMapping("/api/public/orders/guest")
@RequiredArgsConstructor
public class GuestOrderController {

    private final OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<OrderDTO> checkout(@RequestBody GuestCheckoutRequestDTO request) {
        return ResponseEntity.ok(orderService.createGuestOrder(request));
    }

    @PostMapping("/{orderId}/confirm-cod")
    public ResponseEntity<OrderDTO> confirmCod(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.confirmGuestCODOrder(orderId, body.get("guestToken")));
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<OrderDTO> confirmPayment(
            @PathVariable Long orderId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(orderService.confirmGuestPayment(
                orderId, body.get("paymentIntentId"), body.get("guestToken")));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDTO> getOrder(
            @PathVariable Long orderId,
            @RequestHeader("X-Guest-Token") String guestToken) {
        return ResponseEntity.ok(orderService.getGuestOrder(orderId, guestToken));
    }
}
