package com.ecommerce.service;

import com.ecommerce.dto.SentimentResultDTO;
import com.ecommerce.model.Review;
import com.ecommerce.repository.ReviewRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SentimentAnalysisService {

    @Value("${groq.api.key}")
    private String apiKey;

    private final ReviewRepository reviewRepository;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GROQ_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    public SentimentResultDTO analyzeProductReviews(Long productId) {
        List<Review> reviews = reviewRepository
                .findByProductIdOrderByCreatedAtDesc(productId);

        if (reviews.isEmpty()) {
            return SentimentResultDTO.builder()
                    .sentiment("NEUTRAL")
                    .score(0)
                    .pros(List.of())
                    .cons(List.of())
                    .summary("No reviews yet to analyze.")
                    .recommendation("Be the first to review this product!")
                    .totalReviews(0)
                    .build();
        }

        String reviewsText = reviews.stream()
                .map(r -> String.format("Rating: %d/5 | Comment: %s",
                        r.getRating(),
                        r.getComment() != null ? r.getComment() : "(no comment)"))
                .collect(Collectors.joining("\n"));

        return callGroqForSentiment(reviewsText, reviews.size());
    }

    private SentimentResultDTO callGroqForSentiment(String reviewsText, int totalReviews) {
        try {
            String prompt = String.format("""
                    You are a strict JSON generator and e-commerce sentiment analyst.
                    Analyze the following product reviews. The reviews can be in English, Bengali, or a mix.
                    Understand the actual meaning and extract the real pros and cons based ONLY on the provided text.
                        
                    CRITICAL:
                    - If there are NO negative aspects mentioned in the reviews, the "cons" array MUST be completely empty: []. Do NOT invent or hallucinate cons like "High price" unless explicitly stated.
                    - Your response must ALWAYS be written in ENGLISH only.
                    - Do NOT include any markdown blocks like ```json, no explanations, no text outside the JSON.
                        
                    Reviews:
                    %s
                        
                    Strictly follow this JSON structure:
                    {
                      "sentiment": "POSITIVE" or "NEGATIVE" or "MIXED",
                      "score": (number 0-100, actual percentage based on ratings and content),
                      "pros": ["Actual Pro 1", "Actual Pro 2"],
                      "cons": ["Actual Con 1"] or [],
                      "summary": "Provide a 2-sentence overall summary strictly in English based ONLY on the text.",
                      "recommendation": "Provide a 1-sentence buy recommendation strictly in English."
                    }
                    """, reviewsText);

            Map<String, Object> message = Map.of(
                    "role", "user",
                    "content", prompt
            );

            Map<String, Object> body = new HashMap<>();
            body.put("model", "llama-3.1-8b-instant");
            body.put("messages", List.of(message));
            body.put("max_tokens", 1000);
            body.put("temperature", 0.1);
            body.put("response_format", Map.of("type", "json_object"));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey.trim());

            ResponseEntity<String> response = restTemplate.postForEntity(
                    GROQ_URL,
                    new HttpEntity<>(body, headers),
                    String.class
            );

            Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
            List choices = (List) responseMap.get("choices");
            Map choice = (Map) choices.get(0);
            Map msg = (Map) choice.get("message");
            String json = (String) msg.get("content");

            if (json != null) {
                json = json.trim();
                if (json.startsWith("[")) {
                    List<Map> arrayResult = objectMapper.readValue(json, List.class);
                    if (!arrayResult.isEmpty()) {
                        return buildDTO(arrayResult.get(0), totalReviews);
                    }
                }
            }

            Map<String, Object> result = objectMapper.readValue(json, Map.class);
            return buildDTO(result, totalReviews);

        } catch (Exception e) {
            log.error("Sentiment analysis error: {}", e.getMessage(), e);
            return SentimentResultDTO.builder()
                    .sentiment("NEUTRAL")
                    .score(0)
                    .pros(List.of())
                    .cons(List.of())
                    .summary("Analysis unavailable at this time due to response formatting.")
                    .recommendation("Check the manual user reviews below.")
                    .totalReviews(totalReviews)
                    .build();
        }
    }

    private SentimentResultDTO buildDTO(Map<String, Object> result, int totalReviews) {
        return SentimentResultDTO.builder()
                .sentiment((String) result.get("sentiment"))
                .score(((Number) result.get("score")).intValue())
                .pros((List<String>) result.get("pros"))
                .cons((List<String>) result.get("cons"))
                .summary((String) result.get("summary"))
                .recommendation((String) result.get("recommendation"))
                .totalReviews(totalReviews)
                .build();
    }
}