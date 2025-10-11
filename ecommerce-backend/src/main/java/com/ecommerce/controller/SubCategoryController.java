package com.ecommerce.controller;

import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.dto.SubCategoryWithProductsDto;
import com.ecommerce.model.SubCategory;
import com.ecommerce.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subCategories")
@CrossOrigin(origins = "http://localhost:3000")
public class SubCategoryController {

    private final SubCategoryService subCategoryService;

    public SubCategoryController(SubCategoryService subCategoryService) {
        this.subCategoryService = subCategoryService;
    }

    @GetMapping
    public ResponseEntity<List<SubCategoryDTO>> getAllSubCategories() {
        return ResponseEntity.ok(subCategoryService.getAllSubCategoryDTOs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubCategoryWithProductsDto> getSubCategory(@PathVariable Long id) {
        return ResponseEntity.ok(subCategoryService.getSubCategoryWithProductsById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SubCategoryDTO> updateSubCategory(
            @PathVariable Long id,
            @RequestBody SubCategory subCategory) {
        return ResponseEntity.ok(subCategoryService.updateSubCategoryDTO(id, subCategory));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubCategory(@PathVariable Long id) {
        subCategoryService.deleteSubCategory(id);
        return ResponseEntity.noContent().build();
    }
}
