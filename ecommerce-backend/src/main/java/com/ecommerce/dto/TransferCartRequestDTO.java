package com.ecommerce.dto;

import lombok.Data;

@Data
public class TransferCartRequestDTO {
    private String guestUserId;
    private String loggedInUserId;
}