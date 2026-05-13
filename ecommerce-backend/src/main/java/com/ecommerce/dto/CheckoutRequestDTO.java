package com.ecommerce.dto;

import lombok.Data;

@Data
public class CheckoutRequestDTO {
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
    private String postalCode;
}