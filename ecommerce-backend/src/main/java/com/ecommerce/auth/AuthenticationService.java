package com.ecommerce.auth;

import com.ecommerce.config.JwtService;
import com.ecommerce.model.RefreshToken;
import com.ecommerce.model.User;
import com.ecommerce.model.type.Role;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final com.ecommerce.service.LoginAttemptService loginAttemptService;

    private static final java.util.regex.Pattern EMAIL_PATTERN =
            java.util.regex.Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");

    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        // Emails are stored lower-case so "A@x.com" and "a@x.com" cannot become two accounts
        String email = request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null;

        if (email == null || email.length() > 120 || !EMAIL_PATTERN.matcher(email).matches()) {
            throw new RuntimeException("A valid email is required");
        }
        if (request.getPassword() == null || request.getPassword().length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters");
        }
        if (request.getPassword().length() > 72) {
            throw new RuntimeException("Password must be at most 72 characters");
        }
        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new RuntimeException("Full name is required");
        }
        if (request.getFullName().trim().length() > 100) {
            throw new RuntimeException("Full name is too long");
        }
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new RuntimeException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .active(true)
                .build();

        user = userRepository.save(user);

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Transactional
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        loginAttemptService.checkNotLocked(email);

        User user = userRepository.findByEmailIgnoreCase(email).orElse(null);
        if (user == null || request.getPassword() == null
                || !passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            loginAttemptService.loginFailed(email);
            throw new RuntimeException("Invalid email or password");
        }
        loginAttemptService.loginSucceeded(email);

        if (!user.isActive()) {
            throw new RuntimeException("Your account has been deactivated.");
        }

        String accessToken = jwtService.generateToken(user);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();
    }

    @Transactional
    public AuthenticationResponse refresh(String refreshTokenValue) {
        RefreshToken newRefresh = refreshTokenService.verifyAndRotate(refreshTokenValue);
        User user = newRefresh.getUser();
        if (!user.isActive()) {
            refreshTokenService.revokeAllForUser(user);
            throw new RuntimeException("Your account has been deactivated.");
        }

        String newAccessToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefresh.getToken())
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .active(user.isActive())
                .build();
    }
}