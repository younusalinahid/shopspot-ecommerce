package com.ecommerce.controller.admin;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/cart")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCartController {

    private final CartService cartService;

    @GetMapping("/{userId}")
    public ResponseEntity<CartDTO> getCart(@PathVariable Long userId) {
        return ResponseEntity.ok(cartService.getCart(userId));
    }
}