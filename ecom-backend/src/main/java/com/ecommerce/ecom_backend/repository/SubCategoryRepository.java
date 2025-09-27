package com.ecommerce.ecom_backend.repository;

import com.ecommerce.ecom_backend.model.SubCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubCategoryRepository extends JpaRepository<SubCategory, Long> {
}
