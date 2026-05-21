package com.ecommerce.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProductWithCategoryDTO {

    private Long    id;
    private String  name;
    private String  description;
    private int     price;
    private int     originalPrice;
    private int     discountPercent;
    private int     stock;
    private boolean active;
    private Instant createdAt;
    private String  imageData;
    private String  categoryName;
    private String  subCategoryName;
    private Long categoryId;
    private Long subCategoryId;

    public ProductWithCategoryDTO() {}

    public ProductWithCategoryDTO(
            Long id, String name, String description,
            int price, boolean active, Instant createdAt,
            byte[] imageData, String subCategoryName, String categoryName,
            int stock, int discountPercent, int originalPrice,
            Long categoryId, Long subCategoryId) {

        this.id              = id;
        this.name            = name;
        this.description     = description;
        this.price           = price;
        this.active          = active;
        this.createdAt       = createdAt;
        this.categoryName    = categoryName;
        this.subCategoryName = subCategoryName;
        this.stock           = stock;
        this.discountPercent = discountPercent;
        this.originalPrice   = originalPrice;
        this.categoryId = categoryId;
        this.subCategoryId = subCategoryId;

        if (imageData != null) {
            this.imageData = java.util.Base64.getEncoder().encodeToString(imageData);
        }
    }
}