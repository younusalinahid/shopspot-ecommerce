package com.ecommerce.model.type;

import jakarta.persistence.Embeddable;
import lombok.*;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShippingAddress {
    private String fullName;
    private String phone;
    private String addressLine;
    private String city;
    private String district;
    private String postalCode;
}