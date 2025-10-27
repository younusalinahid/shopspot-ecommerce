package com.ecommerce.mapper;

import com.ecommerce.dto.CartDTO;
import com.ecommerce.dto.CartItemDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Cart;
import com.ecommerce.model.CartItem;
import com.ecommerce.model.Product;
import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartDTO toDTO(Cart cart) {
        if (cart == null) {
            return null;
        }

        CartDTO cartDTO = new CartDTO();
        cartDTO.setId(cart.getId());
        cartDTO.setTotalPrice(cart.getTotalPrice());
        cartDTO.setTotalItems(cart.getTotalItems());

        if (cart.getCartItems() != null) {
            cartDTO.setItems(cart.getCartItems().stream()
                    .map(this::toCartItemDTO)
                    .collect(Collectors.toList()));
        }

        return cartDTO;
    }

    public CartItemDTO toCartItemDTO(CartItem cartItem) {
        if (cartItem == null) {
            return null;
        }

        CartItemDTO dto = new CartItemDTO();
        dto.setId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());
        dto.setSize(cartItem.getSize());
        dto.setColor(cartItem.getColor());
        dto.setProduct(toProductDTO(cartItem.getProduct()));

        // Calculate item total
        if (cartItem.getProduct() != null && cartItem.getQuantity() != null) {
            Integer itemTotal = cartItem.getProduct().getPrice() * cartItem.getQuantity();
            dto.setItemTotal(itemTotal);
        } else {
            dto.setItemTotal(0);
        }

        return dto;
    }

    public ProductDTO toProductDTO(Product product) {
        if (product == null) {
            return createEmptyProductDTO();
        }

        String imageData = convertImageData(product.getImageData());

        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setPrice(product.getPrice());
        dto.setActive(product.isActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setImageData(imageData);

        return dto;
    }

    private String convertImageData(byte[] imageBytes) {
        if (imageBytes == null || imageBytes.length == 0) {
            return null;
        }

        try {
            String imageString = new String(imageBytes);
            if (imageString.startsWith("data:image/")) {
                return imageString;
            }

            return "data:image/jpeg;base64," + Base64.getEncoder().encodeToString(imageBytes);
        } catch (Exception e) {
            System.err.println("Error converting image data: " + e.getMessage());
            return null;
        }
    }

    private ProductDTO createEmptyProductDTO() {
        ProductDTO dto = new ProductDTO();
        dto.setId(0L);
        dto.setName("Product Not Available");
        dto.setPrice(0);
        dto.setActive(false);
        return dto;
    }
}