package com.ecommerce.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class SentimentResultDTO {
    private String       sentiment;
    private int          score;
    private List<String> pros;
    private List<String> cons;
    private String       summary;
    private String       recommendation;
    private int          totalReviews;
}