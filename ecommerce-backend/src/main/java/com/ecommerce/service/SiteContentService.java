package com.ecommerce.service;

import com.ecommerce.dto.SiteContentDTO;
import com.ecommerce.model.InfoPage;
import com.ecommerce.model.SiteSettings;
import com.ecommerce.repository.InfoPageRepository;
import com.ecommerce.repository.SiteSettingsRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
@Slf4j
public class SiteContentService {

    private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final int MAX_PAGE_CONTENT = 10_000;

    private final SiteSettingsRepository settingsRepository;
    private final InfoPageRepository pageRepository;
    private final ObjectMapper objectMapper;

    /** First start: fill the tables from site-content-defaults.json so the footer is never empty. */
    @EventListener(ApplicationReadyEvent.class)
    public void seedDefaults() {
        try (InputStream in = new ClassPathResource("site-content-defaults.json").getInputStream()) {
            JsonNode root = objectMapper.readTree(in);
            if (!settingsRepository.existsById(1L)) {
                SiteSettings s = objectMapper.treeToValue(root.get("settings"), SiteSettings.class);
                s.setId(1L);
                settingsRepository.save(s);
                log.info("Seeded default site settings");
            }
            for (JsonNode node : root.get("pages")) {
                String slug = node.get("slug").asText();
                if (pageRepository.existsById(slug)) continue;
                try {
                    InfoPage page = objectMapper.treeToValue(node, InfoPage.class);
                    page.setVisible(true);
                    page.setUpdatedAt(LocalDateTime.now());
                    pageRepository.save(page);
                } catch (Exception e) {
                    log.warn("Could not seed info page {}: {}", slug, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Could not seed site content: {}", e.getMessage());
        }
    }

    public SiteSettings getSettings() {
        return settingsRepository.findById(1L).orElseGet(SiteSettings::new);
    }

    public SiteContentDTO getPublicContent() {
        return new SiteContentDTO(getSettings(), pageRepository.findAllByVisibleTrueOrderBySectionAscSortOrderAsc());
    }

    public SiteContentDTO getAdminContent() {
        return new SiteContentDTO(getSettings(), pageRepository.findAllByOrderBySectionAscSortOrderAsc());
    }

    @Transactional
    public SiteSettings updateSettings(SiteSettings in) {
        SiteSettings s = getSettings();
        s.setId(1L);
        s.setStoreName(required(in.getStoreName(), "Store name", 100));
        s.setTagline(optional(in.getTagline(), "Tagline", 500));
        s.setContactAddress(optional(in.getContactAddress(), "Address", 255));
        String email = optional(in.getContactEmail(), "Email", 120);
        if (email != null && !EMAIL.matcher(email).matches()) {
            throw new IllegalArgumentException("Contact email is not valid");
        }
        s.setContactEmail(email);
        String phone = optional(in.getContactPhone(), "Phone", 30);
        if (phone != null && !phone.matches("[+0-9 ()-]{5,30}")) {
            throw new IllegalArgumentException("Phone may contain only digits, spaces, +, - and brackets");
        }
        s.setContactPhone(phone);
        s.setFacebookUrl(url(in.getFacebookUrl(), "Facebook"));
        s.setInstagramUrl(url(in.getInstagramUrl(), "Instagram"));
        s.setTwitterUrl(url(in.getTwitterUrl(), "X / Twitter"));
        s.setWhatsappUrl(url(in.getWhatsappUrl(), "WhatsApp"));
        s.setTelegramUrl(url(in.getTelegramUrl(), "Telegram"));
        s.setYoutubeUrl(url(in.getYoutubeUrl(), "YouTube"));
        s.setTiktokUrl(url(in.getTiktokUrl(), "TikTok"));
        s.setCopyrightText(optional(in.getCopyrightText(), "Copyright text", 200));
        return settingsRepository.save(s);
    }

    @Transactional
    public SiteSettings updateLogo(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        byte[] bytes = com.ecommerce.util.ImageValidator.readImage(file, 2L * 1024 * 1024);
        SiteSettings s = getSettings();
        s.setId(1L);
        if (s.getStoreName() == null) s.setStoreName("ShopSpot Online");
        s.setLogoData(bytes);
        s.setLogoType(com.ecommerce.util.ImageValidator.contentType(bytes));
        s.setLogoVersion(System.currentTimeMillis());
        return settingsRepository.save(s);
    }

    @Transactional
    public SiteSettings removeLogo() {
        SiteSettings s = getSettings();
        s.setLogoData(null);
        s.setLogoType(null);
        s.setLogoVersion(System.currentTimeMillis());
        return settingsRepository.save(s);
    }

    @Transactional
    public InfoPage updatePage(String slug, InfoPage in) {
        InfoPage page = pageRepository.findById(slug)
                .orElseThrow(() -> new IllegalArgumentException("Page not found"));
        page.setTitle(required(in.getTitle(), "Title", 100));
        String content = in.getContent() == null ? "" : in.getContent().trim();
        if (content.isEmpty()) throw new IllegalArgumentException("Content is required");
        if (content.length() > MAX_PAGE_CONTENT) {
            throw new IllegalArgumentException("Content must be at most " + MAX_PAGE_CONTENT + " characters");
        }
        page.setContent(content);
        page.setVisible(in.isVisible());
        page.setUpdatedAt(LocalDateTime.now());
        return pageRepository.save(page);
    }

    private static String required(String v, String field, int max) {
        String t = optional(v, field, max);
        if (t == null) throw new IllegalArgumentException(field + " is required");
        return t;
    }

    private static String optional(String v, String field, int max) {
        if (v == null || v.isBlank()) return null;
        String t = v.trim();
        if (t.length() > max) throw new IllegalArgumentException(field + " must be at most " + max + " characters");
        return t;
    }

    /** Only plain http(s) links are stored, so a "javascript:" URL can never reach the footer. */
    private static String url(String v, String field) {
        String t = optional(v, field + " link", 500);
        if (t == null) return null;
        String lower = t.toLowerCase();
        if (!(lower.startsWith("https://") || lower.startsWith("http://")) || t.contains(" ")) {
            throw new IllegalArgumentException(field + " link must start with https://");
        }
        return t;
    }
}
