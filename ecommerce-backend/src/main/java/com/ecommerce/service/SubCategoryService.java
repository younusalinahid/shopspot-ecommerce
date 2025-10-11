package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.dto.SubCategoryWithProductsDto;
import com.ecommerce.model.Category;
import com.ecommerce.model.SubCategory;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.SubCategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubCategoryService {

    private final SubCategoryRepository subCategoryRepository;
    private final CategoryRepository categoryRepository;

    public SubCategoryService(SubCategoryRepository subCategoryRepository,
                              CategoryRepository categoryRepository) {
        this.subCategoryRepository = subCategoryRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<SubCategoryDTO> getAllSubCategoryDTOs() {
        return subCategoryRepository.findAll()
                .stream()
                .map(sub -> new SubCategoryDTO(sub.getId(), sub.getName()))
                .collect(Collectors.toList());
    }

    public SubCategoryWithProductsDto getSubCategoryWithProductsById(Long id) {
        SubCategory subCategory = subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));

        List<ProductDTO> productDTOs = subCategory.getProducts()
                .stream()
                .map(product -> new ProductDTO(
                        product.getId(),
                        product.getName(),
                        product.getDescription(),
                        product.getPrice(),
                        product.isActive(),
                        product.getCreatedAt(),
                        product.getImageData()
                ))
                .collect(Collectors.toList());

        return new SubCategoryWithProductsDto(subCategory.getId(), subCategory.getName(), productDTOs);
    }


    public SubCategoryDTO createSubCategoryDTO(Long categoryId, SubCategory subCategory) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        subCategory.setCategory(category);
        SubCategory saved = subCategoryRepository.save(subCategory);
        return new SubCategoryDTO(saved.getId(), saved.getName());
    }

    public SubCategoryDTO updateSubCategoryDTO(Long id, SubCategory updatedSubCategory) {
        SubCategory sub = subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));
        sub.setName(updatedSubCategory.getName());
        SubCategory saved = subCategoryRepository.save(sub);
        return new SubCategoryDTO(saved.getId(), saved.getName());
    }

    public void deleteSubCategory(Long id) {
        subCategoryRepository.deleteById(id);
    }

    public SubCategory getSubCategoryById(Long id) {
        return subCategoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubCategory not found"));
    }
}
