package com.ecommerce.dto;

import lombok.Data;

@Data
public class CartItemDTO {
    private Long id;
    private Integer quantity;
    private String size;
    private String color;
    private ProductDTO product;
    private Integer itemTotal;
}