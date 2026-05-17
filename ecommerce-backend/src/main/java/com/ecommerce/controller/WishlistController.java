package com.ecommerce.controller;

import com.ecommerce.dto.WishlistDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @GetMapping
    public ResponseEntity<List<WishlistDTO>> getWishlist(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(wishlistService.getWishlist(user.getId()));
    }

    @PostMapping("/{productId}/toggle")
    public ResponseEntity<Map<String, Object>> toggle(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(wishlistService.toggleWishlist(user.getId(), productId));
    }

    @GetMapping("/{productId}/status")
    public ResponseEntity<Map<String, Object>> status(
            @AuthenticationPrincipal User user,
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                Map.of("wishlisted", wishlistService.isWishlisted(user.getId(), productId))
        );
    }
}