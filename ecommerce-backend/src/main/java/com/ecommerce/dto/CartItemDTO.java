package com.ecommerce.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class CartItemDTO {
    private Long id;
    private Long productId;
    private String productName;
    private String productImage;
    private double price;
    private int quantity;
    private double subtotal;
    private Instant addedAt;
}
