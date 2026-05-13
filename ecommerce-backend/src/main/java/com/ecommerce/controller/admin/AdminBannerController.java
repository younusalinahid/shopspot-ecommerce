package com.ecommerce.controller.admin;

import com.ecommerce.model.Banner;
import com.ecommerce.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminBannerController {

    private final BannerService bannerService;

    @GetMapping
    public ResponseEntity<List<Banner>> getAllBanners() {
        return ResponseEntity.ok(bannerService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> createBanner(
            @RequestParam("title") String title,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile) {

        try {
            Banner banner = new Banner();
            banner.setTitle(title);

            if (imageFile != null && !imageFile.isEmpty()) {
                banner.setImageData(imageFile.getBytes());
            }

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(bannerService.saveBanner(banner));

        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Image upload failed: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Banner> updateBanner(
            @PathVariable Long id,
            @RequestBody Banner banner) {
        return ResponseEntity.ok(bannerService.updateBanner(id, banner));
    }

    @PutMapping("/{id}/image")
    public ResponseEntity<?> updateBannerImage(
            @PathVariable Long id,
            @RequestParam("imageFile") MultipartFile imageFile) {

        try {
            return ResponseEntity.ok(
                    bannerService.updateBannerImage(id, imageFile.getBytes()));
        } catch (IOException e) {
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Image update failed: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBanner(@PathVariable Long id) {
        bannerService.deleteBanner(id);
        return ResponseEntity.noContent().build();
    }
}