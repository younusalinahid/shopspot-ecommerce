package com.ecommerce.service;

import com.ecommerce.dto.ProductDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Product;
import com.ecommerce.repository.ProductRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ProductMapper productMapper;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

    public Map<String, Object> searchByImageWithKeywords(MultipartFile imageFile) throws Exception {
        byte[] bytes = imageFile.getBytes();
        String base64 = Base64.getEncoder().encodeToString(bytes);
        String mimeType = imageFile.getContentType() != null ? imageFile.getContentType() : "image/jpeg";
        String dataUrl = "data:" + mimeType + ";base64," + base64;

        JsonNode metadata = extractMetadataWithAI(dataUrl);
        log.info("🤖 AI Structured Attributes: {}", metadata.toString());

        List<ProductDTO> products = searchProductsByMetadata(metadata);

        String summary = String.format("%s %s %s %s",
                metadata.path("targetGroup").asText(""),
                metadata.path("color").asText(""),
                metadata.path("itemType").asText(""),
                metadata.path("category").asText("")
        ).replaceAll("\\s+", " ").trim();

        Map<String, Object> response = new HashMap<>();
        response.put("products", products);
        response.put("count", products.size());
        response.put("keywords", summary.isEmpty() ? "Visual Search Match" : summary);
        return response;
    }

    private JsonNode extractMetadataWithAI(String dataUrl) {
        try {
            List<Map<String, Object>> content = new ArrayList<>();
            content.add(Map.of("type", "image_url", "image_url", Map.of("url", dataUrl)));
            content.add(Map.of(
                    "type", "text",
                    "text", """
                        Analyze this clothing or product image.
                        Return ONLY a valid JSON object without markdown formatting:
                        {
                          "targetGroup": "women" or "men" or "kids" or "unisex",
                          "category": "clothing" or "footwear" or "accessories" or "bags",
                          "itemType": "sharara" or "three piece" or "salwar kameez" or "suit" or "gown" or "dress" or "saree",
                          "color": "green" or "red" or "blue" or "black" etc,
                          "tags": ["embroidered", "party wear", "georgette", "silk"]
                        }
                    """
            ));

            Map<String, Object> userMessage = Map.of("role", "user", "content", content);
            Map<String, Object> body = new HashMap<>();
            body.put("model", "google/gemini-2.5-flash");
            body.put("messages", List.of(userMessage));
            body.put("max_tokens", 150);

            String cleanApiKey = (apiKey != null) ? apiKey.replaceAll("[\"'\\s]", "") : "";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + cleanApiKey);
            headers.set("HTTP-Referer", backendUrl);
            headers.set("X-Title", "ShopSpot ECommerce");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            ResponseEntity<Map> response = restTemplate.postForEntity(OPENROUTER_URL, entity, Map.class);

            if (response.getBody() != null && response.getBody().containsKey("choices")) {
                List choices = (List) response.getBody().get("choices");
                if (choices != null && !choices.isEmpty()) {
                    Map choice = (Map) choices.get(0);
                    Map msg = (Map) choice.get("message");
                    String text = (String) msg.get("content");
                    if (text != null) {
                        String cleanJson = text.replaceAll("```json", "").replaceAll("```", "").trim();
                        return objectMapper.readTree(cleanJson);
                    }
                }
            }
        } catch (Exception e) {
            log.error("❌ AI Detection Error: ", e);
        }
        return objectMapper.createObjectNode();
    }

    @Transactional(readOnly = true)
    public List<ProductDTO> searchProductsByMetadata(JsonNode meta) {
        String targetGroup = meta.path("targetGroup").asText("").toLowerCase().trim();
        String category = meta.path("category").asText("").toLowerCase().trim();
        String itemType = meta.path("itemType").asText("").toLowerCase().trim();
        String color = meta.path("color").asText("").toLowerCase().trim();

        List<Product> allProducts = productRepository.findByActiveTrue();
        Map<Product, Long> scores = new HashMap<>();

        for (Product p : allProducts) {
            String name = p.getName() != null ? p.getName().toLowerCase() : "";
            String desc = p.getDescription() != null ? p.getDescription().toLowerCase() : "";
            String subCat = (p.getSubCategory() != null && p.getSubCategory().getName() != null) ? p.getSubCategory().getName().toLowerCase() : "";
            String mainCat = (p.getSubCategory() != null && p.getSubCategory().getCategory() != null && p.getSubCategory().getCategory().getName() != null) ? p.getSubCategory().getCategory().getName().toLowerCase() : "";

            String fullText = name + " " + desc + " " + subCat + " " + mainCat;

            if (targetGroup.equals("women") && (fullText.contains("men") || fullText.contains("panjabi")) && !fullText.contains("women")) {
                continue;
            }
            if (targetGroup.equals("men") && (fullText.contains("women") || fullText.contains("saree") || fullText.contains("sharara")) && !fullText.contains("men")) {
                continue;
            }

            long score = 0;

            if (!itemType.isEmpty() && fullText.contains(itemType)) {
                score += 300;
            }

            if (!color.isEmpty() && fullText.contains(color)) {
                score += 200;
            }

            if (!targetGroup.isEmpty() && fullText.contains(targetGroup)) {
                score += 100;
            }

            if (!category.isEmpty() && fullText.contains(category)) {
                score += 80;
            }

            if (meta.has("tags")) {
                for (JsonNode tagNode : meta.get("tags")) {
                    String tag = tagNode.asText().toLowerCase().trim();
                    if (!tag.isEmpty() && fullText.contains(tag)) {
                        score += 50;
                    }
                }
            }

            if (score >= 50) {
                scores.put(p, score);
            }
        }

        List<ProductDTO> result = scores.entrySet().stream()
                .sorted(Map.Entry.<Product, Long>comparingByValue().reversed())
                .limit(6)
                .map(e -> productMapper.convertToDTO(e.getKey()))
                .collect(Collectors.toList());

        if (result.isEmpty() && !allProducts.isEmpty()) {
            return allProducts.stream()
                    .filter(p -> {
                        String ft = (p.getName() + " " + (p.getDescription() != null ? p.getDescription() : "")).toLowerCase();
                        return (targetGroup.isEmpty() || ft.contains(targetGroup) || !ft.contains("men")) && (color.isEmpty() || ft.contains(color));
                    })
                    .limit(6)
                    .map(productMapper::convertToDTO)
                    .collect(Collectors.toList());
        }

        return result;
    }
}