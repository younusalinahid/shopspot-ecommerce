package com.ecommerce.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/** What a shopper sees after applying a code. The order total is worked out again at checkout. */
@Data
@AllArgsConstructor
public class CouponPreviewDTO {
    private String code;
    private String description;
    private int discountAmount;
}
