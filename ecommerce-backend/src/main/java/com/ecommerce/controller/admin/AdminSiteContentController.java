package com.ecommerce.controller.admin;

import com.ecommerce.dto.SiteContentDTO;
import com.ecommerce.model.InfoPage;
import com.ecommerce.model.SiteSettings;
import com.ecommerce.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/site-content")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSiteContentController {

    private final SiteContentService siteContentService;

    @GetMapping
    public ResponseEntity<SiteContentDTO> getAll() {
        return ResponseEntity.ok(siteContentService.getAdminContent());
    }

    @PutMapping("/settings")
    public ResponseEntity<SiteSettings> updateSettings(@RequestBody SiteSettings settings) {
        return ResponseEntity.ok(siteContentService.updateSettings(settings));
    }

    @PutMapping(value = "/logo", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<SiteSettings> uploadLogo(
            @RequestParam("logoFile") org.springframework.web.multipart.MultipartFile logoFile)
            throws java.io.IOException {
        return ResponseEntity.ok(siteContentService.updateLogo(logoFile));
    }

    @DeleteMapping("/logo")
    public ResponseEntity<SiteSettings> removeLogo() {
        return ResponseEntity.ok(siteContentService.removeLogo());
    }

    @PutMapping("/pages/{slug}")
    public ResponseEntity<InfoPage> updatePage(@PathVariable String slug, @RequestBody InfoPage page) {
        return ResponseEntity.ok(siteContentService.updatePage(slug, page));
    }
}
