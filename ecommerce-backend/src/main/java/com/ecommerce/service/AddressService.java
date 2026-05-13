package com.ecommerce.service;

import com.ecommerce.model.Address;
import com.ecommerce.model.User;
import com.ecommerce.repository.AddressRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.ecommerce.dto.AddressRequestDTO;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    public Address saveAddress(
            AddressRequestDTO addressRequestDTO,
            String email
    ) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Address address = new Address();

        address.setFullName(addressRequestDTO.getFullName());
        address.setPhone(addressRequestDTO.getPhone());
        address.setCity(addressRequestDTO.getCity());
        address.setArea(addressRequestDTO.getArea());
        address.setAddressLine(addressRequestDTO.getAddressLine());

        address.setUser(user);

        return addressRepository.save(address);
    }

    public List<Address> getUserAddresses(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return addressRepository.findByUserId(user.getId());
    }
}
