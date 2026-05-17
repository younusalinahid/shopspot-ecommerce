package com.ecommerce.controller;

import com.ecommerce.dto.ChangePasswordRequest;
import com.ecommerce.dto.UpdateProfileRequest;
import com.ecommerce.dto.UserProfileDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/user/profile")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<UserProfileDTO> getProfile(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(userService.getProfile(user.getId()));
    }

    @PutMapping
    public ResponseEntity<UserProfileDTO> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(userService.updateProfile(user.getId(), request));
    }

    @PutMapping("/image")
    public ResponseEntity<UserProfileDTO> updateImage(
            @AuthenticationPrincipal User user,
            @RequestParam("imageFile") MultipartFile imageFile) throws Exception {
        return ResponseEntity.ok(userService.updateProfileImage(user.getId(), imageFile));
    }

    @PutMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal User user,
            @RequestBody ChangePasswordRequest request) {
        userService.changePassword(user.getId(), request);
        return ResponseEntity.ok().build();
    }
}