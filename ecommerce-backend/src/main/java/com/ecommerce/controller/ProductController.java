package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductWithCategoryDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.ProductService;
import com.ecommerce.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    private final RecommendationService recommendationService;

    private final com.ecommerce.service.ShopService shopService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    /**
     * Shop page listing: search + filters + sort + pagination.
     * sort: newest (default), price_asc, price_desc, discount, name
     */
    @GetMapping("/shop")
    public ResponseEntity<com.ecommerce.dto.ShopPageDTO> shop(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "subCategoryId", required = false) Long subCategoryId,
            @RequestParam(name = "minPrice", required = false) Integer minPrice,
            @RequestParam(name = "maxPrice", required = false) Integer maxPrice,
            @RequestParam(name = "inStock", defaultValue = "false") boolean inStock,
            @RequestParam(name = "onSale", defaultValue = "false") boolean onSale,
            @RequestParam(name = "sort", defaultValue = "newest") String sort,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size) {
        if (q != null && q.length() > 100) q = q.substring(0, 100);
        return ResponseEntity.ok(shopService.browse(q, categoryId, subCategoryId, minPrice, maxPrice,
                inStock, onSale, sort, page, size));
    }

    @GetMapping("/{productId}/image")
    public ResponseEntity<byte[]> getProductImage(@PathVariable Long productId) {
        byte[] image = productService.getProductImage(productId);
        if (image == null || image.length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(
                        com.ecommerce.util.ImageValidator.contentType(image)))
                // URLs carry ?v=<hash of the image>, so a long cache is safe
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofDays(30)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(image);
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam String query,
            @AuthenticationPrincipal User user) {

        if (user != null) {
            recommendationService.saveSearchHistory(user.getId(), query);
        }
        return ResponseEntity.ok(productService.universalSearch(query));
    }

    @GetMapping("/subCategory/{subCategoryId}")
    public ResponseEntity<List<ProductDTO>> getBySubCategory(@PathVariable Long subCategoryId) {
        return ResponseEntity.ok(productService.getProductsBySubCategory(subCategoryId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ProductDTO>> getRecentProducts(
            @RequestParam(name = "limit", defaultValue = "8") int limit
    ) {
        return ResponseEntity.ok(productService.getRecentProducts(limit));
    }

    @GetMapping("/with-category")
    public ResponseEntity<List<ProductWithCategoryDTO>> getProductsWithCategory() {
        return ResponseEntity.ok(productService.getAllProductsWithCategory());
    }
}