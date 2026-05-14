package com.ecommerce.dto;

import lombok.Builder;
import lombok.Getter;
import java.time.Instant;

@Getter
@Builder
public class AddressResponseDTO {
    private Long    id;
    private String  fullName;
    private String  phone;
    private String  addressLine;
    private String  area;
    private String  city;
    private String  district;
    private String  postalCode;
    private Boolean isDefault;
    private Instant createdAt;
}