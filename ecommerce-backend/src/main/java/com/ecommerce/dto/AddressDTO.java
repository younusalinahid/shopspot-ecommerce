package com.ecommerce.dto;

import lombok.Data;

@Data
public class AddressDTO {

    private String fullName;
    private String city;
    private String country;
    private String pinCode;
    private String state;
    private String area;
    private String buildingName;
}
