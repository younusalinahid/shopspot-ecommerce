package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findTop8ByOrderByCreatedAtDesc();

    List<Product> findBySubCategoryId(Long subCategoryId);

    @Query("SELECT p FROM Product p " +
            "WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.subCategory.name) LIKE LOWER(CONCAT('%', :query, '%')) " +
            "OR LOWER(p.subCategory.category.name) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Product> searchByNameOrSubCategory(@Param("query") String query);

    List<Product> findByActiveTrue();

    Optional<Product> findByIdAndActiveTrue(Long id);

    @Query("SELECT p FROM Product p ORDER BY p.createdAt DESC")
    List<Product> findAllProducts();

    @Query("SELECT p FROM Product p WHERE p.active = true AND p.stockQuantity > 0 AND p.stockQuantity < 10 ORDER BY p.stockQuantity ASC")
    List<Product> findLowStockProducts();
}