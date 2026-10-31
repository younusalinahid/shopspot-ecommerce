package com.ecommerce.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import java.time.Instant;

@Entity
@Data
@AllArgsConstructor
@NoArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    private int price;
    private boolean active = true;

    @Column(nullable = false)
    private int stockQuantity = 0;

    @Column(nullable = false)
    private int discountPercent = 0;

    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imageData;

    /** Sizes customers can pick, comma separated (e.g. "S,M,L,XL"). Empty = one size / no choice. */
    @Column(length = 200)
    private String sizes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    @JsonBackReference
    private SubCategory subCategory;

    /**
     * Price the customer actually pays (after discount). Same formula as ProductMapper,
     * so the cart, the order total and the product page always agree.
     */
    /** Sizes as a list, in the order the admin entered them. */
    public java.util.List<String> sizeList() {
        if (sizes == null || sizes.isBlank()) return java.util.List.of();
        return java.util.Arrays.stream(sizes.split(","))
                .map(String::trim).filter(s -> !s.isEmpty()).toList();
    }

    /** Cleans admin input: trims, upper-cases, removes duplicates, max 15 sizes of up to 12 characters. */
    public static String normalizeSizes(String raw) {
        if (raw == null) return null;
        java.util.LinkedHashMap<String, String> unique = new java.util.LinkedHashMap<>();
        for (String part : raw.split("[,;\\n]")) {
            String s = part.trim();
            if (s.isEmpty()) continue;
            if (s.length() > 12) throw new IllegalArgumentException("Size \"" + s + "\" is too long (max 12 characters)");
            String upper = s.toUpperCase(java.util.Locale.ROOT);
            unique.putIfAbsent(upper, upper);
        }
        if (unique.size() > 15) throw new IllegalArgumentException("A product can have at most 15 sizes");
        return unique.isEmpty() ? null : String.join(",", unique.values());
    }

    /**
     * The size to store on a cart/order line. Products without sizes ignore it;
     * products with sizes need one of their own sizes.
     */
    public String resolveSize(String requested) {
        java.util.List<String> list = sizeList();
        if (list.isEmpty()) return null;
        if (requested == null || requested.isBlank()) {
            throw new IllegalArgumentException("Please choose a size for " + name);
        }
        return list.stream().filter(s -> s.equalsIgnoreCase(requested.trim())).findFirst()
                .orElseThrow(() -> new IllegalArgumentException(
                        "Size " + requested.trim() + " is not available for " + name));
    }

    public int calculateSellingPrice() {
        if (discountPercent > 0) {
            return price - (price * discountPercent / 100);
        }
        return price;
    }
}