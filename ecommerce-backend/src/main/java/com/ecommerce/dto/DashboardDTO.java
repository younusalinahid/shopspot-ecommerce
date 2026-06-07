package com.ecommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardDTO {
    private long totalRevenue;
    private long totalOrders;
    private long totalProducts;
    private long totalCustomers;
    private long revenueThisMonth;
    private long ordersThisMonth;
    private long newCustomersThisMonth;

    private List<Map<String, Object>> dailySales;
    private Map<String, Long> orderStatusBreakdown;

    private List<RecentOrderDTO> recentOrders;
    private List<LowStockDTO> lowStockProducts;

    @Data
    @Builder
    public static class RecentOrderDTO {
        private Long id;
        private String customerName;
        private String customerEmail;
        private Integer totalAmount;
        private String status;
        private String createdAt;
    }

    @Data
    @Builder
    public static class LowStockDTO {
        private Long id;
        private String name;
        private int stock;
    }
}