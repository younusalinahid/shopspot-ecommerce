package com.ecommerce;

import com.ecommerce.model.User;
import com.ecommerce.model.type.Role;
import com.ecommerce.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
public class AdminDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminDataLoader.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:admin@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    public AdminDataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        if (!userRepository.existsByEmail(adminEmail)) {
            if (adminPassword == null || adminPassword.isBlank()) {
                log.warn("ADMIN_PASSWORD is not set; skipping default admin creation");
                return;
            }

            User admin = new User();
            admin.setFullName("Admin User");
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole(Role.ADMIN);
            admin.setActive(true);

            userRepository.save(admin);
            log.info("✅ Admin user created successfully");
        } else {
            log.info("ℹ️  Admin user already exists");
        }
    }
}