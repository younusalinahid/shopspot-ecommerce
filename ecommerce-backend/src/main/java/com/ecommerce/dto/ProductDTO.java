package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {

    private Long    id;
    private String  name;
    private String  description;
    private int     price;
    private int     originalPrice;
    private int     discountPercent;
    private int     stock;
    private boolean active;
    private String  imageData;
    private Instant createdAt;
    private Long    subCategoryId;
    private String  subCategoryName;
    private String  categoryName;
}