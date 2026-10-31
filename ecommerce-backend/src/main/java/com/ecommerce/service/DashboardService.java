package com.ecommerce.service;

import com.ecommerce.dto.DashboardDTO;
import com.ecommerce.model.Order;
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
public class DashboardService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public DashboardDTO getDashboard() {
        ZonedDateTime now = ZonedDateTime.now(ZONE);
        ZonedDateTime monthStart = startOfMonth(now);
        ZonedDateTime nextMonth = monthStart.plusMonths(1);

        // Load each table once instead of once per number
        List<Order> orders = orderRepository.findAll();
        List<Product> products = productRepository.findAll();
        List<User> customers = userRepository.findAll().stream()
                .filter(u -> u.getRole() == Role.USER)
                .toList();

        // ── Stats ──
        long totalRevenue = orders.stream().filter(SalesMetrics::isRevenueOrder).mapToLong(SalesMetrics::amount).sum();
        long revenueThisMonth = orders.stream()
                .filter(SalesMetrics::isRevenueOrder)
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
        long activeProducts = products.stream().filter(Product::isActive).count();
        long outOfStockProducts = products.stream()
                .filter(Product::isActive)
                .filter(p -> p.getStockQuantity() <= 0)
                .count();

        // ── Daily Sales (last 7 days) ──
        List<Map<String, Object>> dailySales = new ArrayList<>();
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("dd MMM");
        for (int i = 6; i >= 0; i--) {
            ZonedDateTime dayStart = startOfDay(now.minusDays(i));
            ZonedDateTime dayEnd = dayStart.plusDays(1);
            long sales = orders.stream()
                    .filter(SalesMetrics::isRevenueOrder)
                    .filter(o -> isBetween(o.getCreatedAt(), dayStart, dayEnd))
                    .mapToLong(SalesMetrics::amount).sum();
            dailySales.add(Map.of("date", dayFmt.format(dayStart), "sales", sales));
        }

        // ── Order Status Breakdown ──
        Map<String, Long> orderStatusBreakdown = new LinkedHashMap<>();
        for (OrderStatus status : OrderStatus.values()) {
            orderStatusBreakdown.put(status.name(), orders.stream().filter(o -> o.getStatus() == status).count());
        }

        // ── Recent 5 Orders ──
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd MMM yyyy").withZone(ZONE);
        List<DashboardDTO.RecentOrderDTO> recentOrders = orders.stream()
                .sorted(Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .limit(5)
                .map(o -> DashboardDTO.RecentOrderDTO.builder()
                        .id(o.getId())
                        .customerName(o.getUser() != null
                                ? o.getUser().getFullName()
                                : (o.getShippingAddress() != null ? o.getShippingAddress().getFullName() + " (Guest)" : "Guest"))
                        .customerEmail(o.getUser() != null ? o.getUser().getEmail() : o.getGuestEmail())
                        .totalAmount(o.getTotalAmount())
                        .status(o.getStatus().name())
                        .createdAt(o.getCreatedAt() != null ? dateFmt.format(o.getCreatedAt()) : "")
                        .build())
                .toList();

        // ── Low Stock Products (active, below 10, out-of-stock first) ──
        List<DashboardDTO.LowStockDTO> lowStock = productRepository.findLowStockProducts()
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
                .totalProducts(products.size())
                .activeProducts(activeProducts)
                .outOfStockProducts(outOfStockProducts)
                .totalCustomers(customers.size())
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
