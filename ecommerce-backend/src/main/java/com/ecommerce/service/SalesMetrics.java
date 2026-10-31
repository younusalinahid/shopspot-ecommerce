package com.ecommerce.service;

import com.ecommerce.dto.SalesSummaryDTO;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.PaymentMethod;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.EnumSet;
import java.util.List;
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

    /** Price of the items only (no delivery charge). */
    public static long itemsSubtotal(Order order) {
        if (order.getItems() == null) return 0;
        long sum = 0;
        for (OrderItem item : order.getItems()) {
            if (item.getPriceAtPurchase() != null && item.getQuantity() != null) {
                sum += (long) item.getPriceAtPurchase() * item.getQuantity();
            }
        }
        return sum;
    }

    /** Delivery charge stored on the order (older orders did not store it). */
    public static long deliveryCharge(Order order) {
        if (order.getShippingFee() != null) return order.getShippingFee();
        // Old orders: total = items + delivery + 7% tax
        long rest = amount(order) - itemsSubtotal(order) - Math.round(itemsSubtotal(order) * 0.07);
        return Math.max(0, rest);
    }

    /** COD order the customer committed to, but the cash has not been marked as collected. */
    public static boolean isCodCashPending(Order order) {
        return order.getPaymentMethod() == PaymentMethod.COD
                && isRevenueOrder(order)
                && !Boolean.TRUE.equals(order.getCodCollected());
    }

    /** Needs orders loaded with their items (OrderRepository.findAllWithItems). */
    public static SalesSummaryDTO summarize(List<Order> orders, ZonedDateTime now) {
        ZonedDateTime monthStart = startOfMonth(now);
        ZonedDateTime nextMonth = monthStart.plusMonths(1);
        ZonedDateTime lastMonth = monthStart.minusMonths(1);
        ZonedDateTime today = startOfDay(now);

        long revenue = 0, thisMonth = 0, prevMonth = 0, todayRevenue = 0, count = 0;
        long products = 0, delivery = 0, codAmount = 0, codOrders = 0;
        long toProcess = 0, inTransit = 0, cancelled = 0, unpaid = 0;

        for (Order o : orders) {
            OrderStatus status = o.getStatus();
            if (status == OrderStatus.CONFIRMED || status == OrderStatus.PAID) toProcess++;
            if (status == OrderStatus.PROCESSING || status == OrderStatus.SHIPPED) inTransit++;
            if (status == OrderStatus.CANCELLED) cancelled++;
            if (status == OrderStatus.PENDING) unpaid++;
            if (!isRevenueOrder(o)) continue;

            long total = amount(o);
            revenue += total;
            count++;
            products += itemsSubtotal(o);
            delivery += deliveryCharge(o);
            if (isBetween(o.getCreatedAt(), monthStart, nextMonth)) thisMonth += total;
            if (isBetween(o.getCreatedAt(), lastMonth, monthStart)) prevMonth += total;
            if (isBetween(o.getCreatedAt(), today, today.plusDays(1))) todayRevenue += total;
            if (isCodCashPending(o)) {
                codAmount += total;
                codOrders++;
            }
        }

        return SalesSummaryDTO.builder()
                .revenue(revenue)
                .revenueThisMonth(thisMonth)
                .revenueLastMonth(prevMonth)
                .revenueToday(todayRevenue)
                .salesOrders(count)
                .averageOrderValue(count == 0 ? 0 : Math.round((double) revenue / count))
                .productSales(products)
                .deliveryCharges(delivery)
                .otherCharges(Math.max(0, revenue - products - delivery))
                .codPendingAmount(codAmount)
                .codPendingOrders(codOrders)
                .ordersToProcess(toProcess)
                .ordersInTransit(inTransit)
                .cancelledOrders(cancelled)
                .unpaidCheckouts(unpaid)
                .build();
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
