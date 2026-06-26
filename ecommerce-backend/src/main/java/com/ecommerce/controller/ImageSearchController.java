package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.service.ImageSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/search")
@RequiredArgsConstructor
public class ImageSearchController {

    private final ImageSearchService imageSearchService;

    @PostMapping("/image")
    public ResponseEntity<?> searchByImage(
            @RequestParam("image") MultipartFile image) {
        try {
            if (image.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Image is required"));
            }

            if (image.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Image size must be less than 5MB"));
            }

            List<ProductDTO> results = imageSearchService.searchByImage(image);
            return ResponseEntity.ok(Map.of(
                    "products", results,
                    "count", results.size()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Image search failed: " + e.getMessage()));
        }
    }
}