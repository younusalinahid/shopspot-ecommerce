package com.ecommerce.ecom_backend.config;

import com.ecommerce.ecom_backend.model.User;
import com.ecommerce.ecom_backend.model.type.Role;
import com.ecommerce.ecom_backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class AdminDataLoader implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminDataLoader.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // Manual Constructor
    public AdminDataLoader(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createAdminIfNotExists();
    }

    private void createAdminIfNotExists() {
        String adminEmail = "admin@clothing.com";

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setFullName("Admin User");
            admin.setPhoneNumber("01700000000");
            admin.setRoles(Set.of(Role.ADMIN, Role.USER));
            admin.setActive(true);

            userRepository.save(admin);
            log.info("✅ Admin user created successfully!");
            log.info("📧 Email: {}", adminEmail);
            log.info("🔑 Password: Admin@123");
            log.info("⚠️  Please change the password after first login!");
        } else {
            log.info("ℹ️  Admin user already exists");
        }
    }
}