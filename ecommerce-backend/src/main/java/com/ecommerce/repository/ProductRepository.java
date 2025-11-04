package com.ecommerce.repository;

import com.ecommerce.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;


public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findTop8ByOrderByCreatedAtDesc();

    List<Product> findBySubCategoryId(Long subCategoryId);

    @Query("""
        SELECT p FROM Product p
        WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(p.subCategory.name) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(p.subCategory.category.name) LIKE LOWER(CONCAT('%', :query, '%'))
    """)
    List<Product> searchByNameOrSubCategory(@Param("query") String query);
}
