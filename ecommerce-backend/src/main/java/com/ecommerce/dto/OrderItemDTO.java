package com.ecommerce.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private Integer quantity;
    private Integer priceAtPurchase;
    private String size;
    private String color;
}