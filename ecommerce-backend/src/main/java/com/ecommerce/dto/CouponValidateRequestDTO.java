package com.ecommerce.dto;

import lombok.Data;

@Data
public class CouponValidateRequestDTO {
    private String code;
    private Integer subtotal;
}
