package com.ecommerce.mapper;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;

import java.util.Base64;
import java.util.stream.Collectors;

public class CartMapper {

    public static CartDTO convertToDTO(Cart cart) {
        CartDTO dto = new CartDTO();
        dto.setId(cart.getId());
        dto.setCreatedAt(cart.getCreatedAt());
        dto.setUpdatedAt(cart.getUpdatedAt());

        dto.setItems(cart.getItems().stream()
                .map(CartMapper::convertCartItemToDTO)
                .collect(Collectors.toList()));

        dto.setTotalItems(cart.getTotalItems());
        dto.setTotalPrice(cart.getTotalPrice());

        return dto;
    }

    public static CartItemDTO convertCartItemToDTO(CartItem item) {
        CartItemDTO dto = new CartItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());

        if (item.getProduct().getImageData() != null) {
            dto.setProductImage(Base64.getEncoder().encodeToString(item.getProduct().getImageData()));
        }

        dto.setPrice(item.getPrice());
        dto.setQuantity(item.getQuantity());
        dto.setSubtotal(item.getPrice() * item.getQuantity());
        dto.setAddedAt(item.getAddedAt());

        return dto;
    }
}
