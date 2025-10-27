package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequestDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal User user) {
        CartDTO cart = cartService.getCart(user.getId());
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddToCartRequestDTO request) {
        CartDTO cart = cartService.addToCart(user.getId(), request);
        return ResponseEntity.ok(cart);
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @RequestParam Integer quantity) {
        CartDTO cart = cartService.updateCartItem(user.getId(), cartItemId, quantity);
        return ResponseEntity.ok(cart);
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId) {
        cartService.removeCartItem(user.getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}