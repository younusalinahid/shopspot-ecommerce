package com.ecommerce.controller.admin;

import com.ecommerce.model.SiteSettings;
import com.ecommerce.service.SiteContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/** Delivery charges: inside Dhaka, outside Dhaka and the free-delivery amount. */
@RestController
@RequestMapping("/api/admin/delivery")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDeliveryController {

    private final SiteContentService siteContentService;

    @GetMapping
    public ResponseEntity<Map<String, Integer>> get() {
        return ResponseEntity.ok(toMap(siteContentService.getSettings()));
    }

    @PutMapping
    public ResponseEntity<Map<String, Integer>> update(@RequestBody Map<String, Integer> body) {
        SiteSettings s = siteContentService.updateDelivery(
                body.get("insideDhaka"), body.get("outsideDhaka"), body.get("freeDeliveryMin"));
        return ResponseEntity.ok(toMap(s));
    }

    private static Map<String, Integer> toMap(SiteSettings s) {
        return Map.of(
                "insideDhaka", s.effectiveDeliveryFeeDhaka(),
                "outsideDhaka", s.effectiveDeliveryFee(),
                "freeDeliveryMin", s.effectiveFreeDeliveryMin());
    }
}
