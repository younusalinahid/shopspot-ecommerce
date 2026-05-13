package com.ecommerce.dto;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String role,
        Instant createdAt
) {
    public static UserResponse from(com.ecommerce.model.User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getCreatedAt()
        );
    }
}