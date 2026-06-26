package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.*;
import com.ecommerce.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final OrderRepository orderRepository;
    private final WishlistRepository wishlistRepository;
    private final SearchHistoryRepository searchHistoryRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public List<ProductDTO> getRecommendations(Long userId) {
        List<String> purchasedProducts = orderRepository.findByUserIdOrderByCreatedAtDesc(userId)
                .stream().limit(5).flatMap((Order o) -> o.getItems().stream())
                .map((OrderItem item) -> item.getProduct().getName()).distinct().collect(Collectors.toList());

        List<String> wishlistProducts = wishlistRepository.findByUserId(userId)
                .stream().map(w -> w.getProduct().getName()).collect(Collectors.toList());

        List<String> searchQueries = searchHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId)
                .stream().map(SearchHistory::getQuery).collect(Collectors.toList());

        List<Product> availableProducts = productRepository.findByActiveTrue()
                .stream().limit(25).toList();

        String productList = availableProducts.stream()
                .map(p -> p.getId() + ": " + p.getName())
                .collect(Collectors.joining(", "));

        String prompt = String.format("""
                        You are a smart e-commerce recommendation engine.
                        Analyze the user data below to pick exactly 4 distinct product IDs.
                                
                        User Context:
                        - Recently purchased: [%s]
                        - Wishlist items: [%s]
                        - Recent searches: [%s]
                                
                        Available catalog (ID:Name): %s
                                
                        STRICT BALANCING RULES:
                        1. Do NOT focus only on recent search queries. You MUST provide a balanced mix.
                        2. Pick at least 1-2 products related to the purchased items style/category, 1 product from wishlist category, and 1-2 from recent search colors/keywords.
                        3. Even if searches are dominated by one color, ensure the final 4 IDs represent different colors or categories based on the total context.
                        4. Output exactly 4 recommended product IDs as a plain comma-separated list inside square brackets, like [5,12,22,8]. No prose.
                        """,
                String.join(", ", purchasedProducts), String.join(", ", wishlistProducts), String.join(", ", searchQueries), productList
        );

        try {
            List<Map<String, String>> messages = List.of(Map.of("role", "user", "content", prompt));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 50);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(GROQ_URL, entity, Map.class);

            List choices = (List) response.getBody().get("choices");
            Map choice = (Map) choices.get(0);
            Map message = (Map) choice.get("message");
            String content = (String) message.get("content");

            if (content.contains("[") && content.contains("]")) {
                content = content.substring(content.indexOf("[") + 1, content.indexOf("]"));
            }
            content = content.replaceAll("[^0-9,]", "");

            List<Long> recommendedIds = Arrays.stream(content.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .map(Long::parseLong)
                    .collect(Collectors.toList());

            if (recommendedIds.isEmpty()) throw new RuntimeException("AI returned empty ID list");

            return productRepository.findAllById(recommendedIds)
                    .stream()
                    .map(productMapper::convertToDTO)
                    .collect(Collectors.toList());

        } catch (Exception e) {

            return productRepository.findByActiveTrue().stream()
                    .limit(4)
                    .map(productMapper::convertToDTO)
                    .collect(Collectors.toList());
        }
    }

    public void saveSearchHistory(Long userId, String query) {
        if (query == null || query.trim().isEmpty()) return;
        User user = new User();
        user.setId(userId);
        SearchHistory history = SearchHistory.builder()
                .user(user)
                .query(query.trim())
                .build();
        searchHistoryRepository.save(history);
    }
}