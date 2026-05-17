package com.ecommerce.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class WishlistDTO {
    private Long id;
    private Long productId;
    private String productName;
    private Integer productPrice;
    private String productImage;
    private Instant createdAt;
}