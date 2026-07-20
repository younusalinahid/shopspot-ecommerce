package com.ecommerce.dto;

import lombok.Data;

import java.util.Map;

@Data
public class ProductSalesDataDTO {
    private Long productId;
    private String productName;
    private int currentStock;
    private Map<String, Integer> monthlySales;

    public ProductSalesDataDTO(Long productId, String productName, int currentStock, Map<String, Integer> monthlySales) {
        this.productId = productId;
        this.productName = productName;
        this.currentStock = currentStock;
        this.monthlySales = monthlySales;
    }

}