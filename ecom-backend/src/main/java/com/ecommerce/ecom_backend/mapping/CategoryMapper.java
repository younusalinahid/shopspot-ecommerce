package com.ecommerce.ecom_backend.mapping;

import com.ecommerce.ecom_backend.dto.CategoryDTO;
import com.ecommerce.ecom_backend.dto.SubCategoryDTO;
import com.ecommerce.ecom_backend.model.Category;
import com.ecommerce.ecom_backend.model.SubCategory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CategoryMapper {

    public CategoryDTO toDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setIcon(category.getIcon());

        if (category.getSubCategories() != null) {
            List<SubCategoryDTO> subDTOs = category.getSubCategories().stream()
                    .map(this::toSubCategoryDTO)
                    .toList();
            dto.setSubCategories(subDTOs);
        }

        return dto;
    }

    private SubCategoryDTO toSubCategoryDTO(SubCategory subCategory) {
        SubCategoryDTO dto = new SubCategoryDTO();
        dto.setId(subCategory.getId());
        dto.setName(subCategory.getName());
        return dto;
    }

    public List<CategoryDTO> toDTOList(List<Category> categories) {
        return categories.stream().map(this::toDTO).toList();
    }
}
