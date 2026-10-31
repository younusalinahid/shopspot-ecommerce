package com.ecommerce.repository;

import com.ecommerce.model.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    @Query("""
    SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi
    WHERE oi.product.id = :productId
      AND MONTH(oi.order.createdAt) = :month
      AND YEAR(oi.order.createdAt) = :year
      AND oi.order.status NOT IN ('CANCELLED', 'PENDING')
    """)
    int countByProductIdAndOrderMonth(
            @Param("productId") Long productId,
            @Param("month") int month,
            @Param("year") int year
    );
}