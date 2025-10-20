package com.ecommerce.auth;

import lombok.Getter;

@Getter
public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String confirmPassword;

    public void setFullName(String fullName) { this.fullName = fullName; }

    public void setEmail(String email) { this.email = email; }

    public void setPassword(String password) { this.password = password; }

    public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
}
