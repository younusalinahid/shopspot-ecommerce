package com.ecommerce.dto;

import lombok.Builder;
import lombok.Data;

/**
 * Money numbers shared by the admin dashboard and analytics page.
 * Revenue = order totals (products + delivery charge) of confirmed / paid / later orders.
 */
@Data
@Builder
public class SalesSummaryDTO {
    private long revenue;              // all time
    private long revenueThisMonth;
    private long revenueLastMonth;     // full previous calendar month
    private long revenueToday;
    private long salesOrders;          // orders counted in revenue
    private long averageOrderValue;    // revenue / salesOrders
    private long productSales;         // items only, after coupon discounts
    private long couponDiscounts;      // given away through coupons, already taken out of revenue
    private long deliveryCharges;      // delivery charge part of revenue
    private long otherCharges;         // tax on old orders (before tax was removed)
    private long codPendingAmount;     // COD orders whose cash is not collected yet
    private long codPendingOrders;
    private long ordersToProcess;      // CONFIRMED + PAID, waiting to be packed
    private long ordersInTransit;      // PROCESSING + SHIPPED
    private long cancelledOrders;
    private long unpaidCheckouts;      // PENDING card checkouts never paid
}
