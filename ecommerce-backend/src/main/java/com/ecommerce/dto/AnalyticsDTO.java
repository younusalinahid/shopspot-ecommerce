package com.ecommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class AnalyticsDTO {
    private long totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;
    private long newCustomersThisMonth;
    private long revenueThisMonth;
    private long ordersThisMonth;

    private List<Map<String, Object>> dailySales;      // last 7 days
    private List<Map<String, Object>> monthlySales;    // last 6 months
    private Map<String, Long> orderStatusBreakdown;    // pie chart
    private List<Map<String, Object>> bestSellingProducts; // top 5
    private List<Map<String, Object>> categoryWiseSales;   // bar chart
    private List<Map<String, Object>> customerGrowth;      // monthly
}