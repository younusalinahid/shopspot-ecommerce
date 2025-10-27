package com.ecommerce.dto;

import lombok.Data;
import java.util.ArrayList;
import java.util.List;

@Data
public class CartDTO {
    private Long id;
    private Integer totalPrice = 0;
    private Integer totalItems = 0;
    private List<CartItemDTO> items = new ArrayList<>();
}