package com.ecommerce.controller.admin;

import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.model.Category;
import com.ecommerce.model.SubCategory;
import com.ecommerce.service.CategoryService;
import com.ecommerce.service.SubCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final SubCategoryService subCategoryService;

    @PostMapping
    public ResponseEntity<Category> createCategory(@RequestBody Category category) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.addCategory(category));
    }

    @PostMapping("/{categoryId}/subcategories")
    public ResponseEntity<SubCategoryDTO> createSubCategory(
            @PathVariable Long categoryId,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(subCategoryService.createSubCategoryDTO(categoryId, subCategory));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Category> updateCategory(
            @PathVariable Long id,
            @RequestBody Category category) {
        return ResponseEntity.ok(categoryService.updateCategory(id, category));
    }

    @PutMapping(value = "/{id}/image", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<com.ecommerce.dto.CategoryDTO> uploadCategoryImage(
            @PathVariable Long id,
            @RequestParam("imageFile") org.springframework.web.multipart.MultipartFile imageFile)
            throws java.io.IOException {
        return ResponseEntity.ok(categoryService.updateCategoryImage(id, imageFile));
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<com.ecommerce.dto.CategoryDTO> removeCategoryImage(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.removeCategoryImage(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}