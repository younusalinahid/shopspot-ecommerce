package com.ecommerce.model;

import com.ecommerce.model.type.CouponType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CouponTest {

    private static Coupon coupon(CouponType type, int value, Integer cap) {
        Coupon coupon = new Coupon();
        coupon.setType(type);
        coupon.setDiscountValue(value);
        coupon.setMaxDiscount(cap);
        return coupon;
    }

    @Test
    void percentRoundsDownToWholeTaka() {
        assertEquals(149, coupon(CouponType.PERCENT, 15, null).discountFor(999));
    }

    @Test
    void percentRespectsCap() {
        assertEquals(200, coupon(CouponType.PERCENT, 50, 200).discountFor(1000));
    }

    @Test
    void percentOnLargeSubtotalDoesNotOverflow() {
        assertEquals(2_000_000_000, coupon(CouponType.PERCENT, 100, null).discountFor(2_000_000_000));
    }

    @Test
    void fixedNeverExceedsSubtotal() {
        assertEquals(300, coupon(CouponType.FIXED, 500, null).discountFor(300));
        assertEquals(500, coupon(CouponType.FIXED, 500, null).discountFor(800));
    }

    @Test
    void emptySubtotalGivesNoDiscount() {
        assertEquals(0, coupon(CouponType.FIXED, 500, null).discountFor(0));
    }
}
