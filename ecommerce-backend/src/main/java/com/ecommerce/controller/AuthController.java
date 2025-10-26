//package com.ecommerce.controller;
//
//
//import com.ecommerce.auth.RegisterRequest;
//import com.ecommerce.model.RefreshToken;
//import com.ecommerce.model.User;
//import com.ecommerce.service.RefreshTokenService;
//import com.ecommerce.service.UserService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/auth")
//@CrossOrigin(origins = {"http://localhost:3000"})
//public class AuthController {
//
//    @Autowired
//    private UserService userService;
//
//    @Autowired
//    private RefreshTokenService refreshTokenService;
//
//    @PostMapping("/register")
//    public AuthResponse register(@RequestBody RegisterRequest request) {
//        User user = userService.register(request);
//        String accessToken = userService.generateToken(user.getEmail());
//
//        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
//
//        return new AuthResponse(
//                accessToken,
//                refreshToken.getToken(),
//                user.getEmail(),
//                user.getFullName(),
//                user.getRole().toString(),
//                user.getId()  // ✅ Include user ID
//        );
//    }
//
//    @PostMapping("/login")
//    public AuthResponse login(@RequestBody LoginRequest request) {
//        User user = userService.loginUser(request);
//        String accessToken = userService.generateToken(user.getEmail());
//
//        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user.getEmail());
//
//        return new AuthResponse(
//                accessToken,
//                refreshToken.getToken(),
//                user.getEmail(),
//                user.getFullName(),
//                user.getRole().toString(),
//                user.getId()  // ✅ Include user ID
//        );
//    }
//
//    @PostMapping("/refresh")
//    public ResponseEntity<?> refreshToken(@RequestBody RefreshTokenRequest request) {
//        String requestRefreshToken = request.getRefreshToken();
//
//        return refreshTokenService.findByToken(requestRefreshToken)
//                .map(refreshTokenService::verifyExpiration)
//                .map(RefreshToken::getUser)
//                .map(user -> {
//                    String newAccessToken = userService.generateToken(user.getEmail());
//                    return ResponseEntity.ok(new AuthResponse(
//                            newAccessToken,
//                            requestRefreshToken,
//                            user.getEmail(),
//                            user.getFullName(),
//                            user.getRole().toString(),
//                            user.getId()  // ✅ Include user ID
//                    ));
//                })
//                .orElseThrow(() -> new RuntimeException("Refresh token not found"));
//    }
//
//    @PostMapping("/logout")
//    public ResponseEntity<?> logout(@RequestBody RefreshTokenRequest request) {
//        refreshTokenService.findByToken(request.getRefreshToken())
//                .ifPresent(token -> refreshTokenService.deleteByUser(token.getUser()));
//        return ResponseEntity.ok("Logged out successfully");
//    }
//}