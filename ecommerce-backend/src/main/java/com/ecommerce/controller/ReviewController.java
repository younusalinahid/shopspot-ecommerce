package com.ecommerce.controller;

import com.ecommerce.dto.ReviewDTO;
import com.ecommerce.dto.ReviewRequestDTO;
import com.ecommerce.dto.SentimentResultDTO;
import com.ecommerce.service.ReviewService;
import com.ecommerce.service.SentimentAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final SentimentAnalysisService sentimentService;

    @PostMapping("/user/reviews/product/{productId}")
    public ResponseEntity<ReviewDTO> addOrUpdateReview(
            @PathVariable(name = "productId") Long productId,
            @RequestBody ReviewRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reviewService.addOrUpdateReview(
                        productId, userDetails.getUsername(), request));
    }

    @GetMapping("/public/reviews/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviews(
            @PathVariable(name = "productId") Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/public/reviews/product/{productId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(
            @PathVariable(name = "productId") Long productId) {
        return ResponseEntity.ok(reviewService.getProductRatingSummary(productId));
    }

    @DeleteMapping("/user/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable(name = "reviewId") Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/user/reviews/product/{productId}/can-review")
    public ResponseEntity<Map<String, Boolean>> canReview(
            @PathVariable(name = "productId") Long productId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean canReview = reviewService.canUserReview(
                productId, userDetails.getUsername());
        return ResponseEntity.ok(Map.of("canReview", canReview));
    }

    @GetMapping("/public/reviews/product/{productId}/sentiment")
    public ResponseEntity<SentimentResultDTO> getSentiment(
            @PathVariable(name = "productId") Long productId) {
        return ResponseEntity.ok(
                sentimentService.analyzeProductReviews(productId));
    }
}