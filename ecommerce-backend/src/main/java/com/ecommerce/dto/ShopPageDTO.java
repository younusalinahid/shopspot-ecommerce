package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/** One page of the Shop listing plus the numbers the filter sidebar needs. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShopPageDTO {
    private List<ProductDTO> content;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    /** Lowest / highest selling price in the whole store, for the price filter. */
    private int priceMin;
    private int priceMax;
    /** Matching products per category id (search + price + stock filters applied, category filter not). */
    private Map<Long, Long> categoryCounts;
}
