package com.ecommerce.controller;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.CategoryWithProductsDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.SubCategoryDTO;
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
        return ResponseEntity.ok(categoryService.getCategoriesWithProducts(productsPerCategory));
    }

    @GetMapping("/{categoryId}/products")
    public ResponseEntity<List<ProductDTO>> getProductsByCategory(@PathVariable Long categoryId) {
        List<ProductDTO> products = categoryService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(products);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.ok(categoryService.addCategory(category));
    }

    @PostMapping("/{categoryId}/subcategories")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubCategoryDTO> createSubCategory(
            @PathVariable Long categoryId,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.ok(subCategoryService.createSubCategoryDTO(categoryId, subCategory));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Category> updateCategory(@PathVariable Long id, @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}