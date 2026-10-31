package com.ecommerce.controller;

import com.ecommerce.dto.SiteContentDTO;
import com.ecommerce.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/site-content")
@RequiredArgsConstructor
public class SiteContentController {

    private final SiteContentService siteContentService;

    @GetMapping
    public ResponseEntity<SiteContentDTO> getSiteContent() {
        return ResponseEntity.ok(siteContentService.getPublicContent());
    }

    @GetMapping("/logo")
    public ResponseEntity<byte[]> getLogo() {
        com.ecommerce.model.SiteSettings s = siteContentService.getSettings();
        if (s.getLogoData() == null || s.getLogoData().length == 0) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(
                        s.getLogoType() != null ? s.getLogoType() : "image/png"))
                .cacheControl(org.springframework.http.CacheControl.maxAge(java.time.Duration.ofDays(30)).cachePublic())
                .header("X-Content-Type-Options", "nosniff")
                .body(s.getLogoData());
    }
}
