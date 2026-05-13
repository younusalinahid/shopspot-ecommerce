package com.ecommerce.controller;

import com.ecommerce.dto.AddressRequestDTO;
import com.ecommerce.service.AddressService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/addresses")
@CrossOrigin(origins = "http://localhost:3000")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @PostMapping
    public ResponseEntity<?> addAddress(
            @RequestBody AddressRequestDTO addressRequestDTO,
            Authentication authentication
    ) {
        String email = authentication.getName();
        return ResponseEntity.ok(
                addressService.saveAddress(addressRequestDTO, email)
        );
    }

    @GetMapping
    public ResponseEntity<?> getAddresses(
            Authentication authentication
    ) {

        String email = authentication.getName();
        return ResponseEntity.ok(
                addressService.getUserAddresses(email)
        );
    }
}
