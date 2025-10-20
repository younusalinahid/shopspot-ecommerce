package com.ecommerce.controller;

import com.ecommerce.auth.AuthResponse;
import com.ecommerce.auth.LoginRequest;
import com.ecommerce.auth.RegisterRequest;
import com.ecommerce.model.User;
import com.ecommerce.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public AuthResponse register(@RequestBody RegisterRequest request) {
        User user = userService.register(request);
        String token = userService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }


//    @PostMapping("/login")
//    public AuthResponse login(@RequestBody LoginRequest request) {
//        String token = userService.login(request);
//        return new AuthResponse(token);
//    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        User user = userService.loginUser(request);
        String token = userService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }

}
