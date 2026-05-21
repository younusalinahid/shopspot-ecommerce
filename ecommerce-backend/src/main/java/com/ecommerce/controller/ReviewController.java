package com.ecommerce.controller;

import com.ecommerce.dto.ReviewDTO;
import com.ecommerce.dto.ReviewRequestDTO;
import com.ecommerce.service.ReviewService;
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

    @PostMapping("/user/reviews/product/{productId}")
    public ResponseEntity<ReviewDTO> addOrUpdateReview(
            @PathVariable Long productId,
            @RequestBody ReviewRequestDTO request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
                reviewService.addOrUpdateReview(productId, userDetails.getUsername(), request));
    }

    @GetMapping("/public/reviews/product/{productId}")
    public ResponseEntity<List<ReviewDTO>> getReviews(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getReviewsByProduct(productId));
    }

    @GetMapping("/public/reviews/product/{productId}/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@PathVariable Long productId) {
        return ResponseEntity.ok(reviewService.getProductRatingSummary(productId));
    }

    @DeleteMapping("/user/reviews/{reviewId}")
    public ResponseEntity<Void> deleteReview(
            @PathVariable Long reviewId,
            @AuthenticationPrincipal UserDetails userDetails) {
        reviewService.deleteReview(reviewId, userDetails.getUsername());
        return ResponseEntity.noContent().build();
    }
}