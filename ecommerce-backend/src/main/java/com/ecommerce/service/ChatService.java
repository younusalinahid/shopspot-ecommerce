package com.ecommerce.service;

import com.ecommerce.dto.ChatRequestDTO;
import com.ecommerce.dto.ChatResponseDTO;
import com.ecommerce.dto.ProductDTO;
import com.ecommerce.mapper.ProductMapper;
import com.ecommerce.model.Product;
import com.ecommerce.model.SiteSettings;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * ShopSpot shopping assistant. Picks the products that match the question (words, price
 * limits, discounts), gives the model real store rules, and returns the linked products
 * so the chat can show them as cards.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url:https://api.groq.com/openai/v1/chat/completions}")
    private String apiUrl;

    @Value("${groq.model:openai/gpt-oss-120b}")
    private String model;

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final ProductMapper productMapper;
    private final SiteContentService siteContentService;

    private final RestTemplate restTemplate = createRestTemplate();

    private static final int MAX_HISTORY = 10;
    private static final int MAX_MESSAGE_CHARS = 1000;
    private static final int MAX_PRODUCTS_IN_CONTEXT = 15;
    private static final int MAX_PRODUCT_CARDS = 6;

    private static final Pattern PRODUCT_LINK = Pattern.compile("\\]\\((\\d+)\\)");
    private static final Pattern UNDER = Pattern.compile(
            "(?:under|below|less than|within|max|maximum|upto|up to|niche|nice|kome|kom|er moddhe|moddhe|এর নিচে|নিচে|কমে|মধ্যে|<)\\s*(?:tk|taka|৳|bdt)?\\s*([0-9][0-9,]*)"
            + "|([0-9][0-9,]*)\\s*(?:tk|taka|৳|bdt|টাকার|টাকা)?\\s*(?:er niche|er nice|niche|nice|er moddhe|moddhe|kome|er kom|এর নিচে|নিচে|এর মধ্যে|মধ্যে|কমে)");
    private static final Pattern OVER = Pattern.compile(
            "(?:over|above|more than|min|minimum|beshi|upore|উপরে|বেশি|>)\\s*(?:tk|taka|৳|bdt)?\\s*([0-9][0-9,]*)"
            + "|([0-9][0-9,]*)\\s*(?:tk|taka|৳|bdt|টাকার|টাকা)?\\s*(?:er upore|upore|er beshi|beshi|এর উপরে|উপরে|এর বেশি|বেশি)");
    private static final Set<String> DISCOUNT_WORDS = Set.of(
            "discount", "discounted", "offer", "offers", "sale", "deal", "deals", "cheap", "chorha", "chhar",
            "char", "ছাড়", "অফার", "ডিসকাউন্ট", "সেল");
    private static final Set<String> STOP_WORDS = Set.of(
            "a", "an", "the", "i", "me", "my", "you", "your", "is", "are", "do", "does", "have", "has", "for",
            "to", "of", "in", "on", "and", "or", "with", "show", "want", "need", "please", "any", "some", "what",
            "which", "can", "get", "find", "buy", "price", "tk", "taka", "under", "below", "above", "over",
            "ami", "amake", "ache", "ace", "ase", "ki", "koto", "dao", "den", "dekhao", "chai", "cai", "er",
            "kono", "ekta", "kichu", "jonno", "theke", "hobe", "kore", "korte", "valo", "bhalo", "aro", "more", "other", "others", "also", "like", "similar",
            "আমি", "আমাকে", "আছে", "কি", "কত", "দাও", "দেখাও", "চাই", "একটা", "কিছু", "জন্য");

    /** Bangla / Banglish words customers use -> words that appear in product names. */
    private static final Map<String, String> SYNONYMS = Map.ofEntries(
            Map.entry("শাড়ি", "saree"), Map.entry("শাড়ী", "saree"), Map.entry("sari", "saree"),
            Map.entry("shari", "saree"), Map.entry("sharee", "saree"), Map.entry("sarees", "saree"),
            Map.entry("পাঞ্জাবি", "punjabi"), Map.entry("panjabi", "punjabi"), Map.entry("কুর্তা", "kurta"),
            Map.entry("কুর্তি", "kurti"), Map.entry("লেহেঙ্গা", "lehenga"), Map.entry("শেরওয়ানি", "sherwani"),
            Map.entry("শারারা", "sharara"), Map.entry("গাউন", "gown"), Map.entry("জামদানি", "jamdani"),
            Map.entry("বেনারসি", "banarasi"), Map.entry("benarasi", "banarasi"), Map.entry("ওড়না", "dupatta"),
            Map.entry("orna", "dupatta"), Map.entry("urna", "dupatta"), Map.entry("শাল", "shawl"),
            Map.entry("বাচ্চা", "kid"), Map.entry("baccha", "kid"), Map.entry("bacchader", "kid"),
            Map.entry("ছেলে", "men"), Map.entry("chele", "men"), Map.entry("meye", "women"), Map.entry("মেয়ে", "women"),
            Map.entry("biye", "wedding"), Map.entry("বিয়ে", "wedding"), Map.entry("eid", "festival"));

    /** Words that also cover whole groups, e.g. most "Traditional Fabrics" items are sarees. */
    private static final Map<String, List<String>> GROUP_WORDS = Map.of(
            "saree", List.of("traditional fabrics", "saree", "khadi", "banarasi", "jamdani", "kanjeevaram",
                    "chanderi", "chikankari", "muslin", "rajshahi"),
            "wedding", List.of("festival & wedding", "bridal", "lehenga", "sherwani"),
            "kid", List.of("kid"));

    private static RestTemplate createRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(45_000);
        return new RestTemplate(factory);
    }

    @Transactional(readOnly = true)
    public ChatResponseDTO chat(ChatRequestDTO request) {
        List<ChatRequestDTO.MessageDTO> history = cleanHistory(request);
        if (history.isEmpty()) {
            return ChatResponseDTO.builder().message("Please type a question. 🙂").products(List.of()).build();
        }
        String last = history.get(history.size() - 1).getContent();

        List<Product> active = productRepository.findByActiveTrue();
        String systemPrompt;
        if (last.startsWith("SYSTEM_CART_TRIGGER:")) {
            systemPrompt = cartSuggestionPrompt(last.substring("SYSTEM_CART_TRIGGER:".length()).trim(), active);
            history = List.of(history.get(history.size() - 1));
        } else {
            // The previous user question helps follow-ups like "aro dekhao" / "show cheaper ones"
            String query = history.stream()
                    .filter(m -> "user".equals(m.getRole()))
                    .map(ChatRequestDTO.MessageDTO::getContent)
                    .reduce((a, b) -> a + " " + b).orElse(last);
            systemPrompt = storePrompt(last, query, active);
        }

        if (apiKey == null || apiKey.isBlank() || "dummy".equals(apiKey)) {
            return ChatResponseDTO.builder()
                    .message("The AI assistant is not configured yet. Please contact us using the details in the footer.")
                    .products(List.of()).build();
        }

        try {
            String text = callModel(systemPrompt, history);
            return ChatResponseDTO.builder().message(text).products(linkedProducts(text, active)).build();
        } catch (Exception e) {
            log.warn("Chat model call failed: {}", e.getMessage());
            return ChatResponseDTO.builder()
                    .message("Sorry, I couldn't answer right now. Please try again in a moment! 😔")
                    .products(List.of()).build();
        }
    }

    // ---------------------------------------------------------------- model call

    @SuppressWarnings({"rawtypes", "unchecked"})
    private String callModel(String systemPrompt, List<ChatRequestDTO.MessageDTO> history) {
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        for (ChatRequestDTO.MessageDTO m : history) {
            messages.add(Map.of("role", "assistant".equals(m.getRole()) ? "assistant" : "user", "content", m.getContent()));
        }

        Map<String, Object> body = new HashMap<>();
        body.put("model", model);
        body.put("messages", messages);
        body.put("max_tokens", 900);
        body.put("temperature", 0.4);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(body, headers), Map.class);
        Map res = response.getBody();
        List choices = res == null ? null : (List) res.get("choices");
        if (choices == null || choices.isEmpty()) throw new IllegalStateException("No answer from model");
        Map message = (Map) ((Map) choices.get(0)).get("message");
        String text = message == null ? null : (String) message.get("content");
        if (text == null || text.isBlank()) throw new IllegalStateException("Empty answer from model");
        return text.trim();
    }

    private List<ChatRequestDTO.MessageDTO> cleanHistory(ChatRequestDTO request) {
        if (request == null || request.getMessages() == null) return List.of();
        List<ChatRequestDTO.MessageDTO> out = request.getMessages().stream()
                .filter(m -> m != null && m.getContent() != null && !m.getContent().isBlank())
                .map(m -> {
                    ChatRequestDTO.MessageDTO c = new ChatRequestDTO.MessageDTO();
                    c.setRole("assistant".equals(m.getRole()) ? "assistant" : "user");
                    String t = m.getContent().trim();
                    c.setContent(t.length() > MAX_MESSAGE_CHARS ? t.substring(0, MAX_MESSAGE_CHARS) : t);
                    return c;
                })
                .collect(Collectors.toList());
        // Drop leading assistant greetings and keep only the recent turns
        while (!out.isEmpty() && "assistant".equals(out.get(0).getRole())) out.remove(0);
        if (out.size() > MAX_HISTORY) out = new ArrayList<>(out.subList(out.size() - MAX_HISTORY, out.size()));
        while (!out.isEmpty() && "assistant".equals(out.get(0).getRole())) out.remove(0);
        if (!out.isEmpty() && !"user".equals(out.get(out.size() - 1).getRole())) return List.of();
        return out;
    }

    // ---------------------------------------------------------------- product search

    /** Most relevant products for the question, using words, price limits and discount intent. */
    List<Product> relevantProducts(String latest, String query, List<Product> active) {
        String q = normalizeDigits(query.toLowerCase(Locale.ROOT));
        String l = normalizeDigits(latest.toLowerCase(Locale.ROOT));
        Integer max = firstNumber(UNDER.matcher(l));
        Integer min = firstNumber(OVER.matcher(l));
        Set<String> latestWords = new HashSet<>(Arrays.asList(l.split("[^\\p{L}\\p{N}]+")));
        // whole words only, so "charge" is not read as "char" (discount)
        boolean wantsDiscount = DISCOUNT_WORDS.stream().anyMatch(latestWords::contains)
                || l.contains("ছাড়") || l.contains("অফার");

        Set<String> words = Arrays.stream(q.split("[^\\p{L}\\p{M}\\p{N}]+"))
                .filter(t -> t.length() > 1 && !STOP_WORDS.contains(t) && !t.chars().allMatch(Character::isDigit))
                .map(t -> SYNONYMS.getOrDefault(t, t))
                .collect(Collectors.toCollection(LinkedHashSet::new));

        record Scored(Product p, int score, boolean wordMatch) { }
        List<Scored> scored = new ArrayList<>();
        for (Product p : active) {
            int price = p.calculateSellingPrice();
            if (max != null && price > max) continue;
            if (min != null && price < min) continue;
            if (wantsDiscount && p.getDiscountPercent() <= 0) continue;
            String name = lower(p.getName());
            String sub = p.getSubCategory() != null ? lower(p.getSubCategory().getName()) : "";
            String cat = p.getSubCategory() != null && p.getSubCategory().getCategory() != null
                    ? lower(p.getSubCategory().getCategory().getName()) : "";
            String desc = lower(p.getDescription());
            int score = 0;
            boolean wordMatch = false;
            for (String w : words) {
                String stem = w.length() > 3 && w.endsWith("s") ? w.substring(0, w.length() - 1) : w;
                boolean inName = hits(name, stem), inSub = hits(sub, stem), inCat = hits(cat, stem);
                if (inName) score += 4;
                if (inSub) score += 3;
                if (inCat) score += 2;
                if (hits(desc, stem)) score += 1;
                if (inName || inSub || inCat) wordMatch = true;
                for (String group : GROUP_WORDS.getOrDefault(stem, List.of())) {
                    if (sub.contains(group) || cat.contains(group)) {
                        score += 2;
                        wordMatch = true;
                        break;
                    }
                }
            }
            if (p.getStockQuantity() > 0) score += 1;
            if (p.getDiscountPercent() > 0) score += 1;
            boolean filtered = max != null || min != null || wantsDiscount;
            if (score > 2 || filtered) scored.add(new Scored(p, score, wordMatch));
        }
        // If some products match what was asked for (e.g. "saree"), don't pad the list with other items
        if (scored.stream().anyMatch(Scored::wordMatch)) {
            scored.removeIf(x -> !x.wordMatch());
        }
        scored.sort(Comparator.comparingInt(Scored::score).reversed()
                .thenComparing(s -> s.p().getCreatedAt() != null ? s.p().getCreatedAt() : Instant.EPOCH, Comparator.reverseOrder()));
        List<Product> result = scored.stream().map(Scored::p).limit(MAX_PRODUCTS_IN_CONTEXT).collect(Collectors.toList());

        if (result.isEmpty()) {
            // Nothing specific: give a small, useful mix (discounted first, then newest in stock)
            result = active.stream()
                    .sorted(Comparator.comparingInt(Product::getDiscountPercent).reversed()
                            .thenComparing(p -> p.getCreatedAt() != null ? p.getCreatedAt() : Instant.EPOCH, Comparator.reverseOrder()))
                    .sorted(Comparator.comparing((Product p) -> p.getStockQuantity() <= 0))
                    .limit(10)
                    .collect(Collectors.toList());
        }
        return result;
    }

    private List<ProductDTO> linkedProducts(String text, List<Product> active) {
        Map<Long, Product> byId = active.stream().collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));
        LinkedHashSet<Long> ids = new LinkedHashSet<>();
        Matcher m = PRODUCT_LINK.matcher(text);
        while (m.find() && ids.size() < MAX_PRODUCT_CARDS) {
            try {
                ids.add(Long.parseLong(m.group(1)));
            } catch (NumberFormatException ignored) {
                // not a product id
            }
        }
        return ids.stream().map(byId::get).filter(Objects::nonNull).map(productMapper::convertToDTO).collect(Collectors.toList());
    }

    // ---------------------------------------------------------------- prompts

    private String storePrompt(String latest, String query, List<Product> active) {
        List<Product> products = relevantProducts(latest, query, active);
        String productLines = products.stream().map(this::describe).collect(Collectors.joining("\n"));
        String categories = categoryRepository.findAll().stream()
                .map(c -> c.getName() + " (category id " + c.getId() + ")")
                .collect(Collectors.joining(", "));
        SiteSettings s = siteContentService.getSettings();
        String storeName = s.getStoreName() != null ? s.getStoreName() : "ShopSpot";
        String contact = (s.getContactPhone() != null ? "phone " + s.getContactPhone() : "")
                + (s.getContactEmail() != null ? ", email " + s.getContactEmail() : "")
                + (s.getContactAddress() != null ? ", address " + s.getContactAddress() : "");

        return """
                You are the friendly shopping assistant of %s, an online clothing store in Bangladesh
                (sarees, festive & wedding wear, fusion wear, men's, women's and kids' wear, fabrics).

                LANGUAGE
                - Reply in the same language and script as the customer's latest message:
                  English -> English; Bangla script -> Bangla script;
                  Banglish (Bangla written in English letters, e.g. "saree dekhao 3000 er niche") -> Banglish.
                - Never switch language unless the customer does.

                STYLE
                - Warm, short and helpful: usually 2-6 short lines. No long paragraphs.
                - Use "•" bullets for lists, one product per line, and **bold** for key words or prices.
                - Prices as ৳ with commas, e.g. ৳21,590. Mention the discount when there is one.
                - End with one short follow-up question or suggestion when it helps.

                LINKS (very important)
                - Product: [Product name](PRODUCT_ID)  e.g. [Blue Khadi Silk](79)
                - Category page: [Category name](category:CATEGORY_ID)
                - Search: [See all](search:keyword)
                - Only link products listed below. Never invent products, prices, stock or discounts.
                - Never recommend an out-of-stock product as available; you may say it is out of stock.

                STORE RULES (answer with these facts)
                - Delivery: all over Bangladesh in about 3-5 business days.
                - Delivery charge: ৳120 per order, FREE when the order subtotal is above ৳2,000.
                - Payment: Cash on Delivery or card (online). Guests can order without an account.
                - Returns: within 7 days if the item is damaged, defective or wrong; unused with tags.
                - Order status: customers see it in "My Orders" (guests in the order confirmation email/page).
                - Contact: %s
                - If you don't know something (e.g. sizes not listed), say so and suggest contacting us.

                CATEGORIES: %s

                PRODUCTS THAT MATCH THIS QUESTION (id | name | price | discount | stock | category):
                %s
                """.formatted(storeName, contact.isBlank() ? "see the website footer" : contact.replaceFirst("^, ", ""),
                categories, productLines.isBlank() ? "(no matching products)" : productLines);
    }

    private String cartSuggestionPrompt(String productName, List<Product> active) {
        Product added = active.stream()
                .filter(p -> p.getName() != null && p.getName().equalsIgnoreCase(productName))
                .findFirst().orElse(null);
        List<Product> similar = new ArrayList<>();
        if (added != null && added.getSubCategory() != null) {
            Long subId = added.getSubCategory().getId();
            similar = active.stream()
                    .filter(p -> !p.getId().equals(added.getId()) && p.getStockQuantity() > 0
                            && p.getSubCategory() != null && subId.equals(p.getSubCategory().getId()))
                    .limit(3).collect(Collectors.toList());
        }
        String keyword = added != null && added.getSubCategory() != null
                ? added.getSubCategory().getName() : productName.split(" ")[0];
        return """
                You are the shopping assistant of an online clothing store in Bangladesh.
                The customer just added "%s" to the cart.
                Write 1-2 short, warm sentences: congratulate the choice and suggest up to 2 matching items
                from this list (link them as [name](id)), or the collection link [See more](search:%s).
                Reply in English unless the product name is in Bangla script.
                Similar items: %s
                """.formatted(productName, keyword,
                similar.isEmpty() ? "(none)" : similar.stream().map(this::describe).collect(Collectors.joining("; ")));
    }

    private String describe(Product p) {
        int price = p.calculateSellingPrice();
        String cat = p.getSubCategory() == null ? "" : p.getSubCategory().getName()
                + (p.getSubCategory().getCategory() != null ? " / " + p.getSubCategory().getCategory().getName() : "");
        return p.getId() + " | " + p.getName() + " | ৳" + String.format("%,d", price)
                + (p.getDiscountPercent() > 0 ? " | " + p.getDiscountPercent() + "% off (was ৳" + String.format("%,d", p.getPrice()) + ")" : " | no discount")
                + " | " + (p.getStockQuantity() > 0 ? "in stock" : "OUT OF STOCK")
                + " | " + cat;
    }

    // ---------------------------------------------------------------- helpers

    private static String lower(String s) {
        // drop apostrophes so "Kid's wear" matches "kids"
        return s == null ? "" : s.toLowerCase(Locale.ROOT).replace("'", "").replace("’", "");
    }

    /** Word-start match ("kid" hits "kids", but "aro" does not hit "maroon"); long words may match inside. */
    private static boolean hits(String text, String stem) {
        if (text.isEmpty() || stem.isEmpty()) return false;
        for (String token : text.split("[^\\p{L}\\p{M}\\p{N}]+")) {
            if (token.startsWith(stem) || (stem.length() >= 5 && token.contains(stem))) return true;
        }
        return false;
    }

    /** Bangla digits ০-৯ -> 0-9 so "৩০০০" works like "3000". */
    private static String normalizeDigits(String s) {
        StringBuilder b = new StringBuilder(s.length());
        for (char ch : s.toCharArray()) {
            b.append(ch >= '\u09E6' && ch <= '\u09EF' ? (char) ('0' + (ch - '\u09E6')) : ch);
        }
        return b.toString();
    }

    private static Integer firstNumber(Matcher m) {
        if (!m.find()) return null;
        String g = m.group(1) != null ? m.group(1) : m.group(2);
        try {
            return g == null ? null : Integer.parseInt(g.replace(",", ""));
        } catch (NumberFormatException e) {
            return null;
        }
    }
}
