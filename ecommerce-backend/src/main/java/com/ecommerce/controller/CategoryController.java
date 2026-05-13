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

    @GetMapping("/with-products")
    public ResponseEntity<List<CategoryWithProductsDTO>> getCategoriesWithProducts(
            @RequestParam(defaultValue = "4") int productsPerCategory) {
        return ResponseEntity.ok(
                categoryService.getCategoriesWithProducts(productsPerCategory));
    }

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(
            @PathVariable Long categoryId) {
        return ResponseEntity.ok(categoryService.getProductsByCategory(categoryId));
    }
}