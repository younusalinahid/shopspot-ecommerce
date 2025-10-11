package com.ecommerce.dto;

import lombok.Data;
import java.time.Instant;

@Data
public class ProductDTO {

    private Long id;
    private String name;
    private String description;
    private int price;
    private boolean active;
    private Instant createdAt;
    private String imageData;

    public ProductDTO() {}

    public ProductDTO(Long id, String name, String description, int price, boolean active,
                      Instant createdAt, byte[] imageData) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.active = active;
        this.createdAt = createdAt;

        if (imageData != null) {
            this.imageData = java.util.Base64.getEncoder().encodeToString(imageData);
        }
    }
}
