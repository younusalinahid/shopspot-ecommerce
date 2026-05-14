package com.ecommerce.controller;

import com.ecommerce.dto.AddressRequestDTO;
import com.ecommerce.dto.AddressResponseDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('USER', 'ADMIN')")
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public ResponseEntity<List<AddressResponseDTO>> getMyAddresses(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(addressService.getUserAddresses(user.getId()));
    }

    @PostMapping
    public ResponseEntity<AddressResponseDTO> addAddress(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody AddressRequestDTO request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(addressService.addAddress(user.getId(), request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AddressResponseDTO> updateAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequestDTO request) {
        return ResponseEntity.ok(addressService.updateAddress(user.getId(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAddress(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        addressService.deleteAddress(user.getId(), id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/default")
    public ResponseEntity<AddressResponseDTO> setDefault(
            @AuthenticationPrincipal User user,
            @PathVariable Long id) {
        return ResponseEntity.ok(addressService.setDefault(user.getId(), id));
    }
}