package com.ecommerce.controller;

import com.ecommerce.dto.AddToCartRequestDTO;
import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.UpdateCartItemRequestDTO;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    // Get user's cart
    @GetMapping
    public ResponseEntity<CartDTO> getCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        CartDTO cart = cartService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    // Add item to cart
    @PostMapping("/add")
    public ResponseEntity<CartDTO> addToCart(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody AddToCartRequestDTO request) {

        Long userId = getUserIdFromUserDetails(userDetails);
        CartDTO cart = cartService.addToCart(userId, request);
        return ResponseEntity.ok(cart);
    }

    // Update cart item quantity
    @PutMapping("/items/{cartItemId}")
    public ResponseEntity<CartDTO> updateCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId,
            @RequestBody UpdateCartItemRequestDTO request) {

        Long userId = getUserIdFromUserDetails(userDetails);
        CartDTO cart = cartService.updateCartItem(userId, cartItemId, request);
        return ResponseEntity.ok(cart);
    }

    // Remove item from cart
    @DeleteMapping("/items/{cartItemId}")
    public ResponseEntity<Void> removeCartItem(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long cartItemId) {

        Long userId = getUserIdFromUserDetails(userDetails);
        cartService.removeCartItem(userId, cartItemId);
        return ResponseEntity.noContent().build();
    }

    // Clear entire cart
    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = getUserIdFromUserDetails(userDetails);
        cartService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    // Helper method to extract user ID from UserDetails
    private Long getUserIdFromUserDetails(UserDetails userDetails) {
        // If UserDetails is actually our User entity
        if (userDetails instanceof User) {
            return ((User) userDetails).getId();
        }

        // Fallback - fetch from database using email
        String email = userDetails.getUsername();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        return user.getId();
    }
}