package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ImageSearchService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${app.backend.url:http://localhost:8080}")
    private String backendUrl;

    private final ProductRepository productRepository;
    private final ProductMapper     productMapper;
    private final RestTemplate      restTemplate = new RestTemplate();

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    @Transactional(readOnly = true)
    public List<ProductDTO> searchByImage(MultipartFile imageFile) throws Exception {
        byte[] bytes    = imageFile.getBytes();
        String base64   = Base64.getEncoder().encodeToString(bytes);
        imageFile.getContentType();
        String mimeType = imageFile.getContentType();
        String dataUrl  = "data:" + mimeType + ";base64," + base64;

        String description = analyzeImageWithOpenRouter(dataUrl);
        return searchProductsByDescription(description);
    }

    private String analyzeImageWithOpenRouter(String dataUrl) {
        try {
            List<Map<String, Object>> content = new ArrayList<>();
            content.add(Map.of(
                    "type", "image_url",
                    "image_url", Map.of("url", dataUrl)
            ));
            content.add(Map.of(
                    "type", "text",
                    "text", """
                        Analyze this product image for an e-commerce search engine.
                        Return ONLY a comma-separated list of 3-5 search keywords.
                        Focus on: product type, color, material, style, gender.
                        Example output: "blue cotton t-shirt, casual wear, men"
                        Do NOT write sentences. Only keywords separated by commas.
                    """
            ));

            Map<String, Object> userMessage = Map.of(
                    "role", "user",
                    "content", content
            );

            Map<String, Object> body = new HashMap<>();
            body.put("model", "google/gemini-2.5-flash");
            body.put("messages", List.of(userMessage));
            body.put("max_tokens", 100);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey.trim());

            headers.set("HTTP-Referer", backendUrl);
            headers.set("X-Title", "ShopSpot ECommerce");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    OPENROUTER_URL,
                    entity,
                    Map.class
            );

            List choices = (List) response.getBody().get("choices");
            Map choice  = (Map) choices.get(0);
            Map msg     = (Map) choice.get("message");
            return (String) msg.get("content");

        } catch (Exception e) {
            return "";
        }
    }

    public List<ProductDTO> searchProductsByDescription(String description) {
        if (description == null || description.isBlank()) return List.of();
        List<String> mainPhrases = Arrays.stream(description.toLowerCase().split(","))
                .map(String::trim)
                .filter(phrase -> phrase.length() > 2)
                .collect(Collectors.toList());

        List<String> individualWords = Arrays.stream(description.toLowerCase().replaceAll("[^a-z0-9\\s]", "").split("\\s+"))
                .filter(word -> word.length() > 2)
                .collect(Collectors.toList());

        List<com.ecommerce.model.Product> allProducts = productRepository.findByActiveTrue();
        Map<com.ecommerce.model.Product, Long> scores = new LinkedHashMap<>();

        for (com.ecommerce.model.Product p : allProducts) {
            String searchable = (
                    (p.getName()        != null ? p.getName()        : "") + " " +
                            (p.getDescription() != null ? p.getDescription() : "") + " " +
                            (p.getSubCategory() != null ? p.getSubCategory().getName() : "")
            ).toLowerCase();

            long score = 0;

            for (String phrase : mainPhrases) {
                if (searchable.contains(phrase)) {
                    score += 5;
                }
            }

            for (String word : individualWords) {
                if (searchable.contains(word)) {
                    score += 1;
                }
            }

            if (score > 0) {
                scores.put(p, score);
            }
        }

        return scores.entrySet().stream()
                .sorted(Map.Entry.<com.ecommerce.model.Product, Long>comparingByValue().reversed())
                .limit(8)
                .map(e -> productMapper.convertToDTO(e.getKey()))
                .collect(Collectors.toList());
    }
}