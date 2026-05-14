package com.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequestDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^01[3-9]\\d{8}$", message = "Invalid BD phone number")
    private String phone;

    @NotBlank(message = "Address is required")
    private String addressLine;

    @NotBlank(message = "Area is required")
    private String area;

    @NotBlank(message = "City is required")
    private String city;

    private String district;
    private String postalCode;
    private Boolean isDefault = false;
}