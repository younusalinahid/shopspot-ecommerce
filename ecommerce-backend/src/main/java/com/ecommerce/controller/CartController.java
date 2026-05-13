package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequestDTO;
import com.ecommerce.dto.UpdateCartItemRequestDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/cart")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartDTO> getCart(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user.getId()));
    }

    @PostMapping("/items")
    public ResponseEntity<CartDTO> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddToCartRequestDTO request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(cartService.addToCart(user.getId(), request));
    }

    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId,
            @Valid @RequestBody UpdateCartItemRequestDTO request) {
        return ResponseEntity.ok(
                cartService.updateCartItem(user.getId(), cartItemId, request.getQuantity()));
    }

    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long cartItemId) {
        cartService.removeCartItem(user.getId(), cartItemId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(
            @AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.noContent().build();
    }
}