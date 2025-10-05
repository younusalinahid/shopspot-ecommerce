package com.ecommerce.controller;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.model.Category;
import com.ecommerce.model.SubCategory;
import com.ecommerce.service.CategoryService;
import com.ecommerce.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "http://localhost:3000")
public class CategoryController {
    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    public CategoryController(CategoryService categoryService,
                              SubCategoryService subCategoryService) {
        this.categoryService = categoryService;
        this.subCategoryService = subCategoryService;
    }

    // Public endpoint - No authentication needed
    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesWithSub());
    }

    // Public endpoint - No authentication needed
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategory(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getCategoryById(id));
    }

    // Admin only endpoint
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.addCategory(category));
    }

    // Admin only endpoint
    @PostMapping("/{categoryId}/subcategories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubCategory> createSubCategory(
            @PathVariable Long categoryId,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.ok(subCategoryService.createSubCategory(categoryId, subCategory));
    }

    // Admin only endpoint
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    // Admin only endpoint
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}