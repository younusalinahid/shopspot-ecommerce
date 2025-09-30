package com.ecommerce.mapper;

import com.ecommerce.dto.CategoryDTO;
import com.ecommerce.dto.SubCategoryDTO;
import com.ecommerce.model.Category;
import com.ecommerce.model.SubCategory;
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
