package com.ecommerce.service;

import com.ecommerce.dto.AddressRequestDTO;
import com.ecommerce.dto.AddressResponseDTO;
import com.ecommerce.model.Address;
import com.ecommerce.model.User;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository    userRepository;

    public List<AddressResponseDTO> getUserAddresses(Long userId) {
        return addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public AddressResponseDTO addAddress(Long userId, AddressRequestDTO req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.clearDefaultByUserId(userId);
        }

        boolean isFirst = addressRepository
                .findByUserIdOrderByIsDefaultDescCreatedAtDesc(userId).isEmpty();

        Address address = Address.builder()
                .fullName(req.getFullName())
                .phone(req.getPhone())
                .addressLine(req.getAddressLine())
                .area(req.getArea())
                .city(req.getCity())
                .district(req.getDistrict())
                .postalCode(req.getPostalCode())
                .isDefault(isFirst || Boolean.TRUE.equals(req.getIsDefault()))
                .user(user)
                .build();

        return toDTO(addressRepository.save(address));
    }

    public AddressResponseDTO updateAddress(Long userId, Long addressId, AddressRequestDTO req) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));

        if (Boolean.TRUE.equals(req.getIsDefault())) {
            addressRepository.clearDefaultByUserId(userId);
        }

        address.setFullName(req.getFullName());
        address.setPhone(req.getPhone());
        address.setAddressLine(req.getAddressLine());
        address.setArea(req.getArea());
        address.setCity(req.getCity());
        address.setDistrict(req.getDistrict());
        address.setPostalCode(req.getPostalCode());
        address.setIsDefault(Boolean.TRUE.equals(req.getIsDefault()));

        return toDTO(addressRepository.save(address));
    }

    public void deleteAddress(Long userId, Long addressId) {
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        addressRepository.delete(address);
    }

    public AddressResponseDTO setDefault(Long userId, Long addressId) {
        addressRepository.clearDefaultByUserId(userId);
        Address address = addressRepository.findByIdAndUserId(addressId, userId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        address.setIsDefault(true);
        return toDTO(addressRepository.save(address));
    }

    private AddressResponseDTO toDTO(Address a) {
        return AddressResponseDTO.builder()
                .id(a.getId())
                .fullName(a.getFullName())
                .phone(a.getPhone())
                .addressLine(a.getAddressLine())
                .area(a.getArea())
                .city(a.getCity())
                .district(a.getDistrict())
                .postalCode(a.getPostalCode())
                .isDefault(a.getIsDefault())
                .createdAt(a.getCreatedAt())
                .build();
    }
}