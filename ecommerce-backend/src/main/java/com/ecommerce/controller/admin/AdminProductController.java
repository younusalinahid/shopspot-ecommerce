package com.ecommerce.controller.admin;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Product;
import com.ecommerce.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductDTO> createProduct(
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") int price,
            @RequestParam("subCategoryId") Long subCategoryId,
            @RequestParam(value = "stockQuantity", defaultValue = "0") int stockQuantity,
            @RequestParam(value = "discountPercent", defaultValue = "0") int discountPercent,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setDiscountPercent(discountPercent);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.createProduct(product, subCategoryId, imageFile));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDTO> updateProduct(
            @PathVariable(name = "id") Long id,
            @RequestParam("name") String name,
            @RequestParam("description") String description,
            @RequestParam("price") int price,
            @RequestParam("subCategoryId") Long subCategoryId,
            @RequestParam(value = "stockQuantity", defaultValue = "0") int stockQuantity,
            @RequestParam(value = "discountPercent", defaultValue = "0") int discountPercent,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "imageFile", required = false) MultipartFile imageFile
    ) throws IOException {
        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setDiscountPercent(discountPercent);

        return ResponseEntity.ok(productService.updateProduct(id, product, subCategoryId, active, imageFile));
    }

    /** Deletes the product, or hides it when orders/carts/reviews still reference it. */
    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, Object>> deleteProduct(
            @PathVariable(name = "id") Long id) {
        boolean deleted = productService.deleteProduct(id);
        return ResponseEntity.ok(java.util.Map.of(
                "deleted", deleted,
                "message", deleted
                        ? "Product deleted"
                        : "Product is used in orders, carts or reviews, so it was hidden from the store instead"
        ));
    }
}