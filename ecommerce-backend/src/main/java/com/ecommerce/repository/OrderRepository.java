package com.ecommerce.repository;

import com.ecommerce.model.Order;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Long> {

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.user.id = :userId ORDER BY o.createdAt DESC")
    List<Order> findByUserIdWithItems(@Param("userId") Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product ORDER BY o.createdAt DESC")
    List<Order> findAllWithItems();

    List<Order> findTop5ByOrderByCreatedAtDesc();

    @Query("""
            SELECT COUNT(oi) > 0
            FROM OrderItem oi
            WHERE oi.product.id = :productId
              AND oi.order.user.id = :userId
              AND oi.order.status IN :statuses
            """)
    boolean hasUserOrderedProduct(
            @Param("userId") Long userId,
            @Param("productId") Long productId,
            @Param("statuses") List<OrderStatus> statuses
    );

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT o FROM Order o LEFT JOIN FETCH o.items i LEFT JOIN FETCH i.product WHERE o.paymentMethod = :paymentMethod ORDER BY o.createdAt DESC")
    List<Order> findByPaymentMethodWithItems(@Param("paymentMethod") PaymentMethod paymentMethod);

    @Query("SELECT o FROM Order o WHERE o.paymentMethod = 'COD' AND o.codCollected = false AND o.status = 'DELIVERED' ORDER BY o.createdAt DESC")
    List<Order> findPendingCODPayments();
}