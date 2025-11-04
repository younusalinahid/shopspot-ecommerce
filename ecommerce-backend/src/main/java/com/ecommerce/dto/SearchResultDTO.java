package com.ecommerce.dto;

import lombok.Data;

@Data
public class SearchResultDTO {
    private Long id;
    private String name;
    private String type;
    private Integer price;
    private String description;
    private String imageData;
    private Long categoryId;
    private Long subCategoryId;
    private String icon;

    public SearchResultDTO() {}

    // Constructor for Product
    public SearchResultDTO(Long id, String name, Integer price, String description, String imageData) {
        this.id = id;
        this.name = name;
        this.type = "PRODUCT";
        this.price = price;
        this.description = description;
        this.imageData = imageData;
    }

    // Constructor for Category
    public SearchResultDTO(Long id, String name, String icon) {
        this.id = id;
        this.name = name;
        this.type = "CATEGORY";
        this.categoryId = id;
        this.icon = icon;
    }

    // Constructor for SubCategory
    public SearchResultDTO(Long id, String name, Long categoryId) {
        this.id = id;
        this.name = name;
        this.type = "SUBCATEGORY";
        this.subCategoryId = id;
        this.categoryId = categoryId;
    }
}