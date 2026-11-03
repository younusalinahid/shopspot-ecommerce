package com.ecommerce.dto;

import com.ecommerce.model.type.CouponType;
import lombok.Data;

import java.time.Instant;

/** Admin view of a coupon. id, usedCount and createdAt are ignored when saving. */
@Data
public class CouponDTO {
    private Long id;
    private String code;
    private String description;
    private CouponType type;
    private Integer discountValue;
    private Integer minOrderAmount;
    private Integer maxDiscount;
    private Instant startsAt;
    private Instant expiresAt;
    private Integer maxUses;
    private Integer maxUsesPerCustomer;
    private Integer usedCount;
    private Boolean active;
    private Instant createdAt;
}
