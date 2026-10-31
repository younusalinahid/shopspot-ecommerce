package com.ecommerce.service;

import com.ecommerce.model.Order;
import com.ecommerce.model.type.OrderStatus;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.Set;

/**
 * Shared rules for admin numbers, so the dashboard, analytics and AI stock alerts agree.
 *
 * Revenue only counts orders the customer has actually committed to:
 * a confirmed COD order or a paid card order (and every later step).
 * PENDING = card checkout started but never paid; CANCELLED = no sale.
 */
public final class SalesMetrics {

    public static final ZoneId ZONE = ZoneId.of("Asia/Dhaka");

    public static final Set<OrderStatus> REVENUE_STATUSES = EnumSet.of(
            OrderStatus.CONFIRMED,
            OrderStatus.PAID,
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED
    );

    private SalesMetrics() {
    }

    public static boolean isRevenueOrder(Order order) {
        return order.getStatus() != null && REVENUE_STATUSES.contains(order.getStatus());
    }

    /** A real (placed) order: everything except an unpaid card checkout. */
    public static boolean isPlacedOrder(Order order) {
        return order.getStatus() != null && order.getStatus() != OrderStatus.PENDING;
    }

    public static long amount(Order order) {
        return order.getTotalAmount() != null ? order.getTotalAmount() : 0;
    }

    public static boolean isBetween(Instant value, ZonedDateTime from, ZonedDateTime to) {
        return value != null && !value.isBefore(from.toInstant()) && value.isBefore(to.toInstant());
    }

    public static ZonedDateTime startOfDay(ZonedDateTime time) {
        return time.truncatedTo(ChronoUnit.DAYS);
    }

    public static ZonedDateTime startOfMonth(ZonedDateTime time) {
        return time.withDayOfMonth(1).truncatedTo(ChronoUnit.DAYS);
    }
}
