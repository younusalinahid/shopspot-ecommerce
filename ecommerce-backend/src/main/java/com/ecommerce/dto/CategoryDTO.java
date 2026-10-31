package com.ecommerce.dto;

import lombok.Data;

import java.util.List;

@Data
public class CategoryDTO {
    private Long id;
    private String name;
    private String icon;
    /** Relative URL of the category picture, or null when none was uploaded. */
    private String imageUrl;
    private List<SubCategoryDTO> subCategories;

    public CategoryDTO() {}

    public CategoryDTO(Long id, String name, String icon, List<SubCategoryDTO> subCategories) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.subCategories = subCategories;
    }
}