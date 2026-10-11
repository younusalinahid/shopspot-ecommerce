package com.ecommerce.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CheckoutRequestDTO {

    private Long addressId;
    private String  fullName;
    private String  phone;
    private String  addressLine;
    private String  area;
    private String  city;
    private String  district;
    private String  postalCode;
    private Boolean saveAddress = false;
    private String paymentMethod = "CARD";

}