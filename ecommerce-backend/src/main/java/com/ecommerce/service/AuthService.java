//package com.ecommerce.service;
//
//import com.ecommerce.config.JwtService;
//import com.ecommerce.mapper.UserMapper;
//import com.ecommerce.model.User;
//import com.ecommerce.repository.UserRepository;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.crypto.password.PasswordEncoder;
//import org.springframework.stereotype.Service;
//
//
//@Service
//public class AuthService {
//
//    private final UserRepository userRepository;
//    private final UserMapper userMapper;
//    private final PasswordEncoder passwordEncoder;
//    private final JwtService jwtService;
//
//    public AuthService(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder, JwtService jwtService) {
//        this.userRepository = userRepository;
//        this.userMapper = userMapper;
//        this.passwordEncoder = passwordEncoder;
//        this.jwtService = jwtService;
//    }
//
//    public User register(RegisterRequest request) {
//        if (!request.getPassword().equals(request.getConfirmPassword())) {
//            throw new IllegalArgumentException("Passwords do not match");
//        }
//
//        if (userRepository.existsByEmail(request.getEmail())) {
//            throw new IllegalArgumentException("Email already exists");
//        }
//
//        User user = userMapper.toEntity(request);
//        user.setPassword(passwordEncoder.encode(request.getPassword()));
//        return userRepository.save(user);
//    }
//
//    public User login(String email, String password) {
//        User user = userRepository.findByEmail(email)
//                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
//
//        if (!passwordEncoder.matches(password, user.getPassword())) {
//            throw new IllegalArgumentException("Invalid email or password");
//        }
//
//        return user;
//    }
//
//    public String adminLogin(String email, String password) {
//        // Fixed credentials
//        if (!email.equals("admin@gmail.com") || !password.equals("123456")) {
//            throw new IllegalArgumentException("Invalid credentials");
//        }
//
//        // Create Spring Security UserDetails object for token
//        UserDetails userDetails = org.springframework.security.core.userdetails.User.builder()
//                .username(email)
//                .password(password) // password not important here
//                .authorities(new SimpleGrantedAuthority("ROLE_ADMIN"))
//                .build();
//
//        // Generate JWT token
//        return jwtService.generateToken(userDetails);
//    }
//}
//
//
