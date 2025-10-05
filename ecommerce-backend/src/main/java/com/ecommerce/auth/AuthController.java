package com.ecommerce.auth;

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
    public User register(@RequestBody RegisterRequest request) {
        return userService.register(request);
    }

//    @PostMapping("/login")
//    public AuthResponse login(@RequestBody LoginRequest request) {
//        String token = userService.login(request);
//        return new AuthResponse(token);
//    }

    @PostMapping("/login")
    public AuthResponse login(@RequestBody LoginRequest request) {
        User user = userService.loginUser(request); // return User object instead of just token
        String token = userService.generateToken(user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getFullName(), user.getRole());
    }

}
