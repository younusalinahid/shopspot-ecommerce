package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ProductWithCategoryDTO;
import com.ecommerce.dto.SearchResultDTO;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{productId}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long productId) {
        return ResponseEntity.ok(productService.getProductById(productId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<SearchResultDTO>> searchProducts(@RequestParam String query) {
        return ResponseEntity.ok(productService.universalSearch(query));
    }

    @GetMapping("/subCategory/{subCategoryId}")
    public ResponseEntity<List<ProductDTO>> getBySubCategory(@PathVariable Long subCategoryId) {
        return ResponseEntity.ok(productService.getProductsBySubCategory(subCategoryId));
    }

    @GetMapping("/recent")
    public ResponseEntity<List<ProductDTO>> getRecentProducts(
            @RequestParam(defaultValue = "5") int limit) {
        return ResponseEntity.ok(productService.getRecentProducts(limit));
    }

    @GetMapping("/with-category")
    public ResponseEntity<List<ProductWithCategoryDTO>> getProductsWithCategory() {
        return ResponseEntity.ok(productService.getAllProductsWithCategory());
    }
}