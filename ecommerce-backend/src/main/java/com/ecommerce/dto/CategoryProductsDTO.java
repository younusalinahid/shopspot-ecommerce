package com.ecommerce.dto;

import lombok.Data;
import java.util.List;

@Data
public class CategoryProductsDTO {
    private Long id;
    private String name;
    private String icon;
    private List<ProductDTO> products;
}
