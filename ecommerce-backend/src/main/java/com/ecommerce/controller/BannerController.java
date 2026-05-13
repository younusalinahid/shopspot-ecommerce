package com.ecommerce.controller;

import com.ecommerce.model.Banner;
import com.ecommerce.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getActiveBanners() {
        return ResponseEntity.ok(bannerService.getActiveBanners());
    }
}