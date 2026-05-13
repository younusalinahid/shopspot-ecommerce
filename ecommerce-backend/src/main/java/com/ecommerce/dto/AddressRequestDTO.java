package com.ecommerce.dto;

import lombok.Data;

@Data
public class AddressRequestDTO {

    private String fullName;
    private String phone;
    private String city;
    private String area;
    private String addressLine;
}