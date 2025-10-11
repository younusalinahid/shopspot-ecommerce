package com.ecommerce.service;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.model.Category;
import com.ecommerce.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryDTO> getAllCategoriesWithSubDTO() {
        return categoryRepository.findAll()
                .stream()
                .map(this::convertToCategoryDTO)
                .collect(Collectors.toList());
    }

    public CategoryDTO getCategoryWithSubDTOById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return convertToCategoryDTO(category);
    }

    public Category addCategory(Category category) {
        return categoryRepository.save(category);
    }

    public Category updateCategory(Long id, Category updatedCategory) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        category.setName(updatedCategory.getName());
        category.setIcon(updatedCategory.getIcon());
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }

    private CategoryDTO convertToCategoryDTO(Category category) {
        List<SubCategoryDTO> subDtos = category.getSubCategories()
                .stream()
                .map(sub -> new SubCategoryDTO(sub.getId(), sub.getName()))
                .collect(Collectors.toList());
        return new CategoryDTO(category.getId(), category.getName(), category.getIcon(), subDtos);
    }
}