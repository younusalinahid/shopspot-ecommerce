package com.ecommerce.auth;

import com.ecommerce.model.type.Role;

public class AuthResponse {
    private String token;
    private String email;
    private String fullName;
    private Role role;

    public AuthResponse(String token, String email, String fullName, Role role) {
        this.token = token;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getEmail() { return email; }
    public String getFullName() { return fullName; }
    public Role getRole() { return role; }

    public void setToken(String token) { this.token = token; }
    public void setEmail(String email) { this.email = email; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public void setRole(Role role) { this.role = role; }
}
