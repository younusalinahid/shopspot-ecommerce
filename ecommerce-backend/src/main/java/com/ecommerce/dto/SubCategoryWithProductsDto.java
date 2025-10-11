package com.ecommerce.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SubCategoryWithProductsDto {
    private Long id;
    private String name;
    private List<ProductDTO> products;

    public SubCategoryWithProductsDto() {}

    public SubCategoryWithProductsDto(Long id, String name, List<ProductDTO> products) {
        this.id = id;
        this.name = name;
        this.products = products;
    }
}
