package com.ecommerce.controller.admin;

import com.ecommerce.dto.ProductSalesDataDTO;
import com.ecommerce.repository.OrderItemRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.InventoryForecastService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InventoryAIController {

    private final InventoryForecastService forecastService;
    private final ProductRepository        productRepository;
    private final OrderItemRepository      orderItemRepository;

    @GetMapping("/forecast-alerts")
    public ResponseEntity<String> getStockAlerts() {

        LocalDate now       = LocalDate.now();
        List<ProductSalesDataDTO> salesData = new ArrayList<>();

        productRepository.findByActiveTrue().forEach(product -> {
            Map<String, Integer> monthlySales = new LinkedHashMap<>();

            for (int i = 2; i >= 0; i--) {
                LocalDate month = now.minusMonths(i);
                String monthName = month.getMonth().getDisplayName(
                        java.time.format.TextStyle.FULL,
                        java.util.Locale.ENGLISH
                );
                int count = orderItemRepository
                        .countByProductIdAndOrderMonth(
                                product.getId(),
                                month.getMonthValue(),
                                month.getYear()
                        );
                monthlySales.put(monthName, count);
            }

            boolean hasSales = monthlySales.values().stream().anyMatch(v -> v > 0);
            if (!hasSales) return;

            salesData.add(new ProductSalesDataDTO(
                    product.getId(),
                    product.getName(),
                    product.getStockQuantity(),
                    monthlySales
            ));
        });

        String result = forecastService.getInventoryAlerts(salesData);
        return ResponseEntity.ok()
                .header("Content-Type", "application/json")
                .body(result);
    }
}