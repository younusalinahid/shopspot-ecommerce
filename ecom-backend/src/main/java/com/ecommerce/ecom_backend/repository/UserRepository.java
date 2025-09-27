package com.ecommerce.ecom_backend.repository;

import com.ecommerce.ecom_backend.model.Category;
import com.ecommerce.ecom_backend.model.User;
import com.ecommerce.ecom_backend.model.type.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByEmailContainingOrFullNameContaining(String email, String fullName);

    long countByIsActive(Boolean isActive);

    long countByRolesContaining(Role role);
}
