package com.ecommerce.controller;

import com.ecommerce.dto.CouponPreviewDTO;
import com.ecommerce.dto.CouponValidateRequestDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.CouponService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

/** Public because guests can use coupons too; the user is null when not logged in. */
@RestController
@RequestMapping("/api/public/coupons")
@RequiredArgsConstructor
public class CouponController {

    private final CouponService couponService;

    @PostMapping("/validate")
    public ResponseEntity<CouponPreviewDTO> validate(
            @AuthenticationPrincipal User user,
            @RequestBody CouponValidateRequestDTO request) {
        return ResponseEntity.ok(couponService.preview(request.getCode(), request.getSubtotal(), user));
    }
}
