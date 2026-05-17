package com.ecommerce.dto;

import com.ecommerce.model.type.Role;
import lombok.Data;
import java.time.Instant;

@Data
public class UserProfileDTO {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String address;
    private String profileImage;
    private Role role;
    private Instant createdAt;
}