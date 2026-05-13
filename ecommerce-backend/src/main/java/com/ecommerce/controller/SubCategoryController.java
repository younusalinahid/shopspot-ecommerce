package com.ecommerce.controller;

import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.dto.SubCategoryWithProductsDto;
import com.ecommerce.service.SubCategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/public/subCategories")
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
}