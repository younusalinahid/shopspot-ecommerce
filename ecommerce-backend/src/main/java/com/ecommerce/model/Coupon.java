package com.ecommerce.model;

import com.ecommerce.model.type.CouponType;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.Instant;

@Entity
@Table(name = "coupons")
@Getter
@Setter
@NoArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Always stored in upper case. */
    @Column(nullable = false, unique = true, length = 30)
    private String code;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private CouponType type;

    @Column(nullable = false)
    private int discountValue;

    /** Items subtotal needed to use the coupon (0 = no minimum). */
    @Column(nullable = false)
    private int minOrderAmount;

    /** Largest discount a PERCENT coupon can give (null = no cap). */
    private Integer maxDiscount;

    /** Null = usable right away. */
    private Instant startsAt;

    /** Null = never expires. */
    private Instant expiresAt;

    /** Total uses across all customers (null = unlimited). */
    private Integer maxUses;

    /** Uses per customer (null = unlimited). */
    private Integer maxUsesPerCustomer;

    /** Placed orders using this coupon; goes back down when one is cancelled. */
    @Column(nullable = false)
    private int usedCount;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    /** Taka off an items subtotal; never more than the subtotal itself. */
    public int discountFor(int subtotal) {
        if (subtotal <= 0) return 0;
        long discount = discountValue;
        if (type == CouponType.PERCENT) {
            discount = (long) subtotal * discountValue / 100;
            if (maxDiscount != null) discount = Math.min(discount, maxDiscount);
        }
        return (int) Math.min(discount, subtotal);
    }
}
