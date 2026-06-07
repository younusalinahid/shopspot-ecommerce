package com.ecommerce.controller.admin;

import com.ecommerce.dto.UserProfileDTO;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<UserProfileDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsersAsDTO());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfileDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getProfile(id));
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}