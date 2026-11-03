package com.ecommerce.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class GuestCheckoutRequestDTO {

    private String email;
    private String fullName;
    private String phone;
    private String addressLine;
    private String area;
    private String city;
    private String district;
    private String postalCode;
    private String paymentMethod = "COD";
    private String couponCode;
    private List<Item> items;

    @Getter
    @Setter
    public static class Item {
        private Long productId;
        private Integer quantity;
        private String size;
        private String color;
    }
}
