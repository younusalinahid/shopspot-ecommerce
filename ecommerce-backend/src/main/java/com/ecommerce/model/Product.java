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

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sub_category_id")
    @JsonBackReference
    private SubCategory subCategory;
}