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

    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    public UserProfileDTO getProfile(Long userId) {
        return toDTO(getUserById(userId));
    }

    public UserProfileDTO updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserById(userId);
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAddress() != null) user.setAddress(request.getAddress());
        return toDTO(userRepository.save(user));
    }

    public UserProfileDTO updateProfileImage(Long userId, MultipartFile imageFile) throws IOException {
        User user = getUserById(userId);
        user.setProfileImage(imageFile.getBytes());
        return toDTO(userRepository.save(user));
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserById(userId);
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    private UserProfileDTO toDTO(User user) {
        UserProfileDTO dto = new UserProfileDTO();
        dto.setId(user.getId());
        dto.setFullName(user.getFullName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setAddress(user.getAddress());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        if (user.getProfileImage() != null) {
            dto.setProfileImage(Base64.getEncoder().encodeToString(user.getProfileImage()));
        }
        return dto;
    }
}