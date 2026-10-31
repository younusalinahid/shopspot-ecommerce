package com.ecommerce.mapper;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.SubCategory;
import com.ecommerce.model.Category;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    public ProductDTO convertToDTO(Product product) {
        ProductDTO dto = new ProductDTO();

        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setDescription(product.getDescription());
        dto.setActive(product.isActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setDiscountPercent(product.getDiscountPercent());
        dto.setStock(product.getStockQuantity());

        int originalPrice = product.getPrice();
        if (product.getDiscountPercent() > 0) {
            int discounted = originalPrice
                    - (originalPrice * product.getDiscountPercent() / 100);
            dto.setPrice(discounted);
            dto.setOriginalPrice(originalPrice);
        } else {
            dto.setPrice(originalPrice);
            dto.setOriginalPrice(0);
        }

        dto.setImageData(com.ecommerce.util.ImageUrls.product(product.getId(), product.getImageData()));

        SubCategory sub = product.getSubCategory();
        if (sub != null) {
            dto.setSubCategoryId(sub.getId());
            dto.setSubCategoryName(sub.getName());

            Category cat = sub.getCategory();
            if (cat != null) {
                dto.setCategoryName(cat.getName());
            }
        }

        return dto;
    }

    public List<ProductDTO> toDTOList(List<Product> products) {
        return products.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
}