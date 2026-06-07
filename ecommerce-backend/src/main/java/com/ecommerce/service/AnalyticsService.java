package com.ecommerce.service;

import com.ecommerce.dto.AnalyticsDTO;
import com.ecommerce.model.type.OrderStatus;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public AnalyticsDTO getAnalytics() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Dhaka"));
        ZonedDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Instant monthStart = startOfMonth.toInstant();

        // ── Summary ──
        long totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("USER"))
                .count();

        long revenueThisMonth = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(monthStart))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        long ordersThisMonth = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(monthStart))
                .count();

        long newCustomersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("USER"))
                .filter(u -> u.getCreatedAt().isAfter(monthStart))
                .count();

        // ── Daily Sales (last 7 days) ──
        List<Map<String, Object>> dailySales = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime dayStart = now.minusDays(i).withHour(0).withMinute(0).withSecond(0);
            ZonedDateTime dayEnd = dayStart.plusDays(1);
            long sales = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .filter(o -> o.getCreatedAt().isAfter(dayStart.toInstant())
                            && o.getCreatedAt().isBefore(dayEnd.toInstant()))
                    .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                    .sum();
            dailySales.add(Map.of("date", dayFmt.format(dayStart), "sales", sales));
        }

        // ── Monthly Sales (last 6 months) ──
        List<Map<String, Object>> monthlySales = new ArrayList<>();
        DateTimeFormatter monthFmt = DateTimeFormatter.ofPattern("MMM yyyy");
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime mStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            ZonedDateTime mEnd = mStart.plusMonths(1);
            long sales = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .filter(o -> o.getCreatedAt().isAfter(mStart.toInstant())
                            && o.getCreatedAt().isBefore(mEnd.toInstant()))
                    .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                    .sum();
            monthlySales.add(Map.of("month", monthFmt.format(mStart), "sales", sales));
        }

        // ── Order Status Breakdown ──
        Map<String, Long> orderStatusBreakdown = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() == status)
                    .count();
            orderStatusBreakdown.put(status.name(), count);
        }

        // ── Best Selling Products (top 5) ──
        Map<String, Long> productSales = new HashMap<>();
        orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .forEach(order -> order.getItems().forEach(item -> {
                    String name = item.getProduct().getName();
                    productSales.merge(name, (long) item.getQuantity(), Long::sum);
                }));

        List<Map<String, Object>> bestSelling = productSales.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed())
                .limit(5)
                .map(e -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("name", e.getKey());
                    m.put("quantity", e.getValue());
                    return m;
                })
                .toList();

        // ── Customer Growth (last 6 months) ──
        List<Map<String, Object>> customerGrowth = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            ZonedDateTime mStart = now.minusMonths(i).withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
            ZonedDateTime mEnd = mStart.plusMonths(1);
            long count = userRepository.findAll().stream()
                    .filter(u -> u.getRole().name().equals("USER"))
                    .filter(u -> u.getCreatedAt().isAfter(mStart.toInstant())
                            && u.getCreatedAt().isBefore(mEnd.toInstant()))
                    .count();
            customerGrowth.add(Map.of("month", monthFmt.format(mStart), "customers", count));
        }

        return AnalyticsDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .revenueThisMonth(revenueThisMonth)
                .ordersThisMonth(ordersThisMonth)
                .newCustomersThisMonth(newCustomersThisMonth)
                .dailySales(dailySales)
                .monthlySales(monthlySales)
                .orderStatusBreakdown(orderStatusBreakdown)
                .bestSellingProducts(bestSelling)
                .customerGrowth(customerGrowth)
                .build();
    }

    public List<Map<String, Object>> getMonthlySalesDetail(int year, int month) {
        ZoneId dhaka = ZoneId.of("Asia/Dhaka");
        ZonedDateTime monthStart = ZonedDateTime.of(year, month, 1, 0, 0, 0, 0, dhaka);
        ZonedDateTime monthEnd = monthStart.plusMonths(1);

        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        List<Map<String, Object>> result = new ArrayList<>();

        int daysInMonth = monthStart.toLocalDate().lengthOfMonth();
        for (int i = 1; i <= daysInMonth; i++) {
            ZonedDateTime dayStart = ZonedDateTime.of(year, month, i, 0, 0, 0, 0, dhaka);
            ZonedDateTime dayEnd = dayStart.plusDays(1);

            long sales = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                    .filter(o -> o.getCreatedAt().isAfter(dayStart.toInstant())
                            && o.getCreatedAt().isBefore(dayEnd.toInstant()))
                    .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                    .sum();

            long orders = orderRepository.findAll().stream()
                    .filter(o -> o.getCreatedAt().isAfter(dayStart.toInstant())
                            && o.getCreatedAt().isBefore(dayEnd.toInstant()))
                    .count();

            result.add(Map.of(
                    "date", dayFmt.format(dayStart),
                    "sales", sales,
                    "orders", orders
            ));
        }
        return result;
    }
}