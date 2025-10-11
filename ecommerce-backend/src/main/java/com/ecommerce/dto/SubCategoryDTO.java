package com.ecommerce.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class SubCategoryDTO {
    private Long id;
    private String name;

    public SubCategoryDTO() {}

    public SubCategoryDTO(Long id, String name) {
        this.id = id;
        this.name = name;
    }
}
