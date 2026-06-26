package com.ecommerce.controller;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.model.User;
import com.ecommerce.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user/recommendations")
@RequiredArgsConstructor
public class RecommendationController {

    private final RecommendationService recommendationService;

    @GetMapping
    public ResponseEntity<List<ProductDTO>> getRecommendations(
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(recommendationService.getRecommendations(user.getId()));
    }

    @PostMapping("/api/user/search-history")
    public ResponseEntity<Void> saveSearch(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal User user) {
        recommendationService.saveSearchHistory(user.getId(), body.get("query"));
        return ResponseEntity.ok().build();
    }
}