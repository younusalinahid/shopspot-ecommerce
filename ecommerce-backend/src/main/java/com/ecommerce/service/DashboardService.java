package com.ecommerce.service;

import com.ecommerce.dto.DashboardDTO;
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
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public DashboardDTO getDashboard() {
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Asia/Dhaka"));
        ZonedDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        Instant monthStart = startOfMonth.toInstant();

        // ── Stats ──
        long totalRevenue = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        long totalOrders = orderRepository.count();
        long totalProducts = productRepository.count();
        long totalCustomers = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("USER")).count();

        long revenueThisMonth = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(monthStart))
                .filter(o -> o.getStatus() != OrderStatus.CANCELLED)
                .mapToLong(o -> o.getTotalAmount() != null ? o.getTotalAmount() : 0)
                .sum();

        long ordersThisMonth = orderRepository.findAll().stream()
                .filter(o -> o.getCreatedAt().isAfter(monthStart)).count();

        long newCustomersThisMonth = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("USER"))
                .filter(u -> u.getCreatedAt().isAfter(monthStart)).count();

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

        // ── Order Status Breakdown ──
        Map<String, Long> orderStatusBreakdown = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orderRepository.findAll().stream()
                    .filter(o -> o.getStatus() == status).count();
            orderStatusBreakdown.put(status.name(), count);
        }

        // ── Recent 5 Orders ──
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy")
                .withZone(ZoneId.of("Asia/Dhaka"));

        List<DashboardDTO.RecentOrderDTO> recentOrders = orderRepository
                .findTop5ByOrderByCreatedAtDesc()
                .stream()
                .map(o -> DashboardDTO.RecentOrderDTO.builder()
                        .id(o.getId())
                        .customerName(o.getUser().getFullName())
                        .customerEmail(o.getUser().getEmail())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus().name())
                        .createdAt(dateFmt.format(o.getCreatedAt()))
                        .build())
                .toList();

        // ── Low Stock Products (stock 1-9) ──
        List<DashboardDTO.LowStockDTO> lowStock = productRepository
                .findLowStockProducts()
                .stream()
                .limit(5)
                .map(p -> DashboardDTO.LowStockDTO.builder()
                        .id(p.getId())
                        .name(p.getName())
                        .stock(p.getStockQuantity())
                        .build())
                .toList();

        return DashboardDTO.builder()
                .totalRevenue(totalRevenue)
                .totalOrders(totalOrders)
                .totalProducts(totalProducts)
                .totalCustomers(totalCustomers)
                .revenueThisMonth(revenueThisMonth)
                .ordersThisMonth(ordersThisMonth)
                .newCustomersThisMonth(newCustomersThisMonth)
                .dailySales(dailySales)
                .orderStatusBreakdown(orderStatusBreakdown)
                .recentOrders(recentOrders)
                .lowStockProducts(lowStock)
                .build();
    }
}