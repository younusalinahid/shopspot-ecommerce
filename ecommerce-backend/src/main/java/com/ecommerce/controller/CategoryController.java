package com.ecommerce.controller;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.CategoryWithProductsDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesWithSubDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoryDTO> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryWithSubDTOById(id));
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getCategoryImage(@PathVariable Long id) {
        com.ecommerce.model.Category category = categoryService.getCategoryEntity(id);
        if (category.getImageData() == null || category.getImageData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        String type = category.getImageType() != null ? category.getImageType() : "image/jpeg";
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(type))
                // the URL carries ?v=<version>, so it is safe to cache for a long time
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofDays(30)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(category.getImageData());
    }

    @GetMapping("/with-products")
    public ResponseEntity<List<CategoryWithProductsDTO>> getCategoriesWithProducts(
            @RequestParam(name = "productsPerCategory", defaultValue = "4") int productsPerCategory) {
        return ResponseEntity.ok(
                categoryService.getCategoriesWithProducts(productsPerCategory));
    }

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(
            @PathVariable(name = "categoryId") Long categoryId) {
        return ResponseEntity.ok(categoryService.getProductsByCategory(categoryId));
    }
}