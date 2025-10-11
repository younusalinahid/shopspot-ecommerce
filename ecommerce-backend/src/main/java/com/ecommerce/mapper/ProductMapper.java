package com.ecommerce.mapper;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.SubCategory;
import org.springframework.stereotype.Component;

@Component
public class ProductMapper {

    public ProductDTO convertToDTO(Product product) {
        SubCategory sub = product.getSubCategory();
        return new ProductDTO(
                product.getId(),
                product.getName(),
                product.getDescription(),
                product.getPrice(),
                product.isActive(),
                product.getCreatedAt(),
                product.getImageData()
        );
    }
}
