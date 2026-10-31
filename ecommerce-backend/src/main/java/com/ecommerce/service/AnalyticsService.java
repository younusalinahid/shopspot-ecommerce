package com.ecommerce.service;

import com.ecommerce.dto.AnalyticsDTO;
import com.ecommerce.model.Order;
import com.ecommerce.model.OrderItem;
import com.ecommerce.model.Product;
import com.ecommerce.model.User;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.model.type.Role;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

import static com.ecommerce.service.SalesMetrics.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public AnalyticsDTO getAnalytics() {
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        ZonedDateTime monthStart = startOfMonth(now);
        ZonedDateTime nextMonth = monthStart.plusMonths(1);

        List<Order> orders = orderRepository.findAllWithItems();
        List<Order> revenueOrders = orders.stream().filter(SalesMetrics::isRevenueOrder).toList();
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .toList();

        // ── Summary ──
        long totalRevenue = revenueOrders.stream().mapToLong(SalesMetrics::amount).sum();
        long revenueThisMonth = revenueOrders.stream()
                .filter(o -> isBetween(o.getCreatedAt(), monthStart, nextMonth))
                .mapToLong(SalesMetrics::amount).sum();
        long totalOrders = orders.stream().filter(SalesMetrics::isPlacedOrder).count();
        long ordersThisMonth = orders.stream()
                .filter(SalesMetrics::isPlacedOrder)
                .filter(o -> isBetween(o.getCreatedAt(), monthStart, nextMonth))
                .count();
        long newCustomersThisMonth = customers.stream()
                .filter(u -> isBetween(u.getCreatedAt(), monthStart, nextMonth))
                .count();

        // ── Daily Sales (last 7 days) ──
        List<Map<String, Object>> dailySales = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime dayStart = startOfDay(now.minusDays(i));
            ZonedDateTime dayEnd = dayStart.plusDays(1);
            dailySales.add(Map.of("date", dayFmt.format(dayStart), "sales", sumBetween(revenueOrders, dayStart, dayEnd)));
        }

        // ── Monthly Sales (last 6 months) ──
        List<Map<String, Object>> monthlySales = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime mStart = monthStart.minusMonths(i);
            monthlySales.add(Map.of("month", monthFmt.format(mStart),
                    "sales", sumBetween(revenueOrders, mStart, mStart.plusMonths(1))));
        }

        // ── Order Status Breakdown ──
        Map<String, Long> orderStatusBreakdown = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            orderStatusBreakdown.put(status.name(), orders.stream().filter(o -> o.getStatus() == status).count());
        }

        // ── Best Selling Products (top 5, by quantity sold) and sales per category ──
        Map<Long, Long> quantityByProduct = new HashMap<>();
        Map<Long, String> productNames = new HashMap<>();
        Map<Long, Long> revenueByProduct = new HashMap<>();
        Map<String, Long> salesByCategory = new LinkedHashMap<>();
        for (Order order : revenueOrders) {
            for (OrderItem item : order.getItems()) {
                Product product = item.getProduct();
                if (product == null || item.getQuantity() == null) continue;
                quantityByProduct.merge(product.getId(), (long) item.getQuantity(), Long::sum);
                productNames.put(product.getId(), product.getName());

                String category = product.getSubCategory() != null && product.getSubCategory().getCategory() != null
                        ? product.getSubCategory().getCategory().getName() : "Other";
                long lineTotal = (long) (item.getPriceAtPurchase() != null ? item.getPriceAtPurchase() : 0) * item.getQuantity();
                salesByCategory.merge(category, lineTotal, Long::sum);
                revenueByProduct.merge(product.getId(), lineTotal, Long::sum);
            }
        }

        List<Map<String, Object>> bestSelling = quantityByProduct.entrySet().stream()
                .sorted(Map.Entry.<Long, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", e.getKey());
                    m.put("name", productNames.get(e.getKey()));
                    m.put("quantity", e.getValue());
                    m.put("revenue", revenueByProduct.getOrDefault(e.getKey(), 0L));
                    return m;
                })
                .toList();

        List<Map<String, Object>> categoryWiseSales = salesByCategory.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("category", e.getKey());
                    m.put("sales", e.getValue());
                    return m;
                })
                .toList();

        // ── Customer Growth (new customers per month, last 6 months) ──
        List<Map<String, Object>> customerGrowth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime mStart = monthStart.minusMonths(i);
            ZonedDateTime mEnd = mStart.plusMonths(1);
            long count = customers.stream().filter(u -> isBetween(u.getCreatedAt(), mStart, mEnd)).count();
            customerGrowth.add(Map.of("month", monthFmt.format(mStart), "customers", count));
        }

        return AnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(productRepository.count())
                .totalCustomers(customers.size())
                .revenueThisMonth(revenueThisMonth)
                .ordersThisMonth(ordersThisMonth)
                .newCustomersThisMonth(newCustomersThisMonth)
                .summary(summarize(orders, now))
                .dailySales(dailySales)
                .monthlySales(monthlySales)
                .orderStatusBreakdown(orderStatusBreakdown)
                .bestSellingProducts(bestSelling)
                .categoryWiseSales(categoryWiseSales)
                .customerGrowth(customerGrowth)
                .build();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getMonthlySalesDetail(int year, int month) {
        ZonedDateTime monthStart = ZonedDateTime.of(year, month, 1, 0, 0, 0, 0, ZONE);
        ZonedDateTime monthEnd = monthStart.plusMonths(1);

        // One query for the whole month instead of two full-table scans per day
        List<Order> monthOrders = orderRepository.findAll().stream()
                .filter(SalesMetrics::isPlacedOrder)
                .filter(o -> isBetween(o.getCreatedAt(), monthStart, monthEnd))
                .toList();

        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        List<Map<String, Object>> result = new ArrayList<>();
        int daysInMonth = monthStart.toLocalDate().lengthOfMonth();
        for (int day = 1; day <= daysInMonth; day++) {
            ZonedDateTime dayStart = monthStart.withDayOfMonth(day);
            ZonedDateTime dayEnd = dayStart.plusDays(1);

            long sales = monthOrders.stream()
                    .filter(SalesMetrics::isRevenueOrder)
                    .filter(o -> isBetween(o.getCreatedAt(), dayStart, dayEnd))
                    .mapToLong(SalesMetrics::amount).sum();
            long count = monthOrders.stream()
                    .filter(SalesMetrics::isRevenueOrder)
                    .filter(o -> isBetween(o.getCreatedAt(), dayStart, dayEnd))
                    .count();

            result.add(Map.of("date", dayFmt.format(dayStart), "sales", sales, "orders", count));
        }
        return result;
    }

    private long sumBetween(List<Order> orders, ZonedDateTime from, ZonedDateTime to) {
        return orders.stream()
                .filter(o -> isBetween(o.getCreatedAt(), from, to))
                .mapToLong(SalesMetrics::amount)
                .sum();
    }
}
