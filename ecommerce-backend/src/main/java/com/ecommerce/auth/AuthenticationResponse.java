package com.ecommerce.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {

    private String accessToken;
    private String refreshToken;

    private Long userId;
    private String email;
    private String fullName;
    private String role;
}