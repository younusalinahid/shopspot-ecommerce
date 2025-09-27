package com.ecommerce.ecom_backend.controller;

import com.ecommerce.ecom_backend.dto.CategoryDTO;
import com.ecommerce.ecom_backend.model.Category;
import com.ecommerce.ecom_backend.model.SubCategory;
import com.ecommerce.ecom_backend.service.CategoryService;
import com.ecommerce.ecom_backend.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
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

    @GetMapping
    public ResponseEntity<List<CategoryDTO>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategoriesWithSub());
    }

    @GetMapping("/{id}")
    public Category getCategory(@PathVariable Long id) {
        return categoryService.getCategoryById(id);
    }


    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.addCategory(category));
    }

    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<SubCategory> createSubCategory(
            @PathVariable Long categoryId,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.ok(subCategoryService.createSubCategory(categoryId, subCategory));
    }

    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return categoryService.updateCategory(id, category);
    }

    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
    }
}
