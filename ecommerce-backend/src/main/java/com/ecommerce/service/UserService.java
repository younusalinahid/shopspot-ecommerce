package com.ecommerce.service;

import com.ecommerce.dto.ChangePasswordRequest;
import com.ecommerce.dto.UpdateProfileRequest;
import com.ecommerce.dto.UserProfileDTO;
import com.ecommerce.model.User;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.ecommerce.repository.OrderRepository orderRepository;
    private final com.ecommerce.repository.RefreshTokenRepository refreshTokenRepository;
    private final com.ecommerce.repository.SearchHistoryRepository searchHistoryRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        if (user.getRole() == com.ecommerce.model.type.Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be deleted");
        }
        long orderCount = orderRepository.countByUserId(id);
        if (orderCount > 0) {
            // Deleting would also delete the orders (cascade) and change sales history
            throw new RuntimeException("This customer has " + orderCount
                    + " order(s). Deactivate the account instead of deleting it.");
        }
        refreshTokenRepository.deleteAllByUser(user);
        searchHistoryRepository.deleteAllByUserId(id);
        userRepository.delete(user);
    }

    public UserProfileDTO getProfile(Long userId) {
        return toDTO(getUserById(userId));
    }

    public UserProfileDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        if (request.getFullName() != null) {
            String name = request.getFullName().trim();
            if (name.isEmpty() || name.length() > 100) throw new RuntimeException("Full name must be 1 to 100 characters");
            user.setFullName(name);
        }
        if (request.getPhone() != null) {
            if (request.getPhone().length() > 20) throw new RuntimeException("Phone number is too long");
            user.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            if (request.getAddress().length() > 255) throw new RuntimeException("Address is too long");
            user.setAddress(request.getAddress().trim());
        }
        return toDTO(userRepository.save(user));
    }

    public UserProfileDTO updateProfileImage(Long userId, MultipartFile imageFile) throws IOException {
        User user = getUserById(userId);
        user.setProfileImage(com.ecommerce.util.ImageValidator.readImage(imageFile, 2L * 1024 * 1024));
        return toDTO(userRepository.save(user));
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserById(userId);
        if (request.getCurrentPassword() == null
                || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        String newPassword = request.getNewPassword();
        if (newPassword == null || newPassword.length() < 6 || newPassword.length() > 72) {
            throw new RuntimeException("New password must be 6 to 72 characters");
        }
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new RuntimeException("New password must be different from the current one");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        // Sign out other devices that might know the old password
        refreshTokenRepository.revokeAllByUser(user);
    }

    private UserProfileDTO toDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setActive(user.isActive());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getProfileImage() != null) {
            dto.setProfileImage(Base64.getEncoder().encodeToString(user.getProfileImage()));
        }
        return dto;
    }

    public List<UserProfileDTO> getAllUsersAsDTO() {
        return userRepository.findAll()
                .stream()
                .map(this::toDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public void toggleUserStatus(Long id) {
        User user = getUserById(id);
        if (user.getRole() == com.ecommerce.model.type.Role.ADMIN) {
            throw new RuntimeException("Admin accounts cannot be deactivated");
        }
        user.setActive(!user.isActive());
        userRepository.save(user);
        if (!user.isActive()) {
            // Sign the customer out everywhere
            refreshTokenRepository.revokeAllByUser(user);
        }
    }
}