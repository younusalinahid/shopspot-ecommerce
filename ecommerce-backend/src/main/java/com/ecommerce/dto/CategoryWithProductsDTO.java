package com.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryWithProductsDTO {
    private Long id;
    private String name;
    private String icon;
    private List<ProductDTO> products;

    public CategoryWithProductsDTO() {}

    public CategoryWithProductsDTO(Long id, String name, String icon, List<ProductDTO> products) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.products = products;
    }
}