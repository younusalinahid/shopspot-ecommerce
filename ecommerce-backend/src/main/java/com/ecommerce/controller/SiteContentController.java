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
}
