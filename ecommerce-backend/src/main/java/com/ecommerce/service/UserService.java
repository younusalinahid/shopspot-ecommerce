package com.ecommerce.service;

import com.ecommerce.auth.LoginRequest;
import com.ecommerce.auth.RegisterRequest;
import com.ecommerce.config.JwtTokenUtil;
import com.ecommerce.model.User;
import com.ecommerce.model.type.Role;
import com.ecommerce.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    public User register(RegisterRequest request) {
        System.out.println("Password: " + request.getPassword());
        System.out.println("Confirm Password: " + request.getConfirmPassword());

        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Password and Confirm Password do not match");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        User user = new User();
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.USER); // default
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        return jwtTokenUtil.generateToken(request.getEmail());
    }

    public User loginUser(LoginRequest request) {
        Optional<User> optionalUser = userRepository.findByEmail(request.getEmail());
        System.out.println("");
        if (optionalUser.isEmpty()) {
            throw new RuntimeException("Invalid email or password");
        }

        User user = optionalUser.get();
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtTokenUtil.generateToken(user.getEmail());

        return user; // return full User object (email, fullName, role)
    }

    // Example: generateToken method
    public String generateToken(String email) {
        return jwtTokenUtil.generateToken(email);
    }
}
