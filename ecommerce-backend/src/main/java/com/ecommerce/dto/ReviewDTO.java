package com.ecommerce.dto;

import lombok.Data;

@Data
public class ReviewDTO {
    private Long id;
    private String userFullName;
    private int rating;
    private String comment;
    private String createdAt;
}