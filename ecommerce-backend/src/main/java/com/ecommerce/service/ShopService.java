package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.dto.ShopPageDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Predicate;
import java.util.stream.Collectors;

/**
 * Search, filter, sort and paginate the storefront catalogue for the Shop page.
 * The catalogue is small, so filtering is done in memory over active products.
 */
@Service
@RequiredArgsConstructor
public class ShopService {

    public static final int MAX_PAGE_SIZE = 48;

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    @Transactional(readOnly = true)
    public ShopPageDTO browse(String query, Long categoryId, Long subCategoryId,
                              Integer minPrice, Integer maxPrice, boolean inStockOnly,
                              boolean onSaleOnly, String sort, int page, int size) {
        List<Product> all = productRepository.findByActiveTrue();

        int priceMin = all.stream().mapToInt(Product::calculateSellingPrice).min().orElse(0);
        int priceMax = all.stream().mapToInt(Product::calculateSellingPrice).max().orElse(0);

        // Everything except the category filter, so the sidebar can show counts per category
        Predicate<Product> base = p -> matchesQuery(p, query)
                && (minPrice == null || p.calculateSellingPrice() >= minPrice)
                && (maxPrice == null || p.calculateSellingPrice() <= maxPrice)
                && (!inStockOnly || p.getStockQuantity() > 0)
                && (!onSaleOnly || p.getDiscountPercent() > 0);

        List<Product> filtered = all.stream().filter(base).toList();

        Map<Long, Long> categoryCounts = filtered.stream()
                .filter(p -> categoryIdOf(p) != null)
                .collect(Collectors.groupingBy(ShopService::categoryIdOf, Collectors.counting()));

        List<Product> result = filtered.stream()
                .filter(p -> categoryId == null || categoryId.equals(categoryIdOf(p)))
                .filter(p -> subCategoryId == null
                        || (p.getSubCategory() != null && subCategoryId.equals(p.getSubCategory().getId())))
                .sorted(comparator(sort))
                .toList();

        int safeSize = Math.max(1, Math.min(size, MAX_PAGE_SIZE));
        int totalPages = (int) Math.ceil(result.size() / (double) safeSize);
        int safePage = Math.max(0, Math.min(page, Math.max(totalPages - 1, 0)));
        int from = Math.min(safePage * safeSize, result.size());
        int to = Math.min(from + safeSize, result.size());

        List<ProductDTO> content = result.subList(from, to).stream()
                .map(productMapper::convertToDTO)
                .toList();

        return new ShopPageDTO(content, safePage, safeSize, result.size(), totalPages,
                priceMin, priceMax, categoryCounts);
    }

    private static Long categoryIdOf(Product p) {
        if (p.getSubCategory() == null || p.getSubCategory().getCategory() == null) return null;
        return p.getSubCategory().getCategory().getId();
    }

    /** Every word of the query must appear in the name, description, sub-category or category. */
    private static boolean matchesQuery(Product p, String query) {
        if (query == null || query.isBlank()) return true;
        StringBuilder text = new StringBuilder();
        text.append(p.getName()).append(' ').append(p.getDescription());
        if (p.getSubCategory() != null) {
            text.append(' ').append(p.getSubCategory().getName());
            if (p.getSubCategory().getCategory() != null) {
                text.append(' ').append(p.getSubCategory().getCategory().getName());
            }
        }
        String haystack = text.toString().toLowerCase(Locale.ROOT);
        for (String word : query.toLowerCase(Locale.ROOT).trim().split("\\s+")) {
            if (!haystack.contains(word)) return false;
        }
        return true;
    }

    private static Comparator<Product> comparator(String sort) {
        Comparator<Product> newest = Comparator.comparing(
                (Product p) -> p.getCreatedAt() != null ? p.getCreatedAt() : Instant.EPOCH).reversed();
        if (sort == null) return newest;
        return switch (sort) {
            case "price_asc" -> Comparator.comparingInt(Product::calculateSellingPrice).thenComparing(newest);
            case "price_desc" -> Comparator.comparingInt(Product::calculateSellingPrice).reversed().thenComparing(newest);
            case "discount" -> Comparator.comparingInt(Product::getDiscountPercent).reversed().thenComparing(newest);
            case "name" -> Comparator.comparing((Product p) -> p.getName() == null ? "" : p.getName().toLowerCase(Locale.ROOT));
            default -> newest;
        };
    }
}
