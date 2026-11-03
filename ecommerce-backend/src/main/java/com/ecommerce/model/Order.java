package com.ecommerce.model;

import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;
import com.ecommerce.model.type.ShippingAddress;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    @Embedded
    private ShippingAddress shippingAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(30)")
    private OrderStatus status = OrderStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", nullable = false, columnDefinition = "VARCHAR(20)")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CARD;

    @Column(name = "cod_collected")
    @Builder.Default
    private Boolean codCollected = false;

    @Column(nullable = false)
    private Integer totalAmount;

    /** Delivery charge included in totalAmount (null for orders placed before this was stored). */
    private Integer shippingFee;

    /** Code of the coupon used, kept as text so the order stays correct if the coupon changes later. */
    private String couponCode;

    /** Taka taken off by the coupon, already subtracted from totalAmount (null = none). */
    private Integer discountAmount;

    /** True once this order counts towards the coupon's usage (given back on cancel). */
    @Builder.Default
    private Boolean couponRedeemed = false;

    /** True once this order's items were subtracted from product stock (restored on cancel). */
    @Builder.Default
    private Boolean stockDeducted = false;

    /** Email for orders placed without an account (user is null). */
    private String guestEmail;

    /** Random secret that lets a guest confirm / view their own order. */
    private String guestToken;

    private String stripePaymentIntentId;
    private String stripeClientSecret;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;
}