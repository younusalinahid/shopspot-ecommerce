package com.ecommerce.service;

import com.ecommerce.dto.ReviewDTO;
import com.ecommerce.dto.ReviewRequestDTO;
import com.ecommerce.model.Product;
import com.ecommerce.model.Review;
import com.ecommerce.model.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.repository.ReviewRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ReviewDTO addOrUpdateReview(Long productId, String userEmail, ReviewRequestDTO request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Review review = reviewRepository.findByUserIdAndProductId(user.getId(), productId)
                .orElse(Review.builder().user(user).product(product).build());

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        return toDTO(reviewRepository.save(review));
    }

    public List<ReviewDTO> getReviewsByProduct(Long productId) {
        return reviewRepository.findByProductIdOrderByCreatedAtDesc(productId)
                .stream().map(this::toDTO).toList();
    }

    public Map<String, Object> getProductRatingSummary(Long productId) {
        Double avg = reviewRepository.findAverageRatingByProductId(productId);
        long count = reviewRepository.countByProductId(productId);
        return Map.of(
                "averageRating", avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0,
                "totalReviews", count
        );
    }

    public void deleteReview(Long reviewId, String userEmail) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        if (!review.getUser().getEmail().equals(userEmail)) {
            throw new RuntimeException("Unauthorized");
        }
        reviewRepository.delete(review);
    }

    private ReviewDTO toDTO(Review review) {
        ReviewDTO dto = new ReviewDTO();
        dto.setId(review.getId());
        dto.setUserFullName(review.getUser().getFullName());
        dto.setRating(review.getRating());
        dto.setComment(review.getComment());
        dto.setCreatedAt(DateTimeFormatter.ofPattern("dd MMM yyyy")
                .withZone(ZoneId.of("Asia/Dhaka"))
                .format(review.getCreatedAt()));
        return dto;
    }
}