package com.ecommerce.controller.admin;

import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.model.SubCategory;
import com.ecommerce.service.SubCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/subCategories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminSubCategoryController {

    private final SubCategoryService subCategoryService;

    @PutMapping("/{id}")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(
            @PathVariable Long id,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.ok(subCategoryService.updateSubCategoryDTO(id, subCategory));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable Long id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.noContent().build();
    }
}