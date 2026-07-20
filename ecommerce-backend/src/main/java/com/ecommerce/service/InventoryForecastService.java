package com.ecommerce.service;

import com.ecommerce.dto.ProductSalesDataDTO;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class InventoryForecastService {

    @Value("${ai.api.url}")
    private String aiApiUrl;

    @Value("${groq.api.key}")
    private String aiApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getInventoryAlerts(List<ProductSalesDataDTO> productsData) {
        try {
            String salesDataJson = objectMapper.writeValueAsString(productsData);

            String systemPrompt = "You are an expert E-commerce Inventory Planner. Analyze the sales data from the past 3 months and current stock level to predict demand for the NEXT MONTH. Identify which products are trending UPwards and are at high risk of running out of stock next month. Return STRICTLY a JSON array of objects with fields: 'productId', 'productName', 'predictedDemandStatus' (HIGH/MEDIUM), 'recommendedStockToOrder', 'reason'. Do not return any markdown, code blocks, or explanations. Just raw JSON.";

            String userPrompt = "Here is the sales and stock data:\n" + salesDataJson;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "openai/gpt-oss-120b");

            requestBody.put("temperature", 0.0);
            requestBody.put("top_p", 0.0);
            requestBody.put("seed", 42);

            requestBody.put("messages", List.of(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(aiApiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = restTemplate.postForEntity(aiApiUrl, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> responseMap = objectMapper.readValue(response.getBody(), Map.class);
                List<Map<String, Object>> choices = (List<Map<String, Object>>) responseMap.get("choices");
                Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");

                return (String) message.get("content");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\": \"Failed to generate forecast: " + e.getMessage() + "\"}";
        }
        return "{\"error\": \"Unknown error occurred\"}";
    }
}