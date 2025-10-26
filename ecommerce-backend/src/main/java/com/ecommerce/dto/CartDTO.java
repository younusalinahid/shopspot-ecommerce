package com.ecommerce.dto;

import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class CartDTO {
    private Long id;
    private List<CartItemDTO> items;
    private Instant createdAt;
    private Instant updatedAt;
    private int totalItems;
    private double totalPrice;
}
