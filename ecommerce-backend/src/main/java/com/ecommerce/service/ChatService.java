package com.ecommerce.service;

import com.ecommerce.dto.ChatRequestDTO;
import com.ecommerce.dto.ChatResponseDTO;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

    public ChatResponseDTO chat(ChatRequestDTO request) {
        try {
            String userMessage = "";
            if (request.getMessages() != null && !request.getMessages().isEmpty()) {
                userMessage = request.getMessages().get(request.getMessages().size() - 1).getContent();
            }

            String storeContext = buildStoreContext(userMessage);
            List<Map<String, String>> messages = new ArrayList<>();
            messages.add(Map.of("role", "system", "content", storeContext));

            if (request.getMessages() != null) {
                request.getMessages().forEach(msg ->
                        messages.add(Map.of(
                                "role", "assistant".equals(msg.getRole()) ? "assistant" : "user",
                                "content", msg.getContent()
                        ))
                );
            }

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.3-70b-versatile");
            requestBody.put("messages", messages);
            requestBody.put("max_tokens", 500);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(
                    GROQ_URL, entity, Map.class
            );

            Map body = response.getBody();
            List choices = (List) body.get("choices");
            Map choice = (Map) choices.get(0);
            Map message = (Map) choice.get("message");
            String text = (String) message.get("content");

            return ChatResponseDTO.builder().message(text).build();

        } catch (Exception e) {
            System.err.println("Groq Chat Error: " + e.getMessage());
            e.printStackTrace();
            return ChatResponseDTO.builder()
                    .message("Sorry, something went wrong. Please try again! 😔")
                    .build();
        }
    }

    private String buildStoreContext(String userMessage) {

        List<com.ecommerce.model.Product> matchedProducts = productRepository.findByActiveTrue().stream()
                .limit(5)
                .collect(Collectors.toList());

        if (userMessage != null && !userMessage.isEmpty()) {
            List<com.ecommerce.model.Product> allActiveProducts = productRepository.findByActiveTrue();
            for (com.ecommerce.model.Product p : allActiveProducts) {
                if (p.getName() != null && userMessage.toLowerCase().contains(p.getName().toLowerCase())) {
                    if (!matchedProducts.contains(p)) {
                        matchedProducts.add(p);
                    }
                }
            }
        }

        String productsInfo = matchedProducts.stream()
                .map(p -> {
                    String info = p.getName() + " (Regular Price: " + p.getPrice() + " Tk)";

                    if (p.getDiscountPercent() > 0) {
                        int discountAmount = (p.getPrice() * p.getDiscountPercent()) / 100;
                        int finalPrice = p.getPrice() - discountAmount;

                        info += " [Discount: " + p.getDiscountPercent() + "% OFF! Current Price: " + finalPrice + " Tk]";
                    }
                    return info;
                })
                .collect(Collectors.joining(", "));

        String categories = categoryRepository.findAll().stream()
                .map(c -> c.getName())
                .collect(Collectors.joining(", "));

        return "You are an AI customer support assistant for ShopSpot, an e-commerce store in Bangladesh.\n\n" +
                "STRICT LANGUAGE SYSTEM DICTUM:\n" +
                "- Identify the language of the user's latest input message.\n" +
                "- Respond in the exact language the user uses.\n" +
                "- If the user says 'Hello', 'hi', or writes in English, you MUST reply ONLY in English.\n" +
                "- If the user writes in Bengali, you MUST reply ONLY in Bengali.\n" +
                "- NEVER mix languages.\n\n" +
                "Store Catalog:\n" +
                "- Categories: " + categories + "\n" +
                "- Products Details: " + productsInfo + "\n" +
                "- Delivery: 2-3 days\n" +
                "- Policy: 7 days returns.\n\n" +
                "Be brief and polite. If a product has a [Discount: X% OFF], always highlight the discount and tell the customer the final current price. Never make up discounts on your own.";
    }
}