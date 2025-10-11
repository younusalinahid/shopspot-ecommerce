package com.ecommerce.dto;

import com.ecommerce.model.type.Role;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.Set;

@Data

public class UserDto {

    private Long id;
    private String email;
    private String fullName;
    private String phoneNumber;
    private Set<Role> roles;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}