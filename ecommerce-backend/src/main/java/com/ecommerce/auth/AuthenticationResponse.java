package com.ecommerce.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AuthenticationResponse {
    private String token;
    private String email;
    private String fullName;
    private String role;
    private Long userId;
}
